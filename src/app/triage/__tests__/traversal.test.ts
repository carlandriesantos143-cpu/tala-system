import { describe, it, expect } from "vitest";
import { walkCluster } from "../traversal";
import type {
  SymptomCluster,
  ClusterQuestion,
  BranchOutcome,
  BranchTarget,
  Urgency,
} from "../types";

const resultTarget = (u: Urgency): BranchTarget => ({ type: "result", urgency: u });
const questionTarget = (id: number): BranchTarget => ({ type: "question", questionId: id });

const branch = (
  u: Urgency,
  target: BranchTarget,
  ageEscalations?: BranchOutcome["ageEscalations"],
): BranchOutcome => ({ label: "", urgency: u, action: "", target, ageEscalations });

const q = (
  id: number,
  yes: BranchOutcome,
  no: BranchOutcome,
  ageGroupIds?: number[],
): ClusterQuestion => ({ id, question: `q${id}`, ageGroupIds, yesBranch: yes, noBranch: no });

const cluster = (questions: ClusterQuestion[]): SymptomCluster => ({
  id: 1,
  name: "Category",
  description: "",
  questions,
});

// q1: yes → Urgent (result), no → q2 ;  q2: yes → Emergency, no → Non-Urgent
const chain = () =>
  cluster([
    q(1, branch("Urgent", resultTarget("Urgent")), branch("Non-Urgent", questionTarget(2))),
    q(2, branch("Emergency", resultTarget("Emergency")), branch("Non-Urgent", resultTarget("Non-Urgent"))),
  ]);

describe("walkCluster — basic traversal", () => {
  it("with no answers: stops at the entry question, not started/complete", () => {
    const w = walkCluster(chain(), {}, null);
    expect(w.current?.id).toBe(1);
    expect(w.started).toBe(false);
    expect(w.complete).toBe(false);
    expect(w.terminal).toBeNull();
  });

  it("a result-target answer short-circuits to a terminal", () => {
    const w = walkCluster(chain(), { 1: true }, null);
    expect(w.complete).toBe(true);
    expect(w.terminal).toBe("Urgent");
    expect(w.path).toHaveLength(1);
  });

  it("a question-target answer reveals the next question (still incomplete)", () => {
    const w = walkCluster(chain(), { 1: false }, null);
    expect(w.current?.id).toBe(2);
    expect(w.started).toBe(true);
    expect(w.complete).toBe(false);
  });

  it("chains through to the final terminal", () => {
    expect(walkCluster(chain(), { 1: false, 2: true }, null).terminal).toBe("Emergency");
    expect(walkCluster(chain(), { 1: false, 2: false }, null).terminal).toBe("Non-Urgent");
  });
});

describe("walkCluster — safe handling of broken links", () => {
  it("a dangling question target ends safely at the branch's urgency", () => {
    const c = cluster([
      q(1, branch("Urgent", resultTarget("Urgent")), branch("Semi-Urgent", questionTarget(999))),
    ]);
    const w = walkCluster(c, { 1: false }, null);
    expect(w.complete).toBe(true);
    expect(w.terminal).toBe("Semi-Urgent");
  });

  it("a loop terminates safely (no infinite walk)", () => {
    const c = cluster([
      q(1, branch("Urgent", resultTarget("Urgent")), branch("Non-Urgent", questionTarget(2))),
      q(2, branch("Urgent", resultTarget("Urgent")), branch("Non-Urgent", questionTarget(1))),
    ]);
    const w = walkCluster(c, { 1: false, 2: false }, null);
    expect(w.complete).toBe(true);
    expect(w.terminal).toBe("Non-Urgent");
  });
});

describe("walkCluster — age awareness", () => {
  it("applies age escalation at the terminal", () => {
    const c = cluster([
      q(
        1,
        branch("Urgent", resultTarget("Urgent"), [{ ageGroupIds: [1], urgency: "Emergency" }]),
        branch("Non-Urgent", resultTarget("Non-Urgent")),
      ),
    ]);
    expect(walkCluster(c, { 1: true }, 1).terminal).toBe("Emergency"); // newborn
    expect(walkCluster(c, { 1: true }, 6).terminal).toBe("Urgent"); // adult
  });

  it("skips an age-hidden entry question and starts at the first visible one", () => {
    const c = cluster([
      q(1, branch("Urgent", resultTarget("Urgent")), branch("Non-Urgent", resultTarget("Non-Urgent")), [6]),
      q(2, branch("Emergency", resultTarget("Emergency")), branch("Non-Urgent", resultTarget("Non-Urgent"))),
    ]);
    const w = walkCluster(c, {}, 1); // infant: q1 (adult-only) hidden → entry is q2
    expect(w.current?.id).toBe(2);
  });
});
