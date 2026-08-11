import type { TriageFlowData } from "./types";
import { NATIONAL_EMERGENCY_NUMBER } from "../constants/emergency";

export const initialData: TriageFlowData = {
  schemaVersion: 2,
  disclaimer:
    "This triage tool is intended as a decision-support aid for trained Barangay Health Workers (BHWs) only. It does not replace professional medical judgment. In any life-threatening situation, call emergency services immediately. The recommendations provided are based on DOH-approved community health protocols and should be used in conjunction with proper training. Always refer patients to the nearest health facility when in doubt.",

  ageGroups: [
    { id: 1, label: "Newborn", rangeDesc: "0 – 28 days", enabled: true },
    { id: 2, label: "Infant", rangeDesc: "1 – 11 months", enabled: true },
    { id: 3, label: "Young Child", rangeDesc: "1 – 5 years", enabled: true },
    { id: 4, label: "Child", rangeDesc: "6 – 12 years", enabled: true },
    { id: 5, label: "Adolescent", rangeDesc: "13 – 17 years", enabled: true },
    { id: 6, label: "Adult", rangeDesc: "18 – 59 years", enabled: true },
    { id: 7, label: "Elderly", rangeDesc: "60 years and above", enabled: true },
  ],

  userTypes: [
    { id: 1, label: "Barangay Health Worker", description: "Community-based primary health worker with BHW certification", enabled: true },
    { id: 2, label: "Barangay Nutrition Scholar", description: "Nutrition-focused community volunteer", enabled: true },
    { id: 3, label: "Midwife", description: "Licensed midwife at health station or RHU", enabled: false },
    { id: 4, label: "Rural Health Physician", description: "Doctor assigned to municipal health office", enabled: false },
  ],

  redFlags: [
    { id: 1, symptom: "Unconscious or unresponsive", severity: "Critical", instruction: `Do not move. Call emergency services (${NATIONAL_EMERGENCY_NUMBER}). Check airway and breathing.` },
    { id: 2, symptom: "Severe difficulty breathing or gasping", severity: "Critical", instruction: "Sit patient upright. Clear airway. Call emergency transport immediately." },
    { id: 3, symptom: "Active seizure / convulsion", severity: "Critical", instruction: "Place on side. Do NOT restrain or put anything in mouth. Time the seizure. Call for help." },
    { id: 4, symptom: "Severe bleeding that won't stop", severity: "Critical", instruction: "Apply firm direct pressure with clean cloth. Elevate if limb. Arrange immediate transport." },
    { id: 5, symptom: "Chest pain with sweating and arm/jaw pain", severity: "Critical", instruction: "Keep patient still and calm. Give aspirin if available and not allergic. Call emergency." },
    { id: 6, symptom: "Signs of severe dehydration (sunken eyes, can't drink, skin pinch very slow)", severity: "High", instruction: "Begin ORS immediately. Arrange transport to health facility for IV fluids." },
    { id: 7, symptom: "High fever (>39°C) in child under 5 with danger signs", severity: "High", instruction: "Give paracetamol. Tepid sponging. Transport to hospital. Do not delay." },
    { id: 8, symptom: "Sudden severe headache with stiff neck and fever", severity: "High", instruction: "Possible meningitis. Do not wait. Refer immediately to hospital." },
    { id: 9, symptom: "Snake or animal bite with swelling or difficulty breathing", severity: "High", instruction: "Keep patient still. Do NOT apply tourniquet or suck venom. Transport to hospital with anti-venom." },
    { id: 10, symptom: "Ingestion of poison or unknown substance", severity: "High", instruction: "Do NOT induce vomiting. Identify substance if possible. Call Poison Control or bring to ER immediately." },
  ],

  symptomClusters: [
    {
      id: 1, name: "Fever & Infection", description: "Assessment questions for fever-related complaints",
      questions: [
        { id: 101, question: "Temperature above 39°C (102.2°F)?", yesBranch: { label: "High Fever", urgency: "Urgent", action: "Give paracetamol. Tepid sponge. Refer to RHU if persists >24hrs or danger signs.", target: { type: "result", urgency: "Urgent" }, ageEscalations: [{ ageGroupIds: [1, 2], urgency: "Emergency" }] }, noBranch: { label: "Check more", urgency: "Non-Urgent", action: "Proceed to check for rash or joint pain.", target: { type: "question", questionId: 102 } } },
        { id: 102, question: "Fever with rash or joint pain?", yesBranch: { label: "Possible Dengue", urgency: "Urgent", action: "Perform tourniquet test. Avoid aspirin. Refer for CBC and dengue NS1.", target: { type: "result", urgency: "Urgent" } }, noBranch: { label: "Check duration", urgency: "Non-Urgent", action: "Check if fever is prolonged.", target: { type: "question", questionId: 103 } } },
        { id: 103, question: "Fever lasting more than 7 days?", yesBranch: { label: "Prolonged Fever", urgency: "Urgent", action: "Refer to RHU for blood culture, typhoid screening, and evaluation.", target: { type: "result", urgency: "Urgent" } }, noBranch: { label: "Acute fever", urgency: "Semi-Urgent", action: "Continue monitoring. Give paracetamol. Return if worsening.", target: { type: "result", urgency: "Semi-Urgent" } } },
      ],
    },
    {
      id: 2, name: "Respiratory", description: "Assessment questions for breathing and cough complaints",
      questions: [
        { id: 201, question: "Fast breathing for age group?", yesBranch: { label: "Possible Pneumonia", urgency: "Urgent", action: "Give first dose amoxicillin. Count respiratory rate. Refer to health facility.", target: { type: "result", urgency: "Urgent" } }, noBranch: { label: "Check cough duration", urgency: "Non-Urgent", action: "Continue to check cough duration.", target: { type: "question", questionId: 202 } } },
        { id: 202, question: "Cough lasting more than 2 weeks?", yesBranch: { label: "Possible TB", urgency: "Urgent", action: "Collect sputum sample. Refer for GeneXpert and chest X-ray. Isolate.", target: { type: "result", urgency: "Urgent" } }, noBranch: { label: "Check wheezing", urgency: "Non-Urgent", action: "Check for wheezing symptoms.", target: { type: "question", questionId: 203 } } },
        { id: 203, question: "Wheezing or chest tightness?", yesBranch: { label: "Possible Asthma", urgency: "Semi-Urgent", action: "Give salbutamol nebulization. Monitor 20 min. Refer if no improvement.", target: { type: "result", urgency: "Semi-Urgent" } }, noBranch: { label: "No wheeze", urgency: "Non-Urgent", action: "Supportive treatment. Follow up if symptoms persist.", target: { type: "result", urgency: "Non-Urgent" } } },
      ],
    },
    {
      id: 3, name: "Gastrointestinal", description: "Assessment questions for diarrhea, vomiting, and abdominal pain",
      questions: [
        { id: 301, question: "Blood in stool?", yesBranch: { label: "Dysentery", urgency: "Urgent", action: "Give ORS. Do NOT give anti-diarrheal. Collect stool sample. Refer for antibiotics.", target: { type: "result", urgency: "Urgent" } }, noBranch: { label: "Check dehydration", urgency: "Semi-Urgent", action: "Check hydration level.", target: { type: "question", questionId: 302 } } },
        { id: 302, question: "Signs of some dehydration (thirsty, restless, dry mouth)?", yesBranch: { label: "Moderate Dehydration", urgency: "Semi-Urgent", action: "ORS Plan B: 75ml/kg over 4 hours. Reassess after. Refer if worsening.", target: { type: "result", urgency: "Semi-Urgent" } }, noBranch: { label: "No dehydration", urgency: "Non-Urgent", action: "ORS Plan A: after each loose stool. Continue feeding. Follow up daily.", target: { type: "result", urgency: "Non-Urgent" } } },
      ],
    },
    {
      id: 4, name: "Maternal Health", description: "Assessment questions for pregnant and postpartum patients",
      ageGroupIds: [5, 6],
      questions: [
        { id: 401, question: "Vaginal bleeding during pregnancy?", yesBranch: { label: "Obstetric Emergency", urgency: "Emergency", action: "Do NOT do internal exam. Position on left side. Arrange immediate hospital transfer.", target: { type: "result", urgency: "Emergency" } }, noBranch: { label: "Check pre-eclampsia", urgency: "Non-Urgent", action: "Check for pre-eclampsia signs.", target: { type: "question", questionId: 402 } } },
        { id: 402, question: "Severe headache with blurred vision and swelling (pre-eclampsia signs)?", yesBranch: { label: "Possible Pre-eclampsia", urgency: "Emergency", action: "Check BP if available. Keep patient calm and lying down. Urgent referral to hospital.", target: { type: "result", urgency: "Emergency" } }, noBranch: { label: "Normal pregnancy complaint", urgency: "Non-Urgent", action: "Routine prenatal advice. Schedule next checkup.", target: { type: "result", urgency: "Non-Urgent" } } },
      ],
    },
  ],

  resultConfigs: [
    { urgency: "Emergency", title: "Emergency — Immediate Referral", description: "Life-threatening conditions requiring immediate hospital transfer", defaultAction: "Call emergency services or arrange fastest transport to nearest hospital. BHW to accompany patient. Provide first aid while waiting.", escalationNote: "If no transport available, call Municipal Health Officer hotline immediately.", color: "red", timeframe: "Immediate", followUp: "Continuous monitoring until hospital handoff" },
    { urgency: "Urgent", title: "Urgent — Same-Day Referral", description: "Serious conditions requiring medical evaluation within hours", defaultAction: "Refer to Rural Health Unit or Municipal Health Center within 4 hours. Give first dose of appropriate medication if trained. Document vitals.", escalationNote: "If condition worsens before transport, escalate to Emergency protocol.", color: "orange", timeframe: "Within 4 hours", followUp: "Check status every 2 hours until seen by physician" },
    { urgency: "Semi-Urgent", title: "Semi-Urgent — Scheduled Visit", description: "Conditions needing professional evaluation within 1–3 days", defaultAction: "Schedule visit to health facility within 72 hours. Provide home care instructions. BHW to follow up daily by visit or phone.", escalationNote: "If symptoms worsen or new danger signs appear, escalate to Urgent.", color: "amber", timeframe: "Within 72 hours", followUp: "Daily follow-up by BHW (visit or phone)" },
    { urgency: "Non-Urgent", title: "Non-Urgent — Home Care", description: "Minor conditions manageable with home care and BHW guidance", defaultAction: "Provide health education and home care instructions. Ensure patient knows when to return. Schedule follow-up in 5–7 days.", escalationNote: "If no improvement after 3 days or symptoms change, reassess from the beginning.", color: "emerald", timeframe: "5–7 days", followUp: "Follow-up visit in 5–7 days" },
  ],
};
