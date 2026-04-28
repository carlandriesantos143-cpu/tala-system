import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabase/client";
import { toast } from "sonner"; 
import {
  ShieldCheck,
  Users,
  AlertCircle,
  Layers,
  Settings2,
  Activity,
  CheckCircle2,
} from "lucide-react";
import type { TriageFlowData } from "../../triage/types";
import { initialData } from "../../triage/initialData";
import { StepDisclaimer } from "../../triage/steps/StepDisclaimer";
import { StepPatientContext } from "../../triage/steps/StepPatientContext";
import { StepRedFlags } from "../../triage/steps/StepRedFlags";
import { StepSymptomClusters } from "../../triage/steps/StepSymptomClusters";
import { StepResultConfig } from "../../triage/steps/StepResultConfig";

const steps = [
  { id: 1, label: "Disclaimer", icon: ShieldCheck, description: "Opening message" },
  { id: 2, label: "Patient Context", icon: Users, description: "Age groups & user types" },
  { id: 3, label: "Red Flags", icon: AlertCircle, description: "Emergency symptoms" },
  { id: 4, label: "Symptom Clusters", icon: Layers, description: "Categories & questions" },
  { id: 5, label: "Results", icon: Settings2, description: "Outcome instructions" },
];

export function TriagePage() {
  const [activeStep, setActiveStep] = useState(1);
  const [data, setData] = useState<TriageFlowData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Kukunin natin ang saved data galing Supabase kapag nag-load ang page
useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Hahanapin na natin ngayon ang 'data' column
        const { data: configRow, error } = await supabase
          .from('triage_config')
          .select('data')
          .limit(1)
          .maybeSingle(); // Para safe kahit walang laman ang table sa umpisa

        if (error) {
           throw error; 
        } 
        
        if (configRow?.data) {
          // Kung may naka-save na data, ilagay sa state
          setData(configRow.data as TriageFlowData);
        }
      } catch (err) {
        console.error("Error fetching triage config:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. I-check muna natin kung may existing row na sa database
      const { data: existingRow } = await supabase
        .from('triage_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingRow) {
        // 2. Kung may row na, i-UPDATE natin yung data column
        const { error } = await supabase
          .from('triage_config')
          .update({ data: data })
          .eq('id', existingRow.id);
          
        if (error) throw error;
      } else {
        // 3. Kung wala pang row (first time), mag-INSERT tayo
        const { error } = await supabase
          .from('triage_config')
          .insert([{ data: data }]);
          
        if (error) throw error;
      }

      toast.success("Triage configuration saved successfully!");
    } catch (err) {
      console.error("Error saving triage config:", err);
      toast.error("Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const stepStats: Record<number, string> = {
    1: data.disclaimer ? "Configured" : "Not set",
    2: `${data.ageGroups.length} groups · ${data.userTypes.length} types`,
    3: `${data.redFlags.length} flags`,
    4: `${data.symptomClusters.length} categories · ${data.symptomClusters.reduce((sum, c) => sum + c.questions.length, 0)} questions`,
    5: `${data.resultConfigs.length} levels`,
  };

  const totalQuestions = data.symptomClusters.reduce((s, c) => s + c.questions.length, 0);
  const totalBranches = totalQuestions * 2;
  const nextQuestionLinks = data.symptomClusters.reduce((s, c) => s + c.questions.reduce((qs, q) => qs + (q.yesBranch.target?.type === "question" ? 1 : 0) + (q.noBranch.target?.type === "question" ? 1 : 0), 0), 0);

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <StepDisclaimer
            disclaimer={data.disclaimer}
            onChange={(text) => setData({ ...data, disclaimer: text })}
          />
        );
      case 2:
        return (
          <StepPatientContext
            ageGroups={data.ageGroups}
            userTypes={data.userTypes}
            onChangeAgeGroups={(g) => setData({ ...data, ageGroups: g })}
            onChangeUserTypes={(t) => setData({ ...data, userTypes: t })}
          />
        );
      case 3:
        return (
          <StepRedFlags
            redFlags={data.redFlags}
            onChange={(flags) => setData({ ...data, redFlags: flags })}
          />
        );
      case 4:
        return (
          <StepSymptomClusters
            clusters={data.symptomClusters}
            onChange={(clusters) => setData({ ...data, symptomClusters: clusters })}
          />
        );
      case 5:
        return (
          <StepResultConfig
            configs={data.resultConfigs}
            onChange={(configs) => setData({ ...data, resultConfigs: configs })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50/50">
      {/* Step Sidebar */}
      <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3
              className="text-gray-800 font-semibold"
              style={{ fontSize: "0.95rem" }}
            >
              Triage Flow Editor
            </h3>
          </div>
          <p
            className="text-gray-400 mt-1"
            style={{ fontSize: "0.75rem" }}
          >
            Configure each step of the triage process
          </p>
        </div>

        {/* Step progress */}
        <div className="flex-1 overflow-auto p-3">
          <div className="space-y-1">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isPast = activeStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-emerald-50 border border-emerald-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-emerald-600"
                          : isPast
                          ? "bg-emerald-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {isPast && !isActive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-gray-400"
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 600,
                          }}
                        >
                          STEP {step.id}
                        </span>
                      </div>
                      <p
                        className={`font-medium truncate ${
                          isActive
                            ? "text-emerald-800"
                            : "text-gray-700"
                        }`}
                        style={{ fontSize: "0.82rem" }}
                      >
                        {step.label}
                      </p>
                      <p
                        className="text-gray-400 mt-0.5"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {stepStats[step.id]}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-[2.05rem] top-[3.5rem] w-0.5 h-3 rounded-full ${
                        activeStep > step.id
                          ? "bg-emerald-300"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flow summary */}
        <div className="p-4 mx-3 mb-4 bg-emerald-50 rounded-xl">
          <p
            className="text-emerald-800 font-medium"
            style={{ fontSize: "0.78rem" }}
          >
            Flow Summary
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-emerald-600" style={{ fontSize: "0.7rem" }}>Age Groups</span>
              <span className="text-emerald-800 font-semibold" style={{ fontSize: "0.7rem" }}>{data.ageGroups.filter((g) => g.enabled).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600" style={{ fontSize: "0.7rem" }}>Red Flags</span>
              <span className="text-emerald-800 font-semibold" style={{ fontSize: "0.7rem" }}>{data.redFlags.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600" style={{ fontSize: "0.7rem" }}>Questions</span>
              <span className="text-emerald-800 font-semibold" style={{ fontSize: "0.7rem" }}>{totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600" style={{ fontSize: "0.7rem" }}>Branch Paths</span>
              <span className="text-emerald-800 font-semibold" style={{ fontSize: "0.7rem" }}>{totalBranches}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-600" style={{ fontSize: "0.7rem" }}>Question Links</span>
              <span className="text-emerald-800 font-semibold" style={{ fontSize: "0.7rem" }}>{nextQuestionLinks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
              {(() => {
                const s = steps.find((s) => s.id === activeStep)!;
                const Icon = s.icon;
                return <Icon className="w-5 h-5 text-emerald-600" />;
              })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-gray-400"
                  style={{ fontSize: "0.7rem", fontWeight: 600 }}
                >
                  STEP {activeStep} OF 5
                </span>
              </div>
              <h3
                className="text-gray-800 font-semibold"
                style={{ fontSize: "1.05rem" }}
              >
                {steps.find((s) => s.id === activeStep)?.label}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                style={{ fontSize: "0.85rem" }}
              >
                Previous
              </button>
            )}
            
            {activeStep < 5 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                style={{ fontSize: "0.85rem" }}
              >
                Next Step
              </button>
            ) : (
              /* DITO LALABAS ANG SAVE BUTTON SA STEP 5 */
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ fontSize: "0.85rem" }}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            )}
          </div>
        </div>

        {/* Step progress bar */}
        <div className="px-8 pt-4 shrink-0">
          <div className="flex gap-1.5">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step.id <= activeStep
                    ? "bg-emerald-500"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}