import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  GitBranch,
  FolderOpen,
  ArrowDown,
  CornerDownRight,
  Target,
  ArrowRight,
  CircleDot,
  HelpCircle,
} from "lucide-react";
import type {
  SymptomCluster,
  ClusterQuestion,
  Urgency,
  BranchTarget,
  BranchOutcome,
} from "../types";
import { urgencyConfig, urgencyLevels } from "../types";

interface Props {
  clusters: SymptomCluster[];
  onChange: (clusters: SymptomCluster[]) => void;
}

type ModalMode =
  | null
  | { kind: "cluster"; editing: SymptomCluster | null }
  | { kind: "question"; clusterId: number; editing: ClusterQuestion | null };

const emptyCluster = { name: "", description: "" };
const emptyTarget: BranchTarget = { type: "result" as const, urgency: "Non-Urgent" as Urgency };
const emptyBranch: Omit<BranchOutcome, "target"> & { target: BranchTarget } = {
  label: "",
  urgency: "Non-Urgent" as Urgency,
  action: "",
  target: { ...emptyTarget },
};
type QuestionFormState = {
  question: string;
  yesBranch: BranchOutcome;
  noBranch: BranchOutcome;
};

const emptyQuestion: QuestionFormState = {
  question: "",
  yesBranch: { ...emptyBranch, target: { ...emptyTarget } },
  noBranch: { ...emptyBranch, target: { ...emptyTarget } },
};

export function StepSymptomClusters({ clusters, onChange }: Props) {
  const [expandedCluster, setExpandedCluster] = useState<number | null>(
    clusters[0]?.id ?? null
  );
  const [modal, setModal] = useState<ModalMode>(null);
  const [clusterForm, setClusterForm] = useState(emptyCluster);
  const [questionForm, setQuestionForm] = useState<QuestionFormState>(emptyQuestion);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    kind: "cluster" | "question";
    id: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "flow">("flow");

  // Cluster CRUD
  const openAddCluster = () => {
    setClusterForm(emptyCluster);
    setModal({ kind: "cluster", editing: null });
  };
  const openEditCluster = (c: SymptomCluster) => {
    setClusterForm({ name: c.name, description: c.description });
    setModal({ kind: "cluster", editing: c });
  };
  const saveCluster = () => {
    if (!clusterForm.name.trim()) return;
    if (modal?.kind === "cluster" && modal.editing) {
      onChange(
        clusters.map((c) =>
          c.id === modal.editing!.id ? { ...c, ...clusterForm } : c
        )
      );
    } else {
      const newCluster: SymptomCluster = {
        id: Date.now(),
        ...clusterForm,
        questions: [],
      };
      onChange([...clusters, newCluster]);
      setExpandedCluster(newCluster.id);
    }
    setModal(null);
  };
  const deleteCluster = (id: number) => {
    onChange(clusters.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    if (expandedCluster === id) setExpandedCluster(null);
  };

  // Question CRUD
  const openAddQuestion = (clusterId: number) => {
    setQuestionForm({
      question: "",
      yesBranch: {
        label: "",
        urgency: "Non-Urgent",
        action: "",
        target: { type: "result", urgency: "Non-Urgent" },
      },
      noBranch: {
        label: "",
        urgency: "Non-Urgent",
        action: "",
        target: { type: "result", urgency: "Non-Urgent" },
      },
    });
    setModal({ kind: "question", clusterId, editing: null });
  };
  const openEditQuestion = (clusterId: number, q: ClusterQuestion) => {
    setQuestionForm({
      question: q.question,
      yesBranch: {
        ...q.yesBranch,
        target: q.yesBranch.target
          ? { ...q.yesBranch.target }
          : { type: "result", urgency: q.yesBranch.urgency },
      },
      noBranch: {
        ...q.noBranch,
        target: q.noBranch.target
          ? { ...q.noBranch.target }
          : { type: "result", urgency: q.noBranch.urgency },
      },
    });
    setModal({ kind: "question", clusterId, editing: q });
  };
  const saveQuestion = () => {
    if (!questionForm.question.trim() || modal?.kind !== "question") return;
    const cid = modal.clusterId;
    // Sync urgency from target when target is result
    const syncBranch = (b: typeof questionForm.yesBranch) => ({
      ...b,
      urgency: b.target.type === "result" ? b.target.urgency : b.urgency,
    });
    const synced = {
      ...questionForm,
      yesBranch: syncBranch(questionForm.yesBranch),
      noBranch: syncBranch(questionForm.noBranch),
    };
    onChange(
      clusters.map((c) => {
        if (c.id !== cid) return c;
        if (modal.editing) {
          return {
            ...c,
            questions: c.questions.map((q) =>
              q.id === modal.editing!.id ? { ...q, ...synced } : q
            ),
          };
        }
        return { ...c, questions: [...c.questions, { id: Date.now(), ...synced }] };
      })
    );
    setModal(null);
  };
  const deleteQuestion = (clusterId: number, qId: number) => {
    onChange(
      clusters.map((c) =>
        c.id !== clusterId
          ? c
          : { ...c, questions: c.questions.filter((q) => q.id !== qId) }
      )
    );
    setDeleteConfirm(null);
  };

  const UrgencyBadge = ({ urgency }: { urgency: Urgency }) => {
    const cfg = urgencyConfig[urgency];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}
        style={{ fontSize: "0.7rem", fontWeight: 500 }}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {urgency}
      </span>
    );
  };

  const TargetBadge = ({
    target,
    questions,
  }: {
    target: BranchTarget;
    questions: ClusterQuestion[];
  }) => {
    if (target.type === "result") {
      const cfg = urgencyConfig[target.urgency];
      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}
          style={{ fontSize: "0.7rem", fontWeight: 500 }}
        >
          <Target className={`w-3 h-3 ${cfg.text}`} />
          <span className={cfg.text}>→ Result: {target.urgency}</span>
        </div>
      );
    }
    const targetQ = questions.find((q) => q.id === target.questionId);
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200"
        style={{ fontSize: "0.7rem", fontWeight: 500 }}
      >
        <CornerDownRight className="w-3 h-3 text-blue-600" />
        <span className="text-blue-700">
          → Q:{" "}
          {targetQ
            ? targetQ.question.length > 30
              ? targetQ.question.slice(0, 30) + "…"
              : targetQ.question
            : `#${target.questionId}`}
        </span>
      </div>
    );
  };

  // Get all questions for the current expanded cluster
  const currentCluster = clusters.find((c) => c.id === expandedCluster);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-gray-800 font-semibold"
            style={{ fontSize: "1.05rem" }}
          >
            Symptom Clusters — Decision Tree
          </h3>
          <p
            className="text-gray-400 mt-1"
            style={{ fontSize: "0.8rem" }}
          >
            Configure branching logic: each question leads to a result
            or the next question based on Yes/No answers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("flow")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "flow"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              <GitBranch className="w-3.5 h-3.5 inline mr-1" />
              Flow
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1" />
              List
            </button>
          </div>
          <button
            onClick={openAddCluster}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            style={{ fontSize: "0.85rem" }}
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {clusters.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400" style={{ fontSize: "0.85rem" }}>
            No symptom categories yet. Add one to get started.
          </p>
        </div>
      )}

      {/* Cluster accordion */}
      <div className="space-y-3">
        {clusters.map((cluster) => {
          const isExpanded = expandedCluster === cluster.id;
          return (
            <div
              key={cluster.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Cluster header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() =>
                  setExpandedCluster(isExpanded ? null : cluster.id)
                }
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <Layers
                    className={`w-4.5 h-4.5 ${
                      isExpanded ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <span
                      className={`block font-medium ${
                        isExpanded ? "text-emerald-800" : "text-gray-700"
                      }`}
                      style={{ fontSize: "0.9rem" }}
                    >
                      {cluster.name}
                    </span>
                    <span
                      className="text-gray-400"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {cluster.description} · {cluster.questions.length}{" "}
                      question{cluster.questions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title="Edit Cluster"
                    onClick={() => openEditCluster(cluster)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {deleteConfirm?.kind === "cluster" &&
                  deleteConfirm.id === cluster.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteCluster(cluster.id)}
                        className="px-2.5 py-1 bg-red-500 text-white rounded-lg cursor-pointer"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer"
                        style={{ fontSize: "0.65rem" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete Cluster"
                      onClick={() =>
                        setDeleteConfirm({ kind: "cluster", id: cluster.id })
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Questions */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 font-medium"
                        style={{ fontSize: "0.78rem" }}
                      >
                        Decision Flow
                      </span>
                      <span
                        className="text-gray-300 bg-gray-100 px-2 py-0.5 rounded-md"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {cluster.questions.length} nodes
                      </span>
                    </div>
                    <button
                      onClick={() => openAddQuestion(cluster.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                  </div>

                  {cluster.questions.length === 0 && (
                    <div className="px-5 pb-5">
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <GitBranch className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p
                          className="text-gray-400"
                          style={{ fontSize: "0.8rem" }}
                        >
                          No questions yet. Add a question to start building
                          the decision tree.
                        </p>
                      </div>
                    </div>
                  )}

                  {viewMode === "flow" && cluster.questions.length > 0 ? (
                    /* === FLOW VIEW === */
                    <div className="px-5 pb-5">
                      {/* Start node */}
                      <div className="flex justify-center mb-1">
                        <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl inline-flex items-center gap-2" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                          <CircleDot className="w-3.5 h-3.5" />
                          START — {cluster.name}
                        </div>
                      </div>
                      <div className="flex justify-center mb-2">
                        <div className="w-0.5 h-5 bg-emerald-300 rounded-full" />
                      </div>

                      {cluster.questions.map((q, qi) => (
                        <div key={q.id}>
                          {/* Question node */}
                          <div className="relative bg-white rounded-xl border-2 border-emerald-200 shadow-sm overflow-hidden">
                            {/* Question header */}
                            <div className="bg-emerald-50 px-4 py-3 flex items-center justify-between border-b border-emerald-100">
                              <div className="flex items-center gap-2">
                                <span
                                  className="bg-emerald-600 text-white px-2 py-0.5 rounded-md"
                                  style={{ fontSize: "0.65rem", fontWeight: 700 }}
                                >
                                  Q{qi + 1}
                                </span>
                                <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <p
                                  className="text-gray-800 font-medium"
                                  style={{ fontSize: "0.88rem" }}
                                >
                                  {q.question}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  title="Edit Question"
                                  onClick={() =>
                                    openEditQuestion(cluster.id, q)
                                  }
                                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {deleteConfirm?.kind === "question" &&
                                deleteConfirm.id === q.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        deleteQuestion(cluster.id, q.id)
                                      }
                                      className="px-2 py-0.5 bg-red-500 text-white rounded-lg cursor-pointer"
                                      style={{ fontSize: "0.6rem" }}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer"
                                      style={{ fontSize: "0.6rem" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    title="Delete Question"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        kind: "question",
                                        id: q.id,
                                      })
                                    }
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Branches */}
                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                              {/* YES branch */}
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span
                                    className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-md"
                                    style={{
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓ YES
                                  </span>
                                  <span
                                    className="text-gray-500"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {q.yesBranch.label}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <TargetBadge
                                    target={q.yesBranch.target}
                                    questions={cluster.questions}
                                  />
                                </div>
                                <p
                                  className="text-gray-500 leading-relaxed"
                                  style={{ fontSize: "0.72rem" }}
                                >
                                  {q.yesBranch.action}
                                </p>
                              </div>

                              {/* NO branch */}
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span
                                    className="bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-md"
                                    style={{
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✗ NO
                                  </span>
                                  <span
                                    className="text-gray-500"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {q.noBranch.label}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <TargetBadge
                                    target={q.noBranch.target}
                                    questions={cluster.questions}
                                  />
                                </div>
                                <p
                                  className="text-gray-500 leading-relaxed"
                                  style={{ fontSize: "0.72rem" }}
                                >
                                  {q.noBranch.action}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Connector to next question */}
                          {qi < cluster.questions.length - 1 && (
                            <div className="flex justify-center my-1">
                              <div className="flex flex-col items-center">
                                <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                                <ArrowDown className="w-4 h-4 text-gray-400" />
                                <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Flow legend */}
                      <div className="mt-5 bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 font-medium mb-2.5" style={{ fontSize: "0.75rem" }}>
                          Flow Legend
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-600 rounded-sm" />
                            <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>Question Node</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-orange-500" />
                            <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>Go to Result</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CornerDownRight className="w-3 h-3 text-blue-600" />
                            <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>Go to Next Question</span>
                          </div>
                          {urgencyLevels.map((u) => {
                            const cfg = urgencyConfig[u];
                            return (
                              <div key={u} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                <span className="text-gray-500" style={{ fontSize: "0.7rem" }}>{u}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* === LIST VIEW (original) === */
                    <div className="px-5 pb-4 space-y-3">
                      {cluster.questions.map((q, qi) => (
                        <div
                          key={q.id}
                          className="bg-gray-50 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className="bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md"
                                  style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  Q{qi + 1}
                                </span>
                                <p
                                  className="text-gray-800 font-medium"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {q.question}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mt-3">
                                {/* Yes branch */}
                                <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span
                                      className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md"
                                      style={{
                                        fontSize: "0.6rem",
                                        fontWeight: 700,
                                      }}
                                    >
                                      YES
                                    </span>
                                    <span
                                      className="text-gray-500"
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {q.yesBranch.label}
                                    </span>
                                  </div>
                                  <div className="mb-1.5">
                                    <TargetBadge
                                      target={q.yesBranch.target}
                                      questions={cluster.questions}
                                    />
                                  </div>
                                  <p
                                    className="text-gray-500 leading-relaxed"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {q.yesBranch.action}
                                  </p>
                                </div>
                                {/* No branch */}
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span
                                      className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md"
                                      style={{
                                        fontSize: "0.6rem",
                                        fontWeight: 700,
                                      }}
                                    >
                                      NO
                                    </span>
                                    <span
                                      className="text-gray-500"
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      {q.noBranch.label}
                                    </span>
                                  </div>
                                  <div className="mb-1.5">
                                    <TargetBadge
                                      target={q.noBranch.target}
                                      questions={cluster.questions}
                                    />
                                  </div>
                                  <p
                                    className="text-gray-500 leading-relaxed"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    {q.noBranch.action}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                title="Edit Question"
                                onClick={() =>
                                  openEditQuestion(cluster.id, q)
                                }
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {deleteConfirm?.kind === "question" &&
                              deleteConfirm.id === q.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      deleteQuestion(cluster.id, q.id)
                                    }
                                    className="px-2 py-0.5 bg-red-500 text-white rounded-lg cursor-pointer"
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-lg cursor-pointer"
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  title="Delete Question"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      kind: "question",
                                      id: q.id,
                                    })
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setModal(null)}
        >
          <div
            className={`bg-white rounded-2xl w-full ${
              modal.kind === "question" ? "max-w-2xl" : "max-w-md"
            } p-6 shadow-xl max-h-[90vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-gray-800 font-semibold"
                style={{ fontSize: "0.95rem" }}
              >
                {modal.kind === "cluster"
                  ? modal.editing
                    ? "Edit Category"
                    : "Add Category"
                  : modal.editing
                  ? "Edit Question & Branching"
                  : "Add Question & Branching"}
              </h3>
              <button
                type="button"
                title="Close Modal"
                onClick={() => setModal(null)}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {modal.kind === "cluster" ? (
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-gray-600 mb-1.5"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={clusterForm.name}
                    onChange={(e) =>
                      setClusterForm({ ...clusterForm, name: e.target.value })
                    }
                    placeholder="e.g. Fever & Infection"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-600 mb-1.5"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={clusterForm.description}
                    onChange={(e) =>
                      setClusterForm({
                        ...clusterForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    style={{ fontSize: "0.875rem" }}
                  />
                </div>
              </div>
            ) : (
              <QuestionFormEditor
                form={questionForm}
                onChange={setQuestionForm}
                allQuestions={
                  clusters.find(
                    (c) =>
                      c.id ===
                      (modal as { kind: "question"; clusterId: number })
                        .clusterId
                  )?.questions ?? []
                }
                editingId={modal.editing?.id}
              />
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                style={{ fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                onClick={modal.kind === "cluster" ? saveCluster : saveQuestion}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                style={{ fontSize: "0.85rem" }}
              >
                {modal.editing ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== Question Form Editor (inside modal) ========== */

function QuestionFormEditor({
  form,
  onChange,
  allQuestions,
  editingId,
}: {
  form: {
    question: string;
    yesBranch: BranchOutcome;
    noBranch: BranchOutcome;
  };
  onChange: (f: typeof form) => void;
  allQuestions: ClusterQuestion[];
  editingId?: number;
}) {
  const otherQuestions = allQuestions.filter((q) => q.id !== editingId);

  return (
    <div className="space-y-5">
      <div>
        <label
          className="block text-gray-600 mb-1.5"
          style={{ fontSize: "0.8rem" }}
        >
          Question
        </label>
        <input
          type="text"
          value={form.question}
          onChange={(e) => onChange({ ...form, question: e.target.value })}
          placeholder="e.g. Temperature above 39°C?"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
          style={{ fontSize: "0.875rem" }}
        />
      </div>

      {/* YES branch */}
      <BranchEditor
        branchLabel="YES"
        branchColor="emerald"
        branch={form.yesBranch}
        otherQuestions={otherQuestions}
        onChange={(b) => onChange({ ...form, yesBranch: b })}
      />

      {/* NO branch */}
      <BranchEditor
        branchLabel="NO"
        branchColor="gray"
        branch={form.noBranch}
        otherQuestions={otherQuestions}
        onChange={(b) => onChange({ ...form, noBranch: b })}
      />
    </div>
  );
}

/* ========== Single branch editor ========== */

function BranchEditor({
  branchLabel,
  branchColor,
  branch,
  otherQuestions,
  onChange,
}: {
  branchLabel: "YES" | "NO";
  branchColor: "emerald" | "gray";
  branch: BranchOutcome;
  otherQuestions: ClusterQuestion[];
  onChange: (b: BranchOutcome) => void;
}) {
  const isYes = branchColor === "emerald";
  const bgOuter = isYes ? "bg-emerald-50/50" : "bg-gray-50";
  const borderOuter = isYes ? "border-emerald-100" : "border-gray-200";
  const labelBg = isYes ? "bg-emerald-200 text-emerald-800" : "bg-gray-300 text-gray-700";
  const targetType = branch.target?.type ?? "result";

  const setTarget = (t: BranchTarget) => {
    onChange({ ...branch, target: t, urgency: t.type === "result" ? t.urgency : branch.urgency });
  };

  return (
    <div className={`${bgOuter} rounded-xl p-4 border ${borderOuter}`}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`${labelBg} px-2.5 py-0.5 rounded-md`}
          style={{ fontSize: "0.7rem", fontWeight: 700 }}
        >
          {branchLabel === "YES" ? "✓" : "✗"} {branchLabel} BRANCH
        </span>
        <span className="text-gray-400" style={{ fontSize: "0.72rem" }}>
          When the answer is {branchLabel === "YES" ? "Yes" : "No"}
        </span>
      </div>

      <div className="space-y-3">
        {/* Label */}
        <div>
          <label
            className="block text-gray-500 mb-1"
            style={{ fontSize: "0.75rem" }}
          >
            Branch Label
          </label>
          <input
            type="text"
            value={branch.label}
            onChange={(e) => onChange({ ...branch, label: e.target.value })}
            placeholder={isYes ? "e.g. High Fever" : "e.g. Low-Grade Fever"}
            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            style={{ fontSize: "0.85rem" }}
          />
        </div>

        {/* Target type selector */}
        <div>
          <label
            className="block text-gray-500 mb-1.5"
            style={{ fontSize: "0.75rem" }}
          >
            Then go to…
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setTarget({
                  type: "result",
                  urgency: branch.urgency || "Non-Urgent",
                })
              }
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                targetType === "result"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              <Target className="w-4 h-4" />
              <div className="text-left">
                <span className="block font-medium" style={{ fontSize: "0.78rem" }}>Go to Result</span>
                <span className="block opacity-70" style={{ fontSize: "0.65rem" }}>End with urgency level</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                const first = otherQuestions[0];
                setTarget({
                  type: "question",
                  questionId: first?.id ?? 0,
                });
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${
                targetType === "question"
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
              style={{ fontSize: "0.8rem" }}
            >
              <CornerDownRight className="w-4 h-4" />
              <div className="text-left">
                <span className="block font-medium" style={{ fontSize: "0.78rem" }}>Go to Question</span>
                <span className="block opacity-70" style={{ fontSize: "0.65rem" }}>Continue to next question</span>
              </div>
            </button>
          </div>
        </div>

        {/* Conditional: Result urgency picker */}
        {targetType === "result" && (
          <div>
            <label
              className="block text-gray-500 mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              Urgency Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {urgencyLevels.map((u) => {
                const cfg = urgencyConfig[u];
                const sel =
                  branch.target?.type === "result" &&
                  branch.target.urgency === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() =>
                      setTarget({ type: "result", urgency: u })
                    }
                    className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                      sel
                        ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                    style={{ fontSize: "0.68rem", fontWeight: 500 }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conditional: Question selector */}
        {targetType === "question" && (
          <div>
            <label
              className="block text-gray-500 mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              Select Next Question
            </label>
            {otherQuestions.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-700" style={{ fontSize: "0.78rem" }}>
                  No other questions available in this category. Add more
                  questions first, then link them.
                </p>
              </div>
            ) : (
              <select
                aria-label="Select Next Question"
                title="Select Next Question"
                value={
                  branch.target?.type === "question"
                    ? branch.target.questionId
                    : ""
                }
                onChange={(e) =>
                  setTarget({
                    type: "question",
                    questionId: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                style={{ fontSize: "0.85rem" }}
              >
                {otherQuestions.map((oq, i) => (
                  <option key={oq.id} value={oq.id}>
                    Q{i + 1}: {oq.question}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Action / Instruction */}
        <div>
          <label
            className="block text-gray-500 mb-1"
            style={{ fontSize: "0.75rem" }}
          >
            Action / Instruction
          </label>
          <textarea
            value={branch.action}
            onChange={(e) => onChange({ ...branch, action: e.target.value })}
            placeholder="What to do..."
            rows={2}
            className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            style={{ fontSize: "0.85rem" }}
          />
        </div>
      </div>
    </div>
  );
}
