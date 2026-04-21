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

export interface BranchOutcome {
  label: string;
  urgency: Urgency;
  action: string;
  target: BranchTarget;
}

export interface ClusterQuestion {
  id: number;
  question: string;
  yesBranch: BranchOutcome;
  noBranch: BranchOutcome;
}

export interface SymptomCluster {
  id: number;
  name: string;
  description: string;
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
