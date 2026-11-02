"use client";

import { useEffect, useRef, useState } from "react";
import type { FlatTopic } from "@/lib/topics";
import { AnimationEngine } from "@/lib/engine/AnimationEngine";
import type { AnimationStep } from "@/lib/engine/AnimationEngine";
import { setupGenericAnimation } from "@/lib/engine/genericAnimation";
import { getEnrichment } from "@/lib/topics/enrichment";
import { generateTopicDiagram } from "@/lib/topics/topicDiagrams";
import {
  buildRequestFlow, buildDataFlowDiagram, CACHING_LAYERS, CACHE_INVALIDATION,
  generateAlgorithmsFromTopic, commonInterviewQuestions,
} from "@/lib/topics/contentBuilders";
import { progressService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, RotateCcw,
  CheckCircle2, BookOpen, Code2, Lightbulb, GitBranch,
  Scale, Zap, Target, Video, Mic, ShieldAlert, X,
} from "lucide-react";

interface TopicDetailProps {
  topic: FlatTopic;
  onBack: () => void;
  onProgressChange: () => void;
}

const TABS = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "request-flow", label: "Request Flow", icon: GitBranch },
  { id: "data-flow", label: "Data Flow", icon: Zap },
  { id: "caching", label: "Caching", icon: Lightbulb },
  { id: "deep-analysis", label: "Deep Analysis", icon: Target },
  { id: "algorithms", label: "Algorithms", icon: Scale },
  { id: "code", label: "Code", icon: Code2 },
  { id: "interview", label: "Interview", icon: BookOpen },
] as const;

type TabId = typeof TABS[number]["id"];

export function TopicDetail({ topic, onBack, onProgressChange }: TopicDetailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AnimationEngine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState<AnimationStep | null>(null);
  const [speed, setSpeed] = useState(1);
  const [tab, setTab] = useState<TabId>("learn");
  const [completed, setCompleted] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Present / Record state
  const [presenting, setPresenting] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const enrichment = getEnrichment(topic.id);
  const c = topic.content;

  function stripTags(s: string): string {
    return s.replace(/<[^>]+>/g, "");
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.slice(0, 500));
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }

  // Initialize engine + animation
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new AnimationEngine(canvasRef.current);
    engineRef.current = engine;
    const detachResize = engine.attachResize();

    engine.onStepChange = (idx, step) => {
      setStepIdx(idx);
      setCurrentStep(step);
    };

    const t = setTimeout(() => {
      setupGenericAnimation(engine, topic);
      setCompleted(progressService.isCompleted(topic.id));
      setTotalSteps(engine.steps.length);
      engine.goToStep(0);
      engine.renderFrame();
    }, 50);

    return () => {
      clearTimeout(t);
      detachResize();
      engine.pause();
      window.speechSynthesis?.cancel();
    };
  }, [topic.id]);

  // Re-render frame when paused state changes
  useEffect(() => {
    if (!playing) engineRef.current?.renderFrame();
  }, [playing]);

  function togglePresent() {
    if (presenting) {
      window.speechSynthesis?.cancel();
      setPresenting(false);
    } else {
      setPresenting(true);
      if (currentStep) speak(stripTags(currentStep.description));
      if (!engineRef.current?.isPlaying) togglePlay();
    }
  }

  async function toggleRecord() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${topic.id}-animation.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      // auto-play while recording
      if (!engineRef.current?.isPlaying) togglePlay();
    } catch {
      // MediaRecorder unsupported
    }
  }

  function togglePlay() {
    const eng = engineRef.current;
    if (!eng) return;
    eng.togglePlay();
    setPlaying(eng.isPlaying);
  }
  function goNext() {
    engineRef.current?.nextStep();
  }
  function goPrev() {
    engineRef.current?.prevStep();
  }
  function restart() {
    engineRef.current?.restart();
    setPlaying(false);
  }
  function changeSpeed(v: number) {
    setSpeed(v);
    engineRef.current?.setSpeed(v);
  }

  function openQuiz() {
    const qs = enrichment.quizQuestions;
    if (!qs || qs.length === 0) {
      finishComplete();
      return;
    }
    setQuizAnswers(new Array(qs.length).fill(-1));
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizOpen(true);
  }

  function submitQuiz() {
    const score = enrichment.quizQuestions.reduce(
      (acc, q, i) => acc + (quizAnswers[i] === q.correct ? 1 : 0), 0
    );
    setQuizScore(score);
    setQuizSubmitted(true);
  }

  function finishComplete() {
    const done = progressService.toggle(topic.id);
    setCompleted(done);
    onProgressChange();
    setQuizOpen(false);
  }

  const flowSteps = buildRequestFlow(topic);
  const dataFlow = buildDataFlowDiagram(topic.title, c.howItWorks);
  const algos = enrichment.algorithms.length > 0 ? enrichment.algorithms : generateAlgorithmsFromTopic(topic.title);
  const commonQs = commonInterviewQuestions(topic.title);
  const diagramSvg = generateTopicDiagram(topic.id, topic.title);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{topic.icon}</span>
          <h2 className="font-bold text-lg truncate">{topic.title}</h2>
          <Badge variant="secondary" className="text-[10px] shrink-0 hidden sm:inline-flex">
            {topic.categoryIcon} {topic.categoryName}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" onClick={togglePresent} className="gap-1.5" title="Voice presentation">
            <Mic className={`w-3.5 h-3.5 ${presenting ? "text-red-500" : ""}`} /> {presenting ? "Stop" : "Present"}
          </Button>
          <Button
            variant={completed ? "default" : "outline"}
            size="sm"
            onClick={openQuiz}
            className="gap-1.5"
            style={completed ? { background: "#16a34a" } : undefined}
          >
            <CheckCircle2 className="w-4 h-4" />
            {completed ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto sw-scroll">
        <div className="px-6 lg:px-8 py-5 max-w-6xl mx-auto">
          {/* Canvas area */}
          <div className="sw-canvas-wrap h-[340px] sm:h-[400px] mb-3">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {currentStep && (
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur rounded-lg px-3 py-1.5 border border-purple-500/30">
                <div className="text-[10px] text-purple-300 font-semibold tracking-wide uppercase">
                  Step {stepIdx + 1} / {totalSteps}
                </div>
                <div className="text-sm text-white font-medium mt-0.5">{currentStep.title}</div>
              </div>
            )}
            {recording && (
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/80 text-white rounded-full px-3 py-1 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
              </div>
            )}
          </div>

          {/* Step description */}
          {currentStep && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-5 rounded-full" style={{ background: "var(--grad-warm)" }} />
                <span className="text-xs font-bold tracking-wide text-purple-600 dark:text-purple-300 uppercase">
                  {currentStep.title}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 sw-prose whitespace-pre-line">
                <span dangerouslySetInnerHTML={{ __html: currentStep.description }} />
              </p>
            </div>
          )}

          {/* Controls bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6 rounded-xl border border-border bg-card p-3">
            <Button variant="outline" size="icon" onClick={goPrev} disabled={stepIdx === 0} title="Previous">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="icon" onClick={togglePlay} className="text-white border-0"
              style={{ background: "var(--grad-primary)" }} title={playing ? "Pause" : "Play"}>
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={goNext} disabled={stepIdx >= totalSteps - 1} title="Next">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={restart} title="Restart">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant={recording ? "destructive" : "outline"} size="sm" onClick={toggleRecord} className="gap-1.5">
              <Video className="w-4 h-4" /> {recording ? "Stop" : "Record"}
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-muted-foreground">Speed:</span>
              <input type="range" min={0.25} max={3} step={0.25} value={speed}
                onChange={(e) => changeSpeed(parseFloat(e.target.value))}
                className="w-24 accent-purple-500" />
              <span className="text-xs font-mono w-8">{speed}x</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button key={i} onClick={() => engineRef.current?.goToStep(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === stepIdx ? "w-5 bg-primary" : i < stepIdx ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/30"
                  }`} title={`Step ${i + 1}`} />
              ))}
            </div>
          </div>

          {/* Content tabs */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-1 overflow-x-auto sw-no-scrollbar border-b border-border px-2">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                    tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 sw-prose">
              {/* ─── LEARN ─── */}
              {tab === "learn" && (
                <div>
                  <SectionTitle title="📊 Architecture Diagram" />
                  <div className="mb-5 [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: diagramSvg }} />

                  <SectionTitle title="📌 Overview" />
                  <p dangerouslySetInnerHTML={{ __html: c.overview }} />

                  <SectionTitle title="📖 Detailed Study Notes" />
                  <DetailedStudyNotes topic={topic} algos={algos} />

                  <SectionTitle title="⚙️ How It Works — Step by Step" />
                  <ol className="space-y-2.5 mb-5">
                    {c.howItWorks.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                        <span className="flex-1 pt-0.5" dangerouslySetInnerHTML={{ __html: step }} />
                      </li>
                    ))}
                  </ol>

                  <SectionTitle title="🔑 Key Concepts" />
                  <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
                    {c.keyConcepts.map((k, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-sm"
                        dangerouslySetInnerHTML={{ __html: k }} />
                    ))}
                  </div>

                  <SectionTitle title="🌍 Real-World Examples" />
                  <p dangerouslySetInnerHTML={{ __html: c.realWorld }} />
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/20">
                      <h4 className="font-bold text-sm mb-2 text-green-600 dark:text-green-400">✅ Advantages</h4>
                      <ul className="space-y-1">{c.tradeoffs.pros.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
                    </div>
                    <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20">
                      <h4 className="font-bold text-sm mb-2 text-red-600 dark:text-red-400">❌ Disadvantages</h4>
                      <ul className="space-y-1">{c.tradeoffs.cons.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── REQUEST FLOW ─── */}
              {tab === "request-flow" && (
                <div>
                  <SectionTitle title={`🔄 Request Flow — ${topic.title}`} />
                  <p className="text-muted-foreground mb-4 text-sm">
                    This is the typical request-response flow when {topic.title.toLowerCase()} is used in a production system.
                  </p>
                  <div className="space-y-0 mb-5">
                    {flowSteps.map((s, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: "var(--grad-primary)" }}>{i + 1}</div>
                          {i < flowSteps.length - 1 && <div className="w-0.5 flex-1 bg-purple-500/30 my-1" />}
                        </div>
                        <div className="pb-5 flex-1">
                          <h4 className="font-bold text-sm">{s.name}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5" dangerouslySetInnerHTML={{ __html: s.description }} />
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-mono">⏱️ {s.timing}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SectionTitle title="🌍 Where This Flow Appears" />
                  <p dangerouslySetInnerHTML={{ __html: c.realWorld }} />
                </div>
              )}

              {/* ─── DATA FLOW ─── */}
              {tab === "data-flow" && (
                <div>
                  <SectionTitle title={`📊 Data Flow — ${topic.title}`} />
                  <p className="text-muted-foreground mb-4 text-sm">
                    How data moves through the system when {topic.title.toLowerCase()} is in use.
                  </p>
                  <pre className="sw-code-block mb-5">{dataFlow}</pre>
                  <SectionTitle title="🔑 Data Components" />
                  <div className="grid sm:grid-cols-2 gap-2.5 mb-5">
                    {c.keyConcepts.map((k, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                        <h4 className="font-bold text-xs mb-1 text-primary">Component {i + 1}</h4>
                        <div dangerouslySetInnerHTML={{ __html: k }} />
                      </div>
                    ))}
                  </div>
                  <SectionTitle title="⚡ Performance Considerations" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/20">
                      <h4 className="font-bold text-sm mb-2 text-green-600 dark:text-green-400">✅ Optimizations</h4>
                      <ul className="space-y-1">{c.tradeoffs.pros.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
                    </div>
                    <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
                      <h4 className="font-bold text-sm mb-2 text-amber-600 dark:text-amber-400">⚠️ Bottlenecks</h4>
                      <ul className="space-y-1">{c.tradeoffs.cons.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CACHING ─── */}
              {tab === "caching" && (
                <div>
                  <SectionTitle title={`💾 Caching Strategy for ${topic.title}`} />
                  <p className="text-muted-foreground mb-4 text-sm">
                    How caching improves performance in the context of {topic.title.toLowerCase()}.
                  </p>
                  <div className="space-y-3 mb-5">
                    {CACHING_LAYERS.map((l, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-sm">{l.name}</h4>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{l.ttl}</span>
                        </div>
                        <p className="text-sm"><strong>Strategy:</strong> {l.strategy}</p>
                        <p className="text-sm"><strong>What to cache:</strong> {l.what}</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300"><strong>Benefit:</strong> {l.benefit}</p>
                      </div>
                    ))}
                  </div>
                  <SectionTitle title="🔄 Cache Invalidation Strategies" />
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {CACHE_INVALIDATION.map((ci, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-sm" dangerouslySetInnerHTML={{ __html: ci }} />
                    ))}
                  </div>
                </div>
              )}

              {/* ─── DEEP ANALYSIS ─── */}
              {tab === "deep-analysis" && (
                <div>
                  <SectionTitle title={`🔬 Deep Analysis — ${topic.title}`} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AnalysisCard icon="🏗️" title="Architecture Pattern">
                      <p dangerouslySetInnerHTML={{ __html: c.overview }} />
                      <p className="text-muted-foreground text-sm mt-2">This pattern is typically implemented as part of a larger distributed system where reliability, scalability, and performance are critical requirements.</p>
                    </AnalysisCard>
                    <AnalysisCard icon="📊" title="Scalability Analysis">
                      <ul className="space-y-1">{c.howItWorks.slice(0, 3).map((s, i) => <li key={i} className="text-sm">• <span dangerouslySetInnerHTML={{ __html: s }} /></li>)}</ul>
                      <p className="text-muted-foreground text-sm mt-2"><strong>Scaling approach:</strong> Horizontal scaling with stateless services, database sharding, and multi-region deployment. Typical systems handle 10K-1M QPS.</p>
                    </AnalysisCard>
                    <AnalysisCard icon="⚡" title="Performance Bottlenecks">
                      <ul className="space-y-1">{c.tradeoffs.cons.map((s, i) => <li key={i} className="text-sm">🎯 {s}</li>)}</ul>
                      <p className="text-muted-foreground text-sm mt-2"><strong>Mitigation:</strong> Use caching (Redis), async processing (message queues), and connection pooling to address these bottlenecks.</p>
                    </AnalysisCard>
                    <AnalysisCard icon="🛡️" title="Failure Handling">
                      <p className="text-sm"><strong>Circuit Breaker:</strong> When {topic.title.toLowerCase()} fails, the circuit breaker trips after N failures and returns cached/fallback responses.</p>
                      <p className="text-sm"><strong>Retry with Backoff:</strong> Failed requests are retried with exponential backoff (1s, 2s, 4s, 8s) to avoid thundering herd.</p>
                      <p className="text-sm"><strong>Replication:</strong> Critical data is replicated across 3+ nodes for fault tolerance.</p>
                    </AnalysisCard>
                    <AnalysisCard icon="📈" title="Monitoring & Observability">
                      <p className="text-sm"><strong>Metrics:</strong> Track P50/P95/P99 latency, throughput (QPS), error rate, and resource utilization.</p>
                      <p className="text-sm"><strong>Logging:</strong> Structured JSON logs with correlation IDs for request tracing.</p>
                      <p className="text-sm"><strong>Alerting:</strong> Set alerts for latency &gt; 500ms, error rate &gt; 1%, CPU &gt; 80%.</p>
                    </AnalysisCard>
                    <AnalysisCard icon="🧮" title={algos.length > 0 ? "Algorithms Used" : "Core Data Structures"}>
                      {algos.length > 0 ? (
                        algos.map((a, i) => (
                          <p key={i} className="text-sm mb-1.5"><strong>{a.name}</strong>: {a.description}</p>
                        ))
                      ) : (
                        c.keyConcepts.slice(0, 3).map((k, i) => (
                          <p key={i} className="text-sm mb-1.5" dangerouslySetInnerHTML={{ __html: k }} />
                        ))
                      )}
                    </AnalysisCard>
                  </div>
                </div>
              )}

              {/* ─── ALGORITHMS ─── */}
              {tab === "algorithms" && (
                <div>
                  <SectionTitle title={`🧮 Core Algorithms & Data Structures — ${topic.title}`} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    {algos.map((a, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm">{a.name}</span>
                          <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full">{a.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.description}</p>
                        <div className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-2">Complexity: {a.complexity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── CODE ─── */}
              {tab === "code" && (
                <div>
                  <SectionTitle title={`💻 Code Example — ${topic.title}`} />
                  <pre className="sw-code-block">{c.codeExample}</pre>
                </div>
              )}

              {/* ─── INTERVIEW ─── */}
              {tab === "interview" && (
                <div>
                  <SectionTitle title={`🎯 Interview Tips — ${topic.title}`} />
                  <div className="space-y-2.5 mb-5">
                    {c.interviewTips.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                        <span className="flex-1 pt-0.5">{t}</span>
                      </div>
                    ))}
                  </div>
                  <SectionTitle title="💡 Common Interview Questions" />
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {commonQs.map((q, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-3 text-sm">{q}</div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-800 dark:text-amber-200">
                    💡 <strong>Pro Tip:</strong> Watch the animation above first, then use these tabs to deepen your
                    understanding. The visual + notes combo locks in learning.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto sw-scroll">
          <DialogHeader>
            <DialogTitle>📝 {topic.title} — Knowledge Check</DialogTitle>
            <DialogDescription>
              {quizSubmitted
                ? `You scored ${quizScore} / ${enrichment.quizQuestions.length}`
                : "Answer all questions to complete this topic"}
            </DialogDescription>
          </DialogHeader>

          {!quizSubmitted ? (
            <div className="space-y-4">
              {enrichment.quizQuestions.map((q, qi) => (
                <div key={qi}>
                  <div className="font-semibold text-sm mb-2">{qi + 1}. {q.question}</div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <button key={oi}
                        onClick={() => setQuizAnswers((a) => { const n = [...a]; n[qi] = oi; return n; })}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-all ${
                          quizAnswers[qi] === oi
                            ? "border-primary bg-primary/10 font-semibold"
                            : "border-border hover:border-primary/50"
                        }`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {quizAnswers.filter((a) => a >= 0).length} / {enrichment.quizQuestions.length} answered
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setQuizOpen(false)}>Cancel</Button>
                  <Button onClick={submitQuiz}
                    disabled={quizAnswers.some((a) => a < 0)}
                    style={{ background: "var(--grad-primary)" }}
                    className="text-white border-0">
                    Submit & Complete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">{quizScore >= enrichment.quizQuestions.length * 0.6 ? "🎉" : "📚"}</div>
              <div className="text-2xl font-black sw-gradient-text mb-1">{quizScore} / {enrichment.quizQuestions.length}</div>
              <p className="text-sm text-muted-foreground mb-4">
                {quizScore >= enrichment.quizQuestions.length * 0.6
                  ? "Great job! Topic marked as complete."
                  : "Review the notes and try again — you'll get it!"}
              </p>
              <div className="space-y-2 text-left mb-4 max-h-56 overflow-y-auto sw-scroll">
                {enrichment.quizQuestions.map((q, qi) => (
                  <div key={qi} className="text-xs rounded-lg border border-border p-2.5">
                    <div className="font-semibold mb-1">{q.question}</div>
                    <div className={quizAnswers[qi] === q.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {quizAnswers[qi] === q.correct ? "✓ Correct: " : "✗ Answer: "}{q.options[q.correct]}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers(new Array(enrichment.quizQuestions.length).fill(-1)); }}>
                  Retry
                </Button>
                <Button onClick={finishComplete} style={{ background: "var(--grad-primary)" }} className="text-white border-0">
                  {completed ? "Close" : "Mark Complete ✓"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2.5 first:mt-0">
      <h3 className="text-sm font-bold tracking-wide">{title}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function AnalysisCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <h4 className="font-bold text-sm mb-2">{icon} {title}</h4>
      {children}
    </div>
  );
}

function DetailedStudyNotes({ topic, algos }: { topic: FlatTopic; algos: { name: string; type: string; description: string; complexity: string }[] }) {
  const c = topic.content;
  const title = topic.title;
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5">
      <h3 className="text-base font-bold mb-3">📘 {title} — Complete Study Guide</h3>

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">1. Introduction &amp; Overview</h4>
      <p className="text-sm" dangerouslySetInnerHTML={{ __html: c.overview }} />
      <p className="text-sm mt-2">
        Understanding {title} is essential for any system design interview or real-world engineering project.
        This concept forms a critical building block in distributed systems, cloud architectures, and scalable application design.
      </p>

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">2. How {title} Works — Detailed Breakdown</h4>
      {c.howItWorks.map((s, i) => (
        <p key={i} className="text-sm mt-1.5">
          <strong>Step {i + 1}:</strong> <span dangerouslySetInnerHTML={{ __html: s }} />
        </p>
      ))}
      <p className="text-sm mt-2 text-muted-foreground">
        Each of these steps represents a critical phase in the overall process. In production environments at scale
        (millions of requests per second), every step must be optimized — from connection pooling to async processing —
        to meet strict SLA requirements (typically P99 latency under 200ms).
      </p>

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">3. Core Concepts You Must Know</h4>
      {c.keyConcepts.map((k, i) => (
        <p key={i} className="text-sm mt-1">• <span dangerouslySetInnerHTML={{ __html: k }} /></p>
      ))}
      <p className="text-sm mt-2 text-muted-foreground">
        These concepts are interconnected. For example, in a microservices architecture, you need to understand how {title}
        {" "}interacts with load balancing, caching, and database replication to build a resilient system.
      </p>

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">4. Real-World Applications</h4>
      <p className="text-sm" dangerouslySetInnerHTML={{ __html: c.realWorld }} />
      <p className="text-sm mt-2 text-muted-foreground">
        At companies like Google, Amazon, Netflix, and Meta, {title} is used at massive scale. For example, Netflix handles
        over 2 billion API requests daily, and {title.toLowerCase()} is a key part of their infrastructure that enables this scale.
      </p>

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">5. Trade-offs &amp; Design Decisions</h4>
      <div className="grid sm:grid-cols-2 gap-3 my-2">
        <div className="bg-green-500/10 p-3 rounded-lg">
          <h5 className="font-bold text-xs mb-1.5 text-green-600 dark:text-green-400">✅ Advantages</h5>
          <ul className="space-y-1">{c.tradeoffs.pros.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
        </div>
        <div className="bg-red-500/10 p-3 rounded-lg">
          <h5 className="font-bold text-xs mb-1.5 text-red-600 dark:text-red-400">❌ Disadvantages</h5>
          <ul className="space-y-1">{c.tradeoffs.cons.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
        </div>
      </div>
      <p className="text-sm">
        The key insight is that there is no perfect solution — every design choice involves trade-offs. The best engineers
        understand these trade-offs and can articulate WHY they chose a particular approach for a given set of constraints.
      </p>

      {algos.length > 0 && (
        <>
          <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">6. Key Algorithms &amp; Data Structures</h4>
          {algos.map((a, i) => (
            <p key={i} className="text-sm mt-1">
              <strong>{a.name}</strong> ({a.type}): {a.description} — Complexity: <span className="font-mono text-xs">{a.complexity}</span>
            </p>
          ))}
        </>
      )}

      <h4 className="font-bold text-sm mt-4 mb-1.5 text-purple-600 dark:text-purple-300">
        {algos.length > 0 ? "7" : "6"}. Interview Strategy
      </h4>
      <ul className="space-y-1">{c.interviewTips.map((t, i) => <li key={i} className="text-sm">• {t}</li>)}</ul>
      <p className="text-sm mt-2">
        <strong>Pro Tip:</strong> In interviews, always start by clarifying requirements (functional and non-functional),
        estimate the scale (QPS, storage, bandwidth), and then propose a high-level design before diving into
        {" "}{title.toLowerCase()} specifics. Show that you understand WHERE and WHY to use {title.toLowerCase()}, not just HOW it works.
      </p>
    </div>
  );
}
