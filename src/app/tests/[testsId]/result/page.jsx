"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStudentTestStore } from "@/store/studentTestStore";
import { upsertTestResult } from "@/actions/student/test.actions";
import { useEffect, useRef } from "react";

export default function TestResultPage() {
  const hasSavedRef = useRef(false);
  const router = useRouter();
  const attemptNo = useStudentTestStore((s) => s.attemptNo);
  const { testId, student, questions, answers, resetTest } = useStudentTestStore();

  let score = 0;

  questions.forEach((q) => {
    const selectedKey = answers[q.id]; // "A" | "B" | "C" | "D"

    if (!selectedKey) return;

    const selectedText =
      selectedKey === "A" ? q.option_a :
        selectedKey === "B" ? q.option_b :
          selectedKey === "C" ? q.option_c :
            selectedKey === "D" ? q.option_d :
              null;

    if (selectedText === q.correct_option) {
      score++;
    }
  });


  useEffect(() => {
    if (hasSavedRef.current) return;
    if (!student.name || !student.email || !testId) return;

    hasSavedRef.current = true;

    upsertTestResult({
      student_name: student.name,
      email: student.email,
      score,
      test_id: testId,
      attempt_no: attemptNo,
    }).then((res) => {
      if (!res.success) {
        console.error("Failed to save result:", res.error);
        // Optional: Alert user if save fails, critical for attempt counting
        alert("Warning: usage limit not updated. Please contact support if issues persist.");
      }
    });
  }, [student.name, student.email, testId, score, attemptNo]);



  return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center py-10">
      <Card className="max-w-3xl w-full rounded-xl bg-white shadow-sm border border-slate-300">

        <CardHeader className="space-y-6 pb-6 border-b border-slate-100">
          <CardTitle className="text-3xl font-bold text-slate-900 text-center">
            Exam Completed
          </CardTitle>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">

            {/* Profile Card */}
            <div className="flex-1 w-full md:max-w-xs h-32 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-600 font-bold text-lg">{student.name ? student.name.charAt(0).toUpperCase() : "S"}</span>
              </div>
              <p className="text-base font-bold text-slate-900 truncate w-full px-2">{student.name}</p>
              <p className="text-xs text-slate-500 truncate w-full px-2">{student.email}</p>
            </div>

            {/* Score Circle */}
            <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 border-4 border-white shadow-lg ring-1 ring-slate-100 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">out of {questions.length}</span>
            </div>

          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const selectedKey = answers[q.id];
              const selectedText =
                selectedKey === "A" ? q.option_a :
                  selectedKey === "B" ? q.option_b :
                    selectedKey === "C" ? q.option_c :
                      selectedKey === "D" ? q.option_d : "";

              // Check against DB result (Robust check: Key OR Text match)
              const dbCorrect = q.correct_option?.toString().trim();
              const isCorrectKey = selectedKey === dbCorrect;
              const isCorrectText = selectedText?.toString().trim() === dbCorrect;

              const correct = isCorrectKey || isCorrectText;

              return (
                <div
                  key={q.id}
                  className={`flex gap-4 p-4 rounded-xl border transition-all duration-200
                  ${correct
                      ? "bg-green-50/50 border-green-200"
                      : "bg-red-50/50 border-red-200"}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {correct ? (
                      <CheckCircle className="text-green-600 w-5 h-5" />
                    ) : (
                      <XCircle className="text-red-500 w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                      {q.question_text}
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className={`p-2.5 rounded-lg border ${correct ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                        <span className="font-bold uppercase text-[10px] opacity-70 block mb-0.5">Your Answer</span>
                        {answers[q.id]
                          ? (
                            answers[q.id] === "A" ? q.option_a :
                              answers[q.id] === "B" ? q.option_b :
                                answers[q.id] === "C" ? q.option_c :
                                  answers[q.id] === "D" ? q.option_d :
                                    "Not Answered"
                          )
                          : "Not Answered"
                        }
                      </div>
                      <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-700">
                        <span className="font-bold uppercase text-[10px] text-slate-400 block mb-0.5">Correct Answer</span>
                        {q.correct_option}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 pt-6 pb-2">
            <Button
              onClick={() => {
                resetTest();
                router.push('/');
              }}
              className="rounded-full px-8 h-10 text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md font-medium"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
