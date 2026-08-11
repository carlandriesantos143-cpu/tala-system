import type { SymptomCluster, ClusterQuestion, Urgency } from "./types";
import { effectiveUrgency, isVisibleForAge } from "./types";

// Ang resulta ng paglalakad sa decision tree ng isang cluster.
export interface ClusterWalk {
  // Mga nasagot nang tanong sa daan (sunod-sunod), kasama ang sagot.
  path: { question: ClusterQuestion; answer: boolean }[];
  // Susunod na HINDI PA nasasagot na tanong (o null kung terminal/wala na).
  current: ClusterQuestion | null;
  // Urgency outcome kung nakarating sa isang "result" na dulo (o null).
  terminal: Urgency | null;
  started: boolean;  // may kahit isang sagot na sa daan
  complete: boolean; // nakarating na sa terminal
}

/**
 * Nilalakad ang decision tree ng isang cluster batay sa mga sagot ng residente.
 *
 * Semantics (tugma sa admin editor):
 *   - Entry = unang tanong na NAKIKITA sa napiling edad.
 *   - Bawat sagot ay sumusunod sa branch.target:
 *       * "result"   → tapos ang cluster; outcome = effectiveUrgency(branch, edad).
 *       * "question" → dumiretso sa tinukoy na tanong.
 *   - Dangling / loop / naka-hide-para-sa-edad na target → LIGTAS na terminal sa
 *     effective urgency ng branch (walang stuck na estado; nililinaw rin ito ng
 *     validation lint sa admin editor).
 *
 * Pure function — walang side effects, madaling i-unit-test.
 */
export function walkCluster(
  cluster: SymptomCluster,
  answers: Record<number, boolean>,
  ageId: number | null,
): ClusterWalk {
  const visible = cluster.questions.filter((q) =>
    isVisibleForAge(q.ageGroupIds, ageId),
  );
  const byId = new Map(visible.map((q) => [q.id, q]));
  const path: { question: ClusterQuestion; answer: boolean }[] = [];
  const seen = new Set<number>();

  let node: ClusterQuestion | undefined = visible[0];

  while (node) {
    const ans = answers[node.id];
    if (ans === undefined) {
      // Hihinto sa unang hindi pa nasasagot na tanong.
      return { path, current: node, terminal: null, started: path.length > 0, complete: false };
    }

    path.push({ question: node, answer: ans });
    seen.add(node.id);

    const branch = ans ? node.yesBranch : node.noBranch;

    // Result target (o anumang hindi "question") → terminal.
    if (branch.target?.type !== "question") {
      return {
        path,
        current: null,
        terminal: effectiveUrgency(branch, ageId),
        started: true,
        complete: true,
      };
    }

    // Question target: sundan — pero mag-terminate nang ligtas kung dangling/loop/hidden.
    const next = byId.get(branch.target.questionId);
    if (!next || seen.has(next.id)) {
      return {
        path,
        current: null,
        terminal: effectiveUrgency(branch, ageId),
        started: true,
        complete: true,
      };
    }
    node = next;
  }

  // Walang tanong na nakikita para sa edad na ito.
  return { path, current: null, terminal: null, started: false, complete: false };
}
