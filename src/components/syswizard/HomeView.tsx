"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, getTopicsByCategory, getTopicsByLevel, searchTopics, TOTAL_TOPICS } from "@/lib/topics";
import type { FlatTopic, Level } from "@/lib/topics";
import { progressService } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

interface HomeViewProps {
  activeCategory: string;
  searchQuery: string;
  completedCount: number;
  onOpenTopic: (topic: FlatTopic) => void;
  onProgressChange: () => void;
  onSearchChange?: (q: string) => void;
}

const LEVELS: { id: Level | "all"; label: string }[] = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export function HomeView({
  activeCategory, searchQuery, completedCount, onOpenTopic, onProgressChange, onSearchChange,
}: HomeViewProps) {
  const [level, setLevel] = useState<Level | "all">("all");

  const topics = useMemo(() => {
    let list: FlatTopic[];
    if (searchQuery.trim()) {
      list = searchTopics(searchQuery);
    } else if (level !== "all") {
      list = getTopicsByLevel(level);
    } else {
      list = getTopicsByCategory(activeCategory);
    }
    return list;
  }, [activeCategory, level, searchQuery]);

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 p-8 lg:p-10 sw-glass">
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
          style={{ background: "var(--grad-warm)" }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-4xl font-black leading-tight">
            Master System Design
            <br />
            <span className="sw-gradient-text">With Visual Clarity</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Interactive animations · In-depth notes · Real-world patterns · AI Tutoring
          </p>
          <div className="flex gap-3 mt-6">
            <StatCard num={TOTAL_TOPICS.toString()} label="Topics" />
            <StatCard num={completedCount.toString()} label="Completed" />
            <StatCard num={CATEGORIES.length.toString()} label="Categories" />
          </div>
        </div>
      </div>

      {/* Search bar (mobile-friendly, mirrors sidebar search) */}
      {onSearchChange && (
        <div className="relative mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topics... (e.g. caching, kafka, dijkstra)"
            className="h-11 bg-card border-border text-sm"
          />
        </div>
      )}

      {/* Filter bar */}
      {!searchQuery.trim() && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-1.5 overflow-x-auto sw-no-scrollbar">
            <CatTab active={activeCategory === "all"} onClick={() => window.dispatchEvent(new CustomEvent("syswizard:selectCat", { detail: "all" }))}>
              ✨ All
            </CatTab>
            {CATEGORIES.map((c) => (
              <CatTab
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => window.dispatchEvent(new CustomEvent("syswizard:selectCat", { detail: c.id }))}
              >
                {c.icon} {c.name}
              </CatTab>
            ))}
          </div>
          <div className="flex gap-1.5">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  level === l.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {searchQuery.trim() && (
        <div className="mb-4 text-sm text-muted-foreground">
          {topics.length} result{topics.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
        </div>
      )}

      {/* Topic grid */}
      {topics.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-5xl mb-3">🔍</div>
          No topics found. Try a different search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topics.map((t, i) => (
            <TopicCard
              key={t.id}
              topic={t}
              index={i}
              completed={progressService.isCompleted(t.id)}
              onClick={() => onOpenTopic(t)}
              onToggleComplete={() => { progressService.toggle(t.id); onProgressChange(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ num, label }: { num: string; label: string }) {
  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur rounded-xl px-4 py-2.5 border border-border/50">
      <div className="text-2xl font-black sw-gradient-text leading-none">{num}</div>
      <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
    </div>
  );
}

function CatTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      {children}
    </button>
  );
}

function TopicCard({
  topic, index, completed, onClick, onToggleComplete,
}: {
  topic: FlatTopic;
  index: number;
  completed: boolean;
  onClick: () => void;
  onToggleComplete: () => void;
}) {
  return (
    <div
      className="group relative sw-card-hover cursor-pointer rounded-xl border border-border bg-card p-4 sw-fade-up"
      style={{ animationDelay: `${Math.min(index * 30, 400)}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-3xl">{topic.icon}</div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
          className={`transition-all ${completed ? "opacity-100" : "opacity-0 group-hover:opacity-60 hover:!opacity-100"}`}
          title={completed ? "Marked complete" : "Mark complete"}
        >
          <CheckCircle2 className={`w-5 h-5 ${completed ? "text-green-500 fill-green-500/20" : "text-muted-foreground"}`} />
        </button>
      </div>
      <h3 className="font-bold text-[15px] leading-snug mb-1 group-hover:text-primary transition-colors">
        {topic.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
        {topic.description}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
          {topic.categoryIcon} {topic.categoryName}
        </Badge>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 h-5 capitalize ${
            topic.level === "beginner" ? "border-green-400/50 text-green-600 dark:text-green-400" :
            topic.level === "intermediate" ? "border-amber-400/50 text-amber-600 dark:text-amber-400" :
            "border-red-400/50 text-red-600 dark:text-red-400"
          }`}
        >
          {topic.level}
        </Badge>
      </div>
    </div>
  );
}
