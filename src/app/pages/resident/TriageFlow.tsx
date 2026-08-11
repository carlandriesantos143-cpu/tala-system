import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Baby,
  User,
  Users,
  Stethoscope,
  CircleAlert,
  CircleCheck,
  XCircle,
  Phone,
  RotateCcw,
  Home,
  FileQuestion,
} from "lucide-react";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/localDB";
import { queueTriageSession } from "../../services/syncService";
import type {
  Urgency,
  ResultConfig,
  TriageFlowData,
  SymptomCluster,
} from "../../triage/types";
import {
  isVisibleForAge,
  effectiveUrgency,
  urgencyRank,
} from "../../triage/types";
import { walkCluster } from "../../triage/traversal";
import { NATIONAL_EMERGENCY_NUMBER } from "../../constants/emergency";

// SAFETY: maingat na fallback kapag walang naka-configure/nakikitang tanong para
// sa napiling edad, o walang tugmang resulta. Pinapanatili ang urgency at
// itinuturo ang residente sa BHW — kailanman hindi nagba-babae ng antas.
function safeConsultResult(urgency: Urgency): ResultConfig {
  return {
    urgency,
    title: `${urgency} — Kumonsulta sa inyong Barangay Health Worker`,
    description:
      "Hindi lubos na natugma ang assessment na ito sa naka-configure na protocol. Para sa kaligtasan, kumonsulta sa inyong BHW o pinakamalapit na health facility.",
    defaultAction:
      "Dalhin ang pasyente sa Barangay Health Worker o pinakamalapit na health facility para sa maayos na pagsusuri.",
    escalationNote:
      "Kung malubha o lumalala ang sintomas, humingi kaagad ng emergency care.",
    color: "amber",
  };
}

interface TriageFlowProps {
  onBack: () => void;
  onEmergency: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const ageIcons = [Baby, Baby, User, User, User, Users, Users];

const CHARCOAL = "#1E293B";
const MUTED = "#64748B";
const SUBTLE = "#94A3B8";
const EMERALD = "#10B981";
const EMERALD_DARK = "#059669";

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.70)",
  backdropFilter: "blur(40px) saturate(160%)",
  WebkitBackdropFilter: "blur(40px) saturate(160%)",
  border: "1px solid #E2E8F0",
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
  borderRadius: 24,
};

const resultStyles: Record<
  Urgency,
  {
    bg: string;
    text: string;
    border: string;
    icon: typeof CircleAlert;
    btnBg: string;
  }
> = {
  Emergency: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: CircleAlert,
    btnBg: "bg-red-600",
  },
  Urgent: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: AlertTriangle,
    btnBg: "bg-orange-600",
  },
  "Semi-Urgent": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertTriangle,
    btnBg: "bg-amber-600",
  },
  "Non-Urgent": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CircleCheck,
    btnBg: "bg-emerald-600",
  },
};

export function TriageFlow({
  onBack,
  onEmergency: _onEmergency,
}: TriageFlowProps) {
  const storedConfig = useLiveQuery(() => db.triageConfig.toArray());
  const isLoading = storedConfig === undefined;

  let data: TriageFlowData | null = null;
  if (storedConfig && storedConfig.length > 0) {
    try {
      const rawData = storedConfig[0].data;
      data = (typeof rawData === "string" ? JSON.parse(rawData) : rawData) as TriageFlowData;
    } catch (err) {
      // Kung sira/malformed ang naka-store na config, huwag mag-crash —
      // babagsak na lang sa "Hindi Pa Available" na fallback screen sa baba.
      console.error("[TALA] Failed to parse triage config:", err);
      data = null;
    }
  }

  // LAHAT NG HOOKS DAPAT NASA TAAS (Bago ang if-statements)
  const [step, setStep] = useState<Step>(1);
  const [agreed, setAgreed] = useState(false);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<number | null>(null);
  const [checkedFlags, setCheckedFlags] = useState<Set<number>>(new Set());
  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [finalResult, setFinalResult] = useState<ResultConfig | null>(null);

  // AGE-AWARE: ibinabalik LAMANG ang mga cluster/tanong na naaangkop sa napiling
  // edad. Iisang source of truth para sa tabs, tanong, completion gate,
  // determineResult, at analytics logging — para laging magkatugma.
  const getVisibleClusters = useCallback((): SymptomCluster[] => {
    return (data?.symptomClusters ?? [])
      .filter((c) => isVisibleForAge(c.ageGroupIds, selectedAge))
      .map((c) => ({
        ...c,
        questions: (c.questions ?? []).filter((q) =>
          isVisibleForAge(q.ageGroupIds, selectedAge),
        ),
      }))
      .filter((c) => c.questions.length > 0);
  }, [data, selectedAge]);

  // DECISION-TREE: nilalakad ang bawat kategorya ayon sa branch.target ng admin
  // (hindi na flat na "max ng lahat ng sagot"). Ang outcome ng bawat kategorya ay
  // ang terminal na urgency na naabot; ang final ay ang pinakamataas sa mga
  // natapos na kategorya (may age escalation na naka-apply sa terminal).
  const determineResult = useCallback((): ResultConfig => {
    const visibleClusters = getVisibleClusters();

    // SAFETY: kung walang applicable na tanong para sa edad na ito (posibleng
    // maling config), HUWAG mag-return ng Non-Urgent (false reassurance).
    if (visibleClusters.length === 0) {
      return safeConsultResult("Semi-Urgent");
    }

    let highestUrgency: Urgency = "Non-Urgent";
    let anyTerminal = false;
    for (const cluster of visibleClusters) {
      const walk = walkCluster(cluster, answers, selectedAge);
      if (walk.terminal) {
        anyTerminal = true;
        if (urgencyRank[walk.terminal] > urgencyRank[highestUrgency]) {
          highestUrgency = walk.terminal;
        }
      }
    }

    // Walang natapos na kategorya (hindi dapat mangyari dahil sa completion gate).
    if (!anyTerminal) return safeConsultResult("Semi-Urgent");

    const match = data?.resultConfigs?.find((r) => r.urgency === highestUrgency);
    // SAFETY: kung walang config para sa level, huwag mag-default sa pinakamababa.
    return match ?? safeConsultResult(highestUrgency);
  }, [answers, data, selectedAge, getVisibleClusters]);

  // Mag-log ng ANONYMOUS na session sa Supabase kapag tapos na ang triage.
  // Fire-and-forget: hindi hinaharangan ang UI at tahimik lang kung mabigo (hal. offline).
  // Walang PII — age group / user type / outcome / red flag count lang.
  const logTriageSession = useCallback(
    (result: ResultConfig | null) => {
      const ageLabel = data?.ageGroups.find((a) => a.id === selectedAge)?.label ?? null;
      const userTypeLabel = data?.userTypes.find((u) => u.id === selectedUserType)?.label ?? null;
      // Mga kategoryang sinimulan ng residente (engaged), para sa analytics.
      const flaggedClusters = getVisibleClusters()
        .filter((c) => walkCluster(c, answers, selectedAge).started)
        .map((c) => c.name);

      // OFFLINE-DURABLE: i-queue muna sa Dexie (hindi mawawala kahit offline),
      // awtomatikong ipapadala sa Supabase pagbalik ng internet. Ang is_offline
      // at created_at ay kinukuha NGAYON (creation time) para tumpak ang analytics
      // kahit na-flush lang ang row mamaya.
      void queueTriageSession({
        urgency_result: result?.urgency ?? null,
        age_group: ageLabel,
        user_type: userTypeLabel,
        red_flag_count: checkedFlags.size,
        flagged_clusters: flaggedClusters,
        completed: true,
        is_offline: !navigator.onLine,
        created_at: new Date().toISOString(),
      });
    },
    [data, answers, selectedAge, selectedUserType, checkedFlags, getVisibleClusters],
  );

  const toggleFlag = (id: number) => {
    setCheckedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // SAFETY: kailangang MAABOT ng residente ang isang terminal (dulo ng tree) sa
  // kahit isang kategorya, AT bawat kategoryang SINIMULAN ay dapat may terminal
  // na rin. Sa tree model, ang "terminal" ang tamang senyales na sapat na ang
  // impormasyon — hindi na kailangang sagutin LAHAT ng tanong.
  const isStep4Complete = () => {
    const walks = getVisibleClusters().map((c) =>
      walkCluster(c, answers, selectedAge),
    );
    const anyComplete = walks.some((w) => w.complete);
    const startedAllComplete = walks
      .filter((w) => w.started)
      .every((w) => w.complete);
    return anyComplete && startedAllComplete;
  };

  const canNext = () => {
    switch (step) {
      case 1:
        return agreed;
      case 2:
        return selectedAge !== null && selectedUserType !== null;
      case 3:
        return true;
      case 4:
        // Kung walang applicable na tanong para sa edad, payagang makuha ang
        // safe consult-BHW result (huwag i-trap ang residente).
        if (getVisibleClusters().length === 0) return true;
        return isStep4Complete();
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === 3 && checkedFlags.size > 0) {
      const emergencyResult =
        data?.resultConfigs?.find((r) => r.urgency === "Emergency") ?? null;
      setFinalResult(emergencyResult);
      logTriageSession(emergencyResult);
      setStep(5);
      return;
    }
    if (step === 4) {
      const result = determineResult() ?? null;
      setFinalResult(result);
      logTriageSession(result);
      setStep(5);
      return;
    }
    setStep((s) => Math.min(s + 1, 5) as Step);
  };

  const handlePrev = () => {
    if (step === 1) {
      onBack();
      return;
    }
    setStep((s) => Math.max(s - 1, 1) as Step);
  };

  const restartTriage = () => {
    setStep(1);
    setAgreed(false);
    setSelectedAge(null);
    setSelectedUserType(null);
    setCheckedFlags(new Set());
    setActiveCluster(null);
    setAnswers({});
    setFinalResult(null);
  };

  // -----------------------------------------------------------------
  // EARLY RETURNS (Dapat nasa HULI ng lahat ng hooks)
  // -----------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-500 text-sm">Naglo-load ng data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <FileQuestion className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Hindi Pa Available
        </h2>
        <p className="text-gray-500 text-sm mb-6 max-w-[280px]">
          Ang Health Triage ay kasalukuyang inaayos pa ng inyong Barangay Health
          Center. Mangyaring sumubok muli mamaya.
        </p>
        <button
          onClick={onBack}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
        >
          Bumalik sa Home
        </button>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // NORMAL FLOW: Kung may data na ang Admin
  // -----------------------------------------------------------------
  const enabledAgeGroups = data.ageGroups.filter((a) => a.enabled);
  const enabledUserTypes = data.userTypes.filter((u) => u.enabled);

  // AGE-AWARE: mga cluster/tanong na naaangkop lang sa napiling edad.
  const visibleClusters = getVisibleClusters();
  const activeVisibleCluster = visibleClusters.find((c) => c.id === activeCluster);

  // DECISION-TREE: paglalakad ng aktibong kategorya (path + kasalukuyang tanong).
  const activeWalk = activeVisibleCluster
    ? walkCluster(activeVisibleCluster, answers, selectedAge)
    : null;

  // Reusable na question card (Yes/No + preview). Ginagamit sa path at current node.
  const renderQuestionCard = (q: (typeof visibleClusters)[number]["questions"][number]) => {
    const answer = answers[q.id];
    return (
      <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-gray-700 font-medium mb-3" style={{ fontSize: "0.85rem" }}>
          {q.question}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAnswers({ ...answers, [q.id]: true })}
            className={`flex-1 py-2.5 rounded-xl border-2 transition-all cursor-pointer font-medium ${
              answer === true
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={{ fontSize: "0.82rem" }}
          >
            Yes
          </button>
          <button
            onClick={() => setAnswers({ ...answers, [q.id]: false })}
            className={`flex-1 py-2.5 rounded-xl border-2 transition-all cursor-pointer font-medium ${
              answer === false
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
            style={{ fontSize: "0.82rem" }}
          >
            No
          </button>
        </div>
        {answer !== undefined && (
          <div
            className={`mt-3 p-3 rounded-xl ${
              answer ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"
            }`}
          >
            <p
              className={`font-semibold mb-0.5 ${answer ? "text-red-700" : "text-emerald-700"}`}
              style={{ fontSize: "0.72rem" }}
            >
              {answer ? q.yesBranch.label : q.noBranch.label} (
              {effectiveUrgency(answer ? q.yesBranch : q.noBranch, selectedAge)})
            </p>
            <p
              className={answer ? "text-red-600" : "text-emerald-600"}
              style={{ fontSize: "0.7rem" }}
            >
              {answer ? q.yesBranch.action : q.noBranch.action}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Informational lang — ipinapakita sa result screen para reference ng BHW.
  // Hindi ito nakakaapekto sa pag-compute ng urgency (tingnan ang determineResult).
  const selectedAgeLabel = enabledAgeGroups.find((a) => a.id === selectedAge)?.label;
  const selectedUserTypeLabel = enabledUserTypes.find((u) => u.id === selectedUserType)?.label;

  const stepLabels = [
    "Disclaimer",
    "Patient Info",
    "Red Flags",
    "Symptoms",
    "Result",
  ];

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 shrink-0 mx-4 mt-4"
        style={{ ...glass, borderRadius: 20 }}
      >
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3">
          <button
            onClick={step === 5 ? onBack : handlePrev}
            aria-label="Go back"
            title="Go back"
            className="p-2 -ml-1 rounded-xl cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid #E2E8F0",
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: CHARCOAL }} />
          </button>
          <div className="flex-1">
            <p
              className="text-gray-800 font-semibold"
              style={{ fontSize: "0.95rem" }}
            >
              Health Triage
            </p>
            <p className="text-gray-400" style={{ fontSize: "0.68rem" }}>
              Step {step} of 5 — {stepLabels[step - 1]}
            </p>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(16,185,129,0.10)",
            border: "1px solid rgba(16,185,129,0.28)",
            color: EMERALD_DARK,
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {step}/5
        </span>
      </div>

      {/* Step progress */}
      {step < 5 && (
        <div className="mx-auto flex w-full max-w-[430px] gap-1.5 px-5 pb-2 pt-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="mx-auto flex-1 w-full max-w-[430px] overflow-auto px-5 py-4">
        {/* STEP 1 — Disclaimer */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-8 h-8 text-emerald-600" />
              </div>
              <h2
                className="text-gray-800"
                style={{ fontSize: "1.15rem", fontWeight: 700 }}
              >
                Important Disclaimer
              </h2>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p
                className="text-amber-800 leading-relaxed whitespace-pre-line"
                style={{ fontSize: "0.82rem" }}
              >
                {data.disclaimer || "Walang disclaimer na nailagay ang admin."}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
              {[
                "This is NOT a medical diagnosis",
                "Always seek professional help for serious symptoms",
                "Call emergency services for life-threatening conditions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <CircleAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-gray-600" style={{ fontSize: "0.8rem" }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAgreed(!agreed)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                agreed
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  agreed ? "bg-emerald-500" : "bg-gray-200"
                }`}
              >
                {agreed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span
                className={`${
                  agreed ? "text-emerald-700" : "text-gray-600"
                } text-left`}
                style={{ fontSize: "0.82rem" }}
              >
                I understand this is a guidance tool, not a medical diagnosis
              </span>
            </button>
          </div>
        )}

        {/* STEP 2 — Patient Context */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2
                className="text-gray-800 mb-1"
                style={{ fontSize: "1.1rem", fontWeight: 700 }}
              >
                Patient Information
              </h2>
              <p className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                Select age group and who is using the tool
              </p>
            </div>

            {/* Age groups */}
            <div>
              <p
                className="text-gray-600 font-semibold mb-3"
                style={{ fontSize: "0.82rem" }}
              >
                Age Group
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {enabledAgeGroups.length > 0 ? (
                  enabledAgeGroups.map((ag, i) => {
                    const Icon = ageIcons[i] || User;
                    const active = selectedAge === ag.id;
                    return (
                      <button
                        key={ag.id}
                        onClick={() => setSelectedAge(ag.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                          active
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl ${
                            active ? "bg-emerald-200" : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${
                              active ? "text-emerald-700" : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-medium ${
                              active ? "text-emerald-700" : "text-gray-700"
                            }`}
                            style={{ fontSize: "0.8rem" }}
                          >
                            {ag.label}
                          </p>
                          <p
                            className="text-gray-400"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {ag.rangeDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">
                    Walang age groups na na-set.
                  </p>
                )}
              </div>
            </div>

            {/* User type */}
            <div>
              <p
                className="text-gray-600 font-semibold mb-3"
                style={{ fontSize: "0.82rem" }}
              >
                Who is using this tool?
              </p>
              <div className="space-y-2">
                {enabledUserTypes.length > 0 ? (
                  enabledUserTypes.map((ut) => {
                    const active = selectedUserType === ut.id;
                    return (
                      <button
                        key={ut.id}
                        onClick={() => setSelectedUserType(ut.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          active
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            active
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-gray-300"
                          }`}
                        >
                          {active && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-medium ${
                              active ? "text-emerald-700" : "text-gray-700"
                            }`}
                            style={{ fontSize: "0.82rem" }}
                          >
                            {ut.label}
                          </p>
                          <p
                            className="text-gray-400"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {ut.description}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">
                    Walang user types na na-set.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Red Flags */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2
                className="text-gray-800 mb-1"
                style={{ fontSize: "1.1rem", fontWeight: 700 }}
              >
                Red Flag Screening
              </h2>
              <p className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                Check if ANY of these emergency symptoms are present
              </p>
            </div>

            {checkedFlags.size > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3">
                <CircleAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p
                    className="text-red-700 font-semibold"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Emergency Detected
                  </p>
                  <p className="text-red-600" style={{ fontSize: "0.7rem" }}>
                    {checkedFlags.size} red flag(s) selected — will trigger
                    emergency response
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {data.redFlags?.length > 0 ? (
                data.redFlags.map((flag) => {
                  const checked = checkedFlags.has(flag.id);
                  return (
                    <button
                      key={flag.id}
                      onClick={() => toggleFlag(flag.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        checked
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          checked ? "bg-red-500" : "bg-gray-200"
                        }`}
                      >
                        {checked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            checked ? "text-red-700" : "text-gray-700"
                          }`}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {flag.symptom}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded-md ${
                              flag.severity === "Critical"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                            style={{ fontSize: "0.6rem", fontWeight: 600 }}
                          >
                            {flag.severity}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">
                  Walang nakalagay na red flags ang admin.
                </p>
              )}
            </div>

            {checkedFlags.size === 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3 mt-2">
                <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-emerald-700" style={{ fontSize: "0.78rem" }}>
                  If none apply, tap <strong>Next</strong> to continue
                  assessment
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Symptom Clusters */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2
                className="text-gray-800 mb-1"
                style={{ fontSize: "1.1rem", fontWeight: 700 }}
              >
                Symptom Assessment
              </h2>
              <p className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                Select a category and answer the screening questions
              </p>
            </div>

            {/* AGE-AWARE: walang applicable na kategorya para sa napiling edad */}
            {visibleClusters.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <CircleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-amber-800 font-semibold"
                    style={{ fontSize: "0.82rem" }}
                  >
                    Walang naka-set na tanong para sa edad na ito
                  </p>
                  <p className="text-amber-700 mt-0.5" style={{ fontSize: "0.75rem" }}>
                    Mangyaring kumonsulta sa inyong Barangay Health Worker. Tapikin
                    ang <strong>Get Result</strong> para sa gabay.
                  </p>
                </div>
              </div>
            )}

            {/* Cluster tabs */}
            <div className={`flex gap-2 overflow-x-auto pb-1 ${visibleClusters.length === 0 ? "hidden" : ""}`}>
              {visibleClusters.map((cluster) => {
                const active = activeCluster === cluster.id;
                const walk = walkCluster(cluster, answers, selectedAge);
                const complete = walk.complete;
                const inProgress = walk.started && !walk.complete;
                return (
                  <button
                    key={cluster.id}
                    onClick={() => setActiveCluster(active ? null : cluster.id)}
                    className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                      active
                        ? "bg-emerald-600 text-white"
                        : complete
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : inProgress
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-white text-gray-600 border border-gray-200"
                    }`}
                    style={{ fontSize: "0.78rem", fontWeight: 500 }}
                  >
                    {cluster.name}
                    {complete && !active && (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    {inProgress && !active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-500"
                        aria-label="in progress"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Questions — GUIDED (isa-isa, sumusunod sa decision tree) */}
            {visibleClusters.length > 0 &&
              (activeVisibleCluster && activeWalk ? (
                <div className="space-y-3">
                  {/* Mga nasagot na tanong sa daan (pwedeng baguhin) */}
                  {activeWalk.path.map((p) => renderQuestionCard(p.question))}

                  {/* Kasalukuyang tanong (kung hindi pa terminal) */}
                  {activeWalk.current && renderQuestionCard(activeWalk.current)}

                  {/* Outcome ng kategorya kapag naabot na ang dulo ng tree */}
                  {activeWalk.complete && activeWalk.terminal && (() => {
                    const style =
                      resultStyles[activeWalk.terminal] ||
                      resultStyles["Non-Urgent"];
                    return (
                      <div
                        className={`${style.bg} ${style.border} border-2 rounded-2xl p-4 flex items-start gap-3`}
                      >
                        <CircleCheck className={`w-5 h-5 shrink-0 ${style.text}`} />
                        <div>
                          <p
                            className={`font-semibold ${style.text}`}
                            style={{ fontSize: "0.82rem" }}
                          >
                            Batay sa mga sagot, ang kategoryang ito ay:{" "}
                            {activeWalk.terminal}
                          </p>
                          <p
                            className={`${style.text} opacity-80 mt-0.5`}
                            style={{ fontSize: "0.72rem" }}
                          >
                            Tapikin ang <strong>Get Result</strong> sa ibaba, o
                            pumili ng ibang kategorya kung mayroon pang ibang
                            sintomas.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-2xl p-8 text-center">
                  <Stethoscope className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500" style={{ fontSize: "0.82rem" }}>
                    Select a symptom category above
                  </p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "0.7rem" }}>
                    Answer the questions to get guidance
                  </p>
                </div>
              ))}

            {/* SAFETY: paalala kung hindi pa kumpleto ang assessment */}
            {visibleClusters.length > 0 && !isStep4Complete() && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                <CircleAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700" style={{ fontSize: "0.75rem" }}>
                  Pumili ng kategorya at sagutin ang mga tanong hanggang makakuha
                  ng resulta ang <strong>bawat</strong> napiling kategorya. Ito ay
                  tumutulong na hindi malampasan ang mahahalagang sintomas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — Result */}
        {step === 5 &&
          finalResult &&
          (() => {
            const style =
              resultStyles[finalResult.urgency as Urgency] ||
              resultStyles["Non-Urgent"];
            const ResultIcon = style.icon;
            return (
              <div className="space-y-5">
                {/* Result card */}
                <div
                  className={`${style.bg} ${style.border} border-2 rounded-2xl p-6 text-center`}
                >
                  <div
                    className={`w-16 h-16 ${style.btnBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <ResultIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2
                    className={`${style.text}`}
                    style={{ fontSize: "1.2rem", fontWeight: 800 }}
                  >
                    {finalResult.title}
                  </h2>
                  <p
                    className={`${style.text} mt-2 opacity-80`}
                    style={{ fontSize: "0.82rem" }}
                  >
                    {finalResult.description}
                  </p>
                </div>

                {/* Patient context — informational lang, hindi nakakaapekto sa resulta */}
                {(selectedAgeLabel || selectedUserTypeLabel) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAgeLabel && (
                      <span
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600"
                        style={{ fontSize: "0.72rem" }}
                      >
                        Age: <strong className="text-gray-800">{selectedAgeLabel}</strong>
                      </span>
                    )}
                    {selectedUserTypeLabel && (
                      <span
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600"
                        style={{ fontSize: "0.72rem" }}
                      >
                        User: <strong className="text-gray-800">{selectedUserTypeLabel}</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                  <div>
                    <p
                      className="text-gray-500 font-semibold mb-2"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      What to do
                    </p>
                    <p
                      className="text-gray-700 leading-relaxed whitespace-pre-line"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {finalResult.defaultAction}
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p
                      className="text-gray-500 font-semibold mb-2"
                      style={{
                        fontSize: "0.72rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      If condition worsens
                    </p>
                    <p
                      className="text-gray-600 leading-relaxed whitespace-pre-line"
                      style={{ fontSize: "0.82rem" }}
                    >
                      {finalResult.escalationNote}
                    </p>
                  </div>
                </div>

                {/* Red flags found */}
                {checkedFlags.size > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p
                      className="text-red-700 font-semibold mb-2"
                      style={{ fontSize: "0.82rem" }}
                    >
                      Red Flags Detected:
                    </p>
                    <ul className="space-y-1.5">
                      {data.redFlags
                        .filter((f) => checkedFlags.has(f.id))
                        .map((f) => (
                          <li key={f.id} className="flex items-start gap-2">
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span
                              className="text-red-700"
                              style={{ fontSize: "0.78rem" }}
                            >
                              {f.symptom}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2.5">
                  {(finalResult.urgency === "Emergency" ||
                    finalResult.urgency === "Urgent") && (
                    <a
                      href={`tel:${NATIONAL_EMERGENCY_NUMBER}`}
                      className={`w-full ${style.btnBg} text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold`}
                      style={{ fontSize: "0.9rem" }}
                    >
                      <Phone className="w-5 h-5" />
                      Call Emergency Services ({NATIONAL_EMERGENCY_NUMBER})
                    </a>
                  )}
                  <button
                    onClick={restartTriage}
                    className="w-full bg-gray-100 text-gray-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start New Assessment
                  </button>
                  <button
                    onClick={onBack}
                    className="w-full bg-white border border-gray-200 text-gray-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </button>
                </div>

                <p
                  className="text-center text-gray-300"
                  style={{ fontSize: "0.65rem" }}
                >
                  This result is for guidance only and does not constitute a
                  medical diagnosis
                </p>
              </div>
            );
          })()}
      </div>

      {/* Bottom action bar (not on step 5) */}
      {step < 5 && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4">
          <div className="mx-auto w-full max-w-[430px]">
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition-all cursor-pointer ${
                step === 3 && checkedFlags.size > 0
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : canNext()
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              style={{ fontSize: "0.9rem" }}
            >
              {step === 3 && checkedFlags.size > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Detected - View Result
                </>
              ) : step === 4 ? (
                "Get Result"
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
