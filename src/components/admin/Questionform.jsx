"use client";

import { useState, useEffect } from "react";
// Removed import { Button } from "@/components/ui/button";  <-- Using custom styled button
// Removed import { Input } from "@/components/ui/input";    <-- Using custom styled input
// Removed import { Textarea } from "@/components/ui/textarea"; <-- Using custom styled textarea
import { Save, CheckCircle2 } from "lucide-react";

/**
 * Styling helpers to match the Blue/Sky theme
 */
const inputClasses = "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white hover:border-blue-200";
const labelClasses = "block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1 ml-1";

const EMPTY_FORM = {
  question_text: "",
  section_type: "VERBAL",
  options: ["", "", "", ""],
  correct_option: "",
};

export default function Questionform({ initialData, onSubmit, submitLabel = "Save Question" }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setForm({
      question_text: initialData.question_text ?? "",
      section_type: initialData.section_type ?? "VERBAL",
      options: [
        initialData.option_a ?? "",
        initialData.option_b ?? "",
        initialData.option_c ?? "",
        initialData.option_d ?? "",
      ],
      correct_option: initialData.correct_option ?? "",
    });
  }, [initialData]);

  const updateOption = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.question_text.trim()) return setError("Question text is required");
    if (!form.correct_option)
      return setError("Correct option is required");

    const payload = {
      question_text: form.question_text.trim(),
      option_a: form.options[0] || null,
      option_b: form.options[1] || null,
      option_c: form.options[2] || null,
      option_d: form.options[3] || null,
      correct_option: form.correct_option,
      section_type: form.section_type,
    };

    setLoading(true);
    try {
      // ✅ Call the server action via parent prop
      await onSubmit(payload);

      // Reset form after success ONLY if it's creating (no initialData)
      if (!initialData) {
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setError(err.message || "Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Section */}
      <div>
        <label className={labelClasses}>Section Type</label>
        <select
          className={inputClasses}
          value={form.section_type}
          onChange={(e) => setForm({ ...form, section_type: e.target.value })}
        >
          <option value="VERBAL">Verbal Reasoning</option>
          <option value="QUANT">Quantitative Reasoning</option>
        </select>
      </div>

      {/* Question */}
      <div>
        <label className={labelClasses}>Question Text</label>
        <textarea
          className={`${inputClasses} min-h-[80px] resize-y`}
          value={form.question_text}
          onChange={(e) => setForm({ ...form, question_text: e.target.value })}
          placeholder="Type your question here..."
          required
        />
      </div>

      {/* Options */}
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {form.options.map((opt, i) => (
            <div key={i}>
              <label className={labelClasses}>Option {String.fromCharCode(65 + i)}</label>
              <input
                className={inputClasses}
                value={opt}
                placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                onChange={(e) => updateOption(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
          <label className={`${labelClasses} text-blue-800`}>Correct Answer</label>
          <select
            className={`${inputClasses} bg-white border-blue-200 focus:ring-blue-500`}
            value={form.correct_option}
            onChange={(e) =>
              setForm({ ...form, correct_option: e.target.value })
            }
          >
            <option value="">Select the correct valid option</option>
            {form.options.map(
              (opt, i) => opt && <option key={i} value={opt}>{opt}</option>
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-xs disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}