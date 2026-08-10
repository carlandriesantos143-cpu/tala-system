import {
  AlertTriangle,
  Phone,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { NATIONAL_EMERGENCY_NUMBER } from "../../constants/emergency";

interface EmergencyScreenProps {
  onBack: () => void;
}

const emergencyContacts = [
  { name: "National Emergency Hotline", number: NATIONAL_EMERGENCY_NUMBER, description: "Police / Fire / Medical" },
  { name: "PNP Direct Line", number: "117", description: "Philippine National Police" },
  { name: "DOH Hotline", number: "(02) 8651-7800", description: "Department of Health" },
  { name: "Red Cross", number: "143", description: "Philippine Red Cross" },
  { name: "BFP Fire Rescue", number: "(02) 8426-0219", description: "Fire & Rescue" },
];

const immediateSteps = [
  { step: "Stay calm", detail: "Take a deep breath. Panic can delay help." },
  { step: "Ensure safety", detail: "Make sure you and the patient are in a safe location." },
  { step: "Call for help", detail: "Use the numbers below or ask someone nearby to call." },
  { step: "Do not move the patient", detail: "Unless they are in immediate danger (fire, flooding)." },
  { step: "Monitor breathing", detail: "Check if the patient is breathing. If not, begin CPR if trained." },
];

export function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  return (
    <div className="min-h-full bg-red-50">
      {/* Emergency header */}
      <div className="bg-red-600 px-5 pt-4 pb-6">
        <div className="mx-auto w-full max-w-[430px]">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-red-200 hover:text-white cursor-pointer"
            style={{ fontSize: "0.8rem" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to safety
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 animate-pulse">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <h1
              className="text-white"
              style={{ fontSize: "1.5rem", fontWeight: 800 }}
            >
              EMERGENCY
            </h1>
            <p
              className="mt-2 text-red-200"
              style={{ fontSize: "0.85rem" }}
            >
              Call for help immediately
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-3 w-full max-w-[430px] space-y-5 px-5 py-5 pb-8">
        {/* Primary call button */}
        <a
          href={`tel:${NATIONAL_EMERGENCY_NUMBER}`}
          className="block bg-red-600 text-white rounded-2xl p-5 text-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition-colors"
        >
          <Phone className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold" style={{ fontSize: "1.2rem" }}>
            Call {NATIONAL_EMERGENCY_NUMBER}
          </p>
          <p className="text-red-200 mt-1" style={{ fontSize: "0.78rem" }}>
            National Emergency Hotline
          </p>
        </a>

        {/* Other emergency contacts */}
        <div className="space-y-2.5">
          <p
            className="text-red-800 font-semibold"
            style={{ fontSize: "0.85rem" }}
          >
            Other Emergency Numbers
          </p>
          {emergencyContacts.slice(1).map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.number.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-red-100 shadow-sm"
            >
              <div className="bg-red-100 p-2.5 rounded-xl shrink-0">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p
                  className="text-gray-800 font-medium"
                  style={{ fontSize: "0.85rem" }}
                >
                  {contact.name}
                </p>
                <p
                  className="text-gray-400"
                  style={{ fontSize: "0.7rem" }}
                >
                  {contact.description}
                </p>
              </div>
              <span
                className="text-red-600 font-bold"
                style={{ fontSize: "0.9rem" }}
              >
                {contact.number}
              </span>
            </a>
          ))}
        </div>

        {/* Immediate steps */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-600" />
            <p
              className="text-red-700 font-semibold"
              style={{ fontSize: "0.88rem" }}
            >
              While Waiting for Help
            </p>
          </div>
          <div className="space-y-3.5">
            {immediateSteps.map((item, i) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <span
                    className="text-red-600 font-bold"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p
                    className="text-gray-800 font-medium"
                    style={{ fontSize: "0.82rem" }}
                  >
                    {item.step}
                  </p>
                  <p
                    className="text-gray-500 mt-0.5"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-red-100 rounded-2xl p-4 text-center">
          <p
            className="text-red-700"
            style={{ fontSize: "0.72rem", lineHeight: 1.6 }}
          >
            If the person is unconscious, not breathing, or having a seizure —
            do not delay. Call emergency services now and follow their
            instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
