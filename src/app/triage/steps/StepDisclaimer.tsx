import React, { useState } from "react";
import { Edit2, Save, X, ShieldCheck } from "lucide-react";

interface Props {
  disclaimer: string;
  onChange: (text: string) => void;
}

export function StepDisclaimer({ disclaimer, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(disclaimer);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(disclaimer);
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-800 font-semibold text-[1.05rem]">
            Disclaimer Text
          </h3>
          <p className="text-gray-400 mt-1 text-[0.8rem]">
            This message is shown at the start of every triage session before any questions begin.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => { setDraft(disclaimer); setEditing(true); }}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer text-[0.85rem]"
          >
            <Edit2 className="w-4 h-4" /> Edit Disclaimer
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 bg-amber-50 border-b border-amber-100">
          <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
          <span className="text-amber-700 font-medium text-[0.8rem]">
            Disclaimer Preview
          </span>
        </div>
        {editing ? (
          <div className="p-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none leading-relaxed text-[0.875rem]"
              placeholder="Enter the disclaimer text that BHWs will see before starting triage..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer text-[0.85rem]"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer text-[0.85rem]"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[0.875rem]">
              {disclaimer}
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-blue-100 p-1.5 rounded-lg shrink-0 mt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <p className="text-blue-700 leading-relaxed text-[0.78rem]">
          <strong>Tip:</strong> Keep the disclaimer clear and concise. It should remind BHWs that this tool supports — but does not replace — their training and professional medical advice.
        </p>
      </div>
    </div>
  );
}
