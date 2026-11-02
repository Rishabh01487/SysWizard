"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, getAllTopics, searchTopics, TOTAL_TOPICS } from "@/lib/topics";
import { authService, progressService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, LogOut, Bot, Home, Gamepad2, Wand2, Check,
} from "lucide-react";

interface SidebarProps {
  user: { name: string; email: string };
  completedCount: number;
  activeView: "home" | "game" | "design";
  activeCategory: string;
  completed: string[];
  onSelectView: (view: "home" | "game" | "design") => void;
  onSelectCategory: (catId: string) => void;
  onSelectTopic: (topicId: string) => void;
  onOpenAI: () => void;
}

export function Sidebar({
  user, completedCount, activeView, activeCategory, completed,
  onSelectView, onSelectCategory, onSelectTopic, onOpenAI,
}: SidebarProps) {
  const [localSearch, setLocalSearch] = useState("");
  const pct = TOTAL_TOPICS > 0 ? Math.round((completedCount / TOTAL_TOPICS) * 100) : 0;
  const circumference = 2 * Math.PI * 17;
  const dashOffset = circumference - (pct / 100) * circumference;

  const searchResults = useMemo(() => {
    if (!localSearch.trim()) return null;
    return searchTopics(localSearch).slice(0, 8);
  }, [localSearch]);

  const allTopics = useMemo(() => getAllTopics(), []);

  return (
    <aside className="w-[280px] shrink-0 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header / Logo */}
      <button
        onClick={() => { onSelectView("home"); onSelectCategory("all"); }}
        className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border text-left hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="text-2xl">🧙‍♂️</div>
        <div>
          <h1 className="text-lg font-black leading-none">
            Sys<span className="sw-gradient-text">Wizard</span>
          </h1>
          <span className="text-[10px] tracking-widest text-muted-foreground font-semibold">
            VISUAL MASTERCLASS
          </span>
        </div>
      </button>

      {/* Search */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Quick search..."
            className="pl-8 h-9 bg-muted/50 border-transparent focus:border-ring text-sm"
          />
        </div>
        {searchResults && (
          <div className="mt-2 max-h-60 overflow-y-auto sw-scroll rounded-lg bg-popover border border-border shadow-lg">
            {searchResults.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">No topics found</div>
            ) : (
              searchResults.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTopic(t.id);
                    setLocalSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors text-sm"
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="flex-1 truncate">{t.title}</span>
                  {completed.includes(t.id) && <Check className="w-3.5 h-3.5 text-green-500" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Nav — all topics grouped by category */}
      <nav className="flex-1 overflow-y-auto sw-scroll px-3 py-3">
        {/* Magic tools */}
        <div className="mb-3">
          <span className="text-[11px] font-bold tracking-wider text-muted-foreground px-2">✦ MAGIC TOOLS</span>
          <div className="mt-1.5 space-y-0.5">
            <button
              onClick={() => { onSelectView("home"); onSelectCategory("all"); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                activeView === "home" && activeCategory === "all"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              <Home className="w-4 h-4" /> All Topics
              <span className="ml-auto text-[10px] text-muted-foreground font-mono">{TOTAL_TOPICS}</span>
            </button>
            <button
              onClick={() => onSelectView("design")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                activeView === "design"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              <Wand2 className="w-4 h-4" /> Design Generator
            </button>
            <button
              onClick={() => onSelectView("game")}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                activeView === "game"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-sidebar-accent text-sidebar-foreground"
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> Game Arena
            </button>
          </div>
        </div>

        {/* Topics by category */}
        {CATEGORIES.map((cat) => {
          const doneInCat = cat.topics.filter((t) => completed.includes(t.id)).length;
          return (
            <div key={cat.id} className="mb-3">
              <button
                onClick={() => { onSelectView("home"); onSelectCategory(cat.id); }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-sidebar-accent rounded-lg transition-colors group"
              >
                <span className="text-sm">{cat.icon}</span>
                <span className={`text-[11px] font-bold tracking-wider uppercase group-hover:text-primary ${
                  activeView === "home" && activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
                }`}>
                  {cat.name}
                </span>
                <span className="ml-auto text-[9px] text-muted-foreground font-mono">
                  {doneInCat}/{cat.topics.length}
                </span>
              </button>
              <div className="mt-0.5 space-y-0.5">
                {cat.topics.map((t) => {
                  const done = completed.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTopic(t.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
                    >
                      <span className="w-4 text-center shrink-0">
                        {done ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <span className="text-xs opacity-70">{t.icon}</span>
                        )}
                      </span>
                      <span className={`flex-1 truncate ${done ? "text-muted-foreground" : ""}`}>{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="17" stroke="rgba(107,29,110,0.1)" strokeWidth="3" fill="none" />
              <circle cx="20" cy="20" r="17" stroke="url(#prog-grad)" strokeWidth="3" fill="none"
                strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
              <defs>
                <linearGradient id="prog-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6b1d6e" />
                  <stop offset="100%" stopColor="#f47a20" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{pct}%</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold">{completedCount} / {TOTAL_TOPICS} done</div>
            <div className="text-[10px] text-muted-foreground">Keep learning!</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-sidebar-border">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: "var(--grad-primary)" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 text-sm font-medium truncate">{user.name}</span>
          <Button variant="ghost" size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => { authService.logout(); window.location.reload(); }}
            title="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={onOpenAI} className="w-full h-9 text-sm font-semibold text-white border-0"
          style={{ background: "var(--grad-warm)" }}>
          <Bot className="w-4 h-4 mr-1.5" /> Ask Rishi
        </Button>
      </div>
    </aside>
  );
}
