import { describe, it, expect } from "vitest";
import { validateTriageConfig } from "../validation";
import type { TriageFlowData, Urgency, BranchOutcome, ResultConfig } from "../types";

const rc = (u: Urgency): ResultConfig => ({
  urgency: u, title: "", description: "", defaultAction: "", escalationNote: "", color: "",
});

const br = (u: Urgency, ageEscalations?: BranchOutcome["ageEscalations"]): BranchOutcome => ({
  label: "", urgency: u, action: "", target: { type: "result", urgency: u }, ageEscalations,
});

// A minimal, fully-valid config to mutate per test.
const base = (): TriageFlowData => ({
  schemaVersion: 2,
  disclaimer: "Sample disclaimer.",
  ageGroups: [{ id: 1, label: "Adult", rangeDesc: "18-59", enabled: true }],
  userTypes: [{ id: 1, label: "BHW", description: "", enabled: true }],
  redFlags: [],
  symptomClusters: [
    {
      id: 1,
      name: "Fever",
      description: "",
      questions: [{ id: 101, question: "High fever?", yesBranch: br("Urgent"), noBranch: br("Non-Urgent") }],
    },
  ],
  resultConfigs: [rc("Emergency"), rc("Urgent"), rc("Semi-Urgent"), rc("Non-Urgent")],
});

const errors = (d: TriageFlowData) => validateTriageConfig(d).filter((i) => i.level === "error");
const warnings = (d: TriageFlowData) => validateTriageConfig(d).filter((i) => i.level === "warning");

describe("validateTriageConfig — valid baseline", () => {
  it("reports no errors and no warnings for a complete config", () => {
    expect(errors(base())).toHaveLength(0);
    expect(warnings(base())).toHaveLength(0);
  });
});

describe("validateTriageConfig — errors (block save)", () => {
  it("flags when no age group is enabled", () => {
    const d = base();
    d.ageGroups[0].enabled = false;
    expect(errors(d).some((i) => i.step === 2)).toBe(true);
  });

  it("flags when there are no symptom clusters", () => {
    const d = base();
    d.symptomClusters = [];
    expect(errors(d).some((i) => i.step === 4)).toBe(true);
  });

  it("flags a missing Emergency result config (red-flag path would render blank)", () => {
    const d = base();
    d.resultConfigs = [rc("Urgent"), rc("Semi-Urgent"), rc("Non-Urgent")];
    expect(errors(d).some((i) => i.message.includes("Emergency"))).toBe(true);
  });
});

describe("validateTriageConfig — warnings (allow save)", () => {
  it("warns on a missing non-Emergency result config", () => {
    const d = base();
    d.resultConfigs = [rc("Emergency"), rc("Urgent"), rc("Semi-Urgent")];
    expect(warnings(d).some((i) => i.message.includes("Non-Urgent"))).toBe(true);
  });

  it("warns on an empty cluster", () => {
    const d = base();
    d.symptomClusters.push({ id: 2, name: "Empty", description: "", questions: [] });
    expect(warnings(d).some((i) => i.message.includes("walang tanong"))).toBe(true);
  });

  it("warns on a dangling question link", () => {
    const d = base();
    d.symptomClusters[0].questions[0].yesBranch.target = { type: "question", questionId: 999 };
    expect(warnings(d).some((i) => i.message.includes("wala na"))).toBe(true);
  });

  it("warns on a self-referencing question link (loop)", () => {
    const d = base();
    d.symptomClusters[0].questions[0].yesBranch.target = { type: "question", questionId: 101 };
    expect(warnings(d).some((i) => i.message.includes("loop"))).toBe(true);
  });

  it("warns on an age escalation with no ages selected (no-op)", () => {
    const d = base();
    d.symptomClusters[0].questions[0].yesBranch.ageEscalations = [
      { ageGroupIds: [], urgency: "Emergency" },
    ];
    expect(warnings(d).some((i) => i.message.includes("walang epekto"))).toBe(true);
  });

  // AGE DEAD-END LINT: an enabled age with zero applicable questions anywhere.
  it("warns when an enabled age group has no applicable questions", () => {
    const d = base();
    d.ageGroups.push({ id: 2, label: "Infant", rangeDesc: "1-11 mo", enabled: true });
    d.symptomClusters[0].questions[0].ageGroupIds = [1]; // Adult only → Infant is stranded
    expect(warnings(d).some((i) => i.message.includes("Infant"))).toBe(true);
  });
});
