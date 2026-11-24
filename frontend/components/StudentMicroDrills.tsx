"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, Clock3, RotateCcw } from "lucide-react";

type Drill = {
  card_id: number; question_id: number; course_id: string; course_code: string;
  course_title: string; concept_code: string; concept_name: string; mastery: number | null;
  difficulty_label: string; stability_days: number; retention: number; due: boolean;
  next_due: string; state: string; reps: number; prompt: string; options: string[];
  explanation: string; source_citation: string | null; teacher_reviewed: boolean; model_note: string;
};
type AnswerResult = { is_correct: boolean; feedback: string; explanation?: string; source_citation?: string | null; stability?: number; next_due?: string; duplicate?: boolean; correct_idx?: number };
type Attempt = { attempt_id: string; question: string; course_code: string; correct: boolean; confidence: number; reviewed_at: string; stability_after: number; next_due: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function StudentMicroDrills() {
  const [cards, setCards] = useState<Drill[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [filter, setFilter] = useState("all");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reviewedThisSession, setReviewedThisSession] = useState<number[]>([]);
  const [history, setHistory] = useState<Attempt[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/micro-drills/history", { credentials: "same-origin" });
      if (res.ok) setHistory((await res.json()) as Attempt[]);
    } catch { /* History is supplementary to the active queue. */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" });
      if (filter !== "all") params.set("course_id", filter);
      if (priority === "high") params.set("priority", "high");
      const res = await fetch(`/api/micro-drills?${params}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Could not load your review queue.");
      const next = (await res.json()) as Drill[];
      setCards(next);
      setActiveId((current) => current !== null && next.some((card) => card.card_id === current) ? current : (next.find((card) => card.due)?.card_id ?? next[0]?.card_id ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your review queue.");
    } finally {
      setLoading(false);
    }
  }, [filter, priority]);

  useEffect(() => { void load(); void loadHistory(); }, [load, loadHistory]);

  const current = useMemo(() => cards.find((card) => card.card_id === activeId) ?? null, [cards, activeId]);
  const dueCount = cards.filter((card) => card.due).length;
  const courseOptions = Array.from(new Map(cards.map((card) => [card.course_id, card.course_code])).entries());

  async function submit() {
    if (!current || selected === null || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/micro-drills", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: current.card_id, question_id: current.question_id, selected_idx: selected,
          confidence, idempotency_key: crypto.randomUUID() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || "Your answer could not be saved.");
      setFeedback(body as AnswerResult);
      if (!body.duplicate) setReviewedThisSession((done) => done.includes(current.card_id) ? done : [...done, current.card_id]);
      await load();
      await loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Your answer could not be saved.");
    } finally {
      setSending(false);
    }
  }

  function nextCard() {
    if (!cards.length) return;
    const index = cards.findIndex((card) => card.card_id === activeId);
    const ordered = [...cards.slice(index + 1), ...cards.slice(0, index + 1)];
    const next = ordered.find((card) => card.due && card.card_id !== activeId) ?? ordered.find((card) => card.card_id !== activeId);
    if (next) setActiveId(next.card_id);
    setSelected(null); setFeedback(null); setConfidence(3);
  }

  return <section className="space-y-5" aria-labelledby="micro-drills-title">
    <header className="rounded-xl border border-[#CDEBDD] bg-[#F0FAF5] p-5">
      <h2 id="micro-drills-title" className="flex items-center gap-2 text-lg font-bold text-[#0B2E22]"><Brain className="h-5 w-5 text-[#047857]" />Forgetting-aware micro drills</h2>
      <p className="mt-1 text-sm text-[#4B6B5E]">{dueCount} due {dueCount === 1 ? "question" : "questions"} · prioritized from your mastery gaps.</p>
      <p className="mt-2 text-xs text-[#4B6B5E]">Scheduler uses the simplified source curve R(t,S)=(1+t/(9S))⁻¹ with a 90% due threshold and Snew = S × 1.2 after correct recall. This FSRS-style approximation is not a full validated FSRS implementation.</p>
      <div className="mt-4" aria-label={`${reviewedThisSession.length} of ${cards.length} cards reviewed this session`}><div className="mb-1 flex justify-between text-xs text-[#4B6B5E]"><span>Session progress</span><span>{reviewedThisSession.length} / {cards.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#DCEFE5]"><div className="h-full rounded-full bg-[#047857] transition-all" style={{ width: `${cards.length ? Math.min(100, reviewedThisSession.length / cards.length * 100) : 0}%` }} /></div></div>
    </header>

    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm font-medium text-[#0B2E22]">Subject <select aria-label="Filter by subject" value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-2 rounded-lg border border-[#CDEBDD] bg-white px-3 py-2"><option value="all">All subjects</option>{courseOptions.map(([id, code]) => <option key={id} value={id}>{code}</option>)}</select></label>
      <label className="text-sm font-medium text-[#0B2E22]">Priority <select aria-label="Filter by mastery priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="ml-2 rounded-lg border border-[#CDEBDD] bg-white px-3 py-2"><option value="all">All gaps</option><option value="high">High priority (&lt;50% mastery)</option></select></label>
      <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-[#CDEBDD] bg-white px-3 py-2 text-sm"><RotateCcw className="h-4 w-4" />Refresh queue</button>
    </div>

    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p role="status" className="py-8 text-center text-sm text-[#4B6B5E]">Loading your review queue…</p> : !current ? <div className="rounded-xl border border-dashed border-[#CDEBDD] bg-white p-8 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-[#047857]" /><h3 className="mt-2 font-semibold text-[#0B2E22]">No reviewed questions in this queue yet</h3><p className="mt-1 text-sm text-[#4B6B5E]">Your teacher-reviewed quiz questions will appear here when they match a mastery gap.</p></div> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="rounded-xl border border-[#CDEBDD] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6F2EC] pb-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#047857]">{current.course_code} · {current.concept_name}</p><p className="mt-1 text-xs text-[#4B6B5E]">{current.difficulty_label} · Stability {current.stability_days.toFixed(1)} days · {current.reps} reviews</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${current.due ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}>{current.due ? "Due now" : `Next review ${formatDate(current.next_due)}`}</span></div>
        <h3 className="py-5 text-base font-semibold leading-relaxed text-[#0B2E22]">{current.prompt}</h3>
        <fieldset disabled={!!feedback} className="space-y-2"><legend className="sr-only">Choose an answer</legend>{current.options.map((option, index) => <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${selected === index ? "border-emerald-500 bg-emerald-50" : "border-[#CDEBDD]"}`}><input type="radio" name="micro-drill-answer" value={index} checked={selected === index} onChange={() => setSelected(index)} className="mt-0.5 accent-emerald-700" /><span>{option}</span></label>)}</fieldset>
        <label className="mt-4 block text-sm font-medium text-[#0B2E22]">How confident were you? <span className="font-normal text-[#4B6B5E]">1 = unsure, 5 = very sure</span><input aria-label="Recall confidence from 1 to 5" type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} disabled={!!feedback} className="mt-2 block w-full accent-emerald-700" /><span className="text-xs text-[#4B6B5E]">{confidence} of 5</span></label>
        {!feedback ? <button type="button" disabled={selected === null || sending} onClick={() => void submit()} className="mt-4 rounded-lg bg-[#047857] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{sending ? "Checking…" : "Check answer"}</button> : <div className={`mt-4 rounded-lg border p-4 ${feedback.is_correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`} role="status"><p className="font-semibold text-[#0B2E22]">{feedback.feedback}</p>{!feedback.is_correct && current.options[feedback.correct_idx ?? -1] && <p className="mt-2 text-sm font-medium text-[#0B2E22]">Correct answer: {current.options[feedback.correct_idx!]}</p>}{feedback.explanation && <p className="mt-2 text-sm leading-relaxed text-[#4B6B5E]">{feedback.explanation}</p>}{feedback.source_citation && <p className="mt-2 text-xs text-[#4B6B5E]">Source: {feedback.source_citation}</p>}{feedback.stability !== undefined && feedback.next_due && <p className="mt-2 text-xs font-medium text-[#0B2E22]">Stability: {feedback.stability.toFixed(2)} days · Next review: {formatDate(feedback.next_due)}</p>}{!feedback.is_correct && <button type="button" onClick={() => { setSelected(null); setFeedback(null); }} className="mt-3 mr-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold">Retry missed question</button>}<button type="button" onClick={nextCard} className="mt-3 rounded-lg border border-[#CDEBDD] bg-white px-3 py-2 text-sm font-semibold">Next question</button></div>}
      </article>
      <aside className="rounded-xl border border-[#CDEBDD] bg-white p-4" aria-label="Review queue"><h3 className="font-semibold text-[#0B2E22]">Review queue <span className="text-sm font-normal text-[#4B6B5E]">({cards.length})</span></h3>{cards.length === 0 ? <p className="mt-3 text-sm text-[#4B6B5E]">No cards match these filters.</p> : <ul className="mt-3 space-y-2">{cards.map((card) => <li key={card.card_id}><button type="button" onClick={() => { setActiveId(card.card_id); setSelected(null); setFeedback(null); }} className={`w-full rounded-lg border p-3 text-left ${card.card_id === activeId ? "border-emerald-500 bg-emerald-50" : "border-[#E6F2EC]"}`}><span className="block text-sm font-medium text-[#0B2E22]">{card.concept_name}</span><span className="mt-1 flex items-center gap-1 text-xs text-[#4B6B5E]"><Clock3 className="h-3 w-3" />{card.due ? "Due" : formatDate(card.next_due)} · {card.mastery === null ? "No mastery data" : `${Math.round(card.mastery * 100)}% mastery`}</span></button></li>)}</ul>}</aside>
    </div>}
    <p className="text-xs text-[#4B6B5E]">Only teacher-reviewed quiz items are shown. Times are stored in UTC and displayed in your device timezone.</p>
    <section className="rounded-xl border border-[#CDEBDD] bg-white p-4" aria-labelledby="drill-history-title"><h3 id="drill-history-title" className="font-semibold text-[#0B2E22]">Recent attempts</h3>{history.length === 0 ? <p className="mt-2 text-sm text-[#4B6B5E]">Your completed reviews will appear here.</p> : <ul className="mt-3 divide-y divide-[#E6F2EC]">{history.slice(0, 8).map((attempt) => <li key={attempt.attempt_id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"><span className="max-w-2xl text-[#0B2E22]">{attempt.question}<span className="ml-2 text-xs text-[#4B6B5E]">{attempt.course_code}</span></span><span className="text-xs text-[#4B6B5E]">{attempt.correct ? "Correct" : "Retry"} · Confidence {attempt.confidence}/5 · {formatDate(attempt.reviewed_at)}</span></li>)}</ul>}</section>
  </section>;
}
