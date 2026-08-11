import { describe, it, expect } from "vitest";
import {
  isVisibleForAge,
  effectiveUrgency,
  urgencyRank,
  type BranchOutcome,
  type Urgency,
} from "../types";

// Helper: build a minimal BranchOutcome for testing.
const branch = (urgency: Urgency, ageEscalations?: BranchOutcome["ageEscalations"]): BranchOutcome => ({
  label: "",
  urgency,
  action: "",
  target: { type: "result", urgency },
  ageEscalations,
});

// Age group IDs mirror initialData: Newborn=1, Infant=2, ..., Adult=6.
const NEWBORN = 1;
const INFANT = 2;
const ADULT = 6;

describe("isVisibleForAge — question/cluster visibility", () => {
  it("shows to all ages when ageGroupIds is undefined", () => {
    expect(isVisibleForAge(undefined, ADULT)).toBe(true);
  });

  it("shows to all ages when ageGroupIds is empty", () => {
    expect(isVisibleForAge([], ADULT)).toBe(true);
  });

  it("hides when the selected age is NOT in the set", () => {
    expect(isVisibleForAge([NEWBORN, INFANT], ADULT)).toBe(false);
  });

  it("shows when the selected age IS in the set", () => {
    expect(isVisibleForAge([NEWBORN, INFANT], NEWBORN)).toBe(true);
  });

  it("is defensive: shows to all when no age is selected (null)", () => {
    expect(isVisibleForAge([NEWBORN, INFANT], null)).toBe(true);
  });
});

describe("effectiveUrgency — age-based escalation", () => {
  it("raises urgency for a matching vulnerable age (fever in newborn)", () => {
    const b = branch("Urgent", [{ ageGroupIds: [NEWBORN, INFANT], urgency: "Emergency" }]);
    expect(effectiveUrgency(b, NEWBORN)).toBe("Emergency");
  });

  it("keeps base urgency when the age does not match", () => {
    const b = branch("Urgent", [{ ageGroupIds: [NEWBORN, INFANT], urgency: "Emergency" }]);
    expect(effectiveUrgency(b, ADULT)).toBe("Urgent");
  });

  // SAFETY INVARIANT: escalation may only ever RAISE urgency, never lower it.
  it("NEVER downgrades — a lower escalation cannot reduce a high base urgency", () => {
    const b = branch("Emergency", [{ ageGroupIds: [NEWBORN], urgency: "Non-Urgent" }]);
    expect(effectiveUrgency(b, NEWBORN)).toBe("Emergency");
  });

  it("returns base urgency when there are no escalations", () => {
    expect(effectiveUrgency(branch("Semi-Urgent"), NEWBORN)).toBe("Semi-Urgent");
  });

  it("returns base urgency when no age is selected (null)", () => {
    const b = branch("Urgent", [{ ageGroupIds: [NEWBORN], urgency: "Emergency" }]);
    expect(effectiveUrgency(b, null)).toBe("Urgent");
  });

  it("picks the HIGHEST matching escalation when several apply", () => {
    const b = branch("Non-Urgent", [
      { ageGroupIds: [NEWBORN], urgency: "Semi-Urgent" },
      { ageGroupIds: [NEWBORN], urgency: "Emergency" },
    ]);
    expect(effectiveUrgency(b, NEWBORN)).toBe("Emergency");
  });
});

describe("urgencyRank — ordering", () => {
  it("ranks Emergency > Urgent > Semi-Urgent > Non-Urgent", () => {
    expect(urgencyRank.Emergency).toBeGreaterThan(urgencyRank.Urgent);
    expect(urgencyRank.Urgent).toBeGreaterThan(urgencyRank["Semi-Urgent"]);
    expect(urgencyRank["Semi-Urgent"]).toBeGreaterThan(urgencyRank["Non-Urgent"]);
  });
});
