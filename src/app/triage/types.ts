export type Urgency = "Emergency" | "Urgent" | "Semi-Urgent" | "Non-Urgent";

export interface AgeGroup {
  id: number;
  label: string;
  rangeDesc: string;
  enabled: boolean;
}

export interface UserType {
  id: number;
  label: string;
  description: string;
  enabled: boolean;
}

export interface RedFlag {
  id: number;
  symptom: string;
  severity: "Critical" | "High";
  instruction: string;
}

export type BranchTarget =
  | { type: "result"; urgency: Urgency }
  | { type: "question"; questionId: number };

// Age-based urgency override. Ang isang branch ay maaaring MAGTAAS ng urgency
// para sa mga vulnerable na edad (hal. lagnat sa newborn). SAFETY: ito ay
// nagtataas LAMANG — hindi kailanman nagpapababa (tingnan ang effectiveUrgency).
export interface AgeEscalation {
  ageGroupIds: number[];
  urgency: Urgency;
}

export interface BranchOutcome {
  label: string;
  urgency: Urgency;
  action: string;
  target: BranchTarget;
  // OPTIONAL — kung wala, base urgency lang ang gagamitin (backward-compatible).
  ageEscalations?: AgeEscalation[];
}

export interface ClusterQuestion {
  id: number;
  question: string;
  // OPTIONAL — kung wala/empty, ipapakita sa LAHAT ng edad (backward-compatible).
  ageGroupIds?: number[];
  yesBranch: BranchOutcome;
  noBranch: BranchOutcome;
}

export interface SymptomCluster {
  id: number;
  name: string;
  description: string;
  // OPTIONAL — kung wala/empty, ipapakita sa LAHAT ng edad (backward-compatible).
  ageGroupIds?: number[];
  questions: ClusterQuestion[];
}

export interface ResultConfig {
  urgency: Urgency;
  title: string;
  description: string;
  defaultAction: string;
  escalationNote: string;
  color: string;
  timeframe?: string;
  followUp?: string;
}

export interface TriageFlowData {
  // Bersyon ng schema para sa hinaharang na migration. Kung wala, ituring na v1.
  schemaVersion?: number;
  disclaimer: string;
  ageGroups: AgeGroup[];
  userTypes: UserType[];
  redFlags: RedFlag[];
  symptomClusters: SymptomCluster[];
  resultConfigs: ResultConfig[];
}

export const urgencyConfig: Record<Urgency, { bg: string; text: string; dot: string; border: string }> = {
  Emergency:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500",     border: "border-red-200" },
  Urgent:       { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-500",  border: "border-orange-200" },
  "Semi-Urgent":{ bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500",   border: "border-amber-200" },
  "Non-Urgent": { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
};

export const urgencyLevels: Urgency[] = ["Emergency", "Urgent", "Semi-Urgent", "Non-Urgent"];

// Numeric na ranggo ng urgency — mas mataas = mas urgent. Iisang source of truth
// para sa runtime at editor (dating naka-hardcode sa loob ng determineResult).
export const urgencyRank: Record<Urgency, number> = {
  Emergency: 4,
  Urgent: 3,
  "Semi-Urgent": 2,
  "Non-Urgent": 1,
};

// Visibility rule: kung walang ageGroupIds (undefined o empty), ipakita sa LAHAT.
// Kung walang piniling edad (ageId === null), ipakita rin lahat (defensive).
export function isVisibleForAge(
  ageGroupIds: number[] | undefined,
  ageId: number | null,
): boolean {
  if (!ageGroupIds || ageGroupIds.length === 0) return true;
  if (ageId === null) return true;
  return ageGroupIds.includes(ageId);
}

// SAFETY-CRITICAL: ibinabalik ang epektibong urgency ng isang branch para sa
// napiling edad. Ang age escalation ay maaari LAMANG magtaas ng urgency —
// kailanman hindi nagpapababa. Kaya ginagamit ang max() ng base at anumang
// tumutugmang escalation. Ang maling config ay hindi makakababa ng emergency.
export function effectiveUrgency(
  branch: BranchOutcome,
  ageId: number | null,
): Urgency {
  let best = branch.urgency;
  if (ageId !== null && branch.ageEscalations) {
    for (const esc of branch.ageEscalations) {
      if (
        esc.ageGroupIds.includes(ageId) &&
        urgencyRank[esc.urgency] > urgencyRank[best]
      ) {
        best = esc.urgency;
      }
    }
  }
  return best;
}
