import type { TriageFlowData, Urgency, ClusterQuestion } from "./types";
import { isVisibleForAge } from "./types";

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  level: IssueLevel;
  message: string;
  step?: number; // 1–5: aling editor step ang puntahan para ayusin
}

const trunc = (s: string, n = 34) =>
  s.length > n ? s.slice(0, n) + "…" : s;

/**
 * Sinusuri ang buong triage config bago i-save. Ibinabalik ang listahan ng
 * mga isyu. Ang "error" ay bumabara sa pag-save (masisira ang resident flow);
 * ang "warning" ay pwedeng i-save pero dapat ipaalam sa admin.
 * Pure function — walang side effects, madaling i-unit-test.
 */
export function validateTriageConfig(data: TriageFlowData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const enabledAges = data.ageGroups.filter((a) => a.enabled);
  const knownAgeIds = new Set(data.ageGroups.map((a) => a.id));
  const enabledAgeIds = new Set(enabledAges.map((a) => a.id));
  const resultUrgencies = new Set(data.resultConfigs.map((r) => r.urgency));

  // ── Step 1: Disclaimer ────────────────────────────────────
  if (!data.disclaimer || !data.disclaimer.trim()) {
    issues.push({ level: "warning", message: "Walang disclaimer text na nakalagay.", step: 1 });
  }

  // ── Step 2: Age groups ────────────────────────────────────
  if (enabledAges.length === 0) {
    issues.push({
      level: "error",
      message: "Walang naka-enable na age group — hindi makakapag-proceed ang residente sa Step 2.",
      step: 2,
    });
  }

  // ── Step 5: Result configs ────────────────────────────────
  if (!resultUrgencies.has("Emergency")) {
    issues.push({
      level: "error",
      message: "Walang 'Emergency' na result config — mababalangko ang result screen kapag may na-detect na red flag.",
      step: 5,
    });
  }
  (["Urgent", "Semi-Urgent", "Non-Urgent"] as Urgency[]).forEach((u) => {
    if (!resultUrgencies.has(u)) {
      issues.push({
        level: "warning",
        message: `Walang '${u}' na result config — gagamit ng generic na "consult BHW" fallback.`,
        step: 5,
      });
    }
  });

  // ── Step 4: Symptom clusters ──────────────────────────────
  if (data.symptomClusters.length === 0) {
    issues.push({
      level: "error",
      message: "Walang symptom category — walang assessment na tatakbo sa Step 4.",
      step: 4,
    });
  }

  const checkAgeRefs = (ids: number[] | undefined, ctx: string) => {
    for (const gid of ids ?? []) {
      if (!knownAgeIds.has(gid)) {
        issues.push({ level: "warning", message: `${ctx} ay tumutukoy sa age group na wala na.`, step: 4 });
      } else if (!enabledAgeIds.has(gid)) {
        issues.push({ level: "warning", message: `${ctx} ay tumutukoy sa naka-disable na age group.`, step: 4 });
      }
    }
  };

  for (const c of data.symptomClusters) {
    if (c.questions.length === 0) {
      issues.push({ level: "warning", message: `Category "${c.name}" ay walang tanong.`, step: 4 });
    }
    checkAgeRefs(c.ageGroupIds, `Category "${c.name}"`);

    const qIds = new Set(c.questions.map((q) => q.id));
    for (const q of c.questions) {
      checkAgeRefs(q.ageGroupIds, `Tanong "${trunc(q.question)}"`);

      const branches: [string, ClusterQuestion["yesBranch"]][] = [
        ["Yes", q.yesBranch],
        ["No", q.noBranch],
      ];
      for (const [name, b] of branches) {
        if (b.target?.type === "question") {
          if (!qIds.has(b.target.questionId)) {
            issues.push({
              level: "warning",
              message: `Sa "${c.name}", ang ${name}-branch ng "${trunc(q.question)}" ay naka-link sa tanong na wala na.`,
              step: 4,
            });
          } else if (b.target.questionId === q.id) {
            issues.push({
              level: "warning",
              message: `Sa "${c.name}", ang ${name}-branch ng "${trunc(q.question)}" ay naka-link sa sarili nito (loop).`,
              step: 4,
            });
          }
        }
        for (const esc of b.ageEscalations ?? []) {
          if (esc.ageGroupIds.length === 0) {
            issues.push({
              level: "warning",
              message: `Sa "${c.name}", may age escalation na walang piniling edad — walang epekto ito.`,
              step: 4,
            });
          }
          checkAgeRefs(esc.ageGroupIds, `Escalation sa "${c.name}"`);
        }
      }
    }
  }

  // ── Age dead-end lint: bawat enabled age ay may kahit isang tanong ──
  if (data.symptomClusters.length > 0) {
    for (const ag of enabledAges) {
      const hasAny = data.symptomClusters.some(
        (c) =>
          isVisibleForAge(c.ageGroupIds, ag.id) &&
          c.questions.some((q) => isVisibleForAge(q.ageGroupIds, ag.id)),
      );
      if (!hasAny) {
        issues.push({
          level: "warning",
          message: `Age group "${ag.label}" ay walang applicable na tanong — makikita ng residente ang "consult BHW" na fallback.`,
          step: 4,
        });
      }
    }
  }

  // Dedup ng magkakaparehong mensahe para malinis ang panel.
  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.level}|${i.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
