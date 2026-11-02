"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { authService, progressService } from "@/lib/auth";
import { getTopicById, TOTAL_TOPICS } from "@/lib/topics";
import type { FlatTopic } from "@/lib/topics";
import { AuthScreen } from "@/components/syswizard/AuthScreen";
import { Sidebar } from "@/components/syswizard/Sidebar";
import { HomeView } from "@/components/syswizard/HomeView";
import { TopicDetail } from "@/components/syswizard/TopicDetail";
import { AIPanel } from "@/components/syswizard/AIPanel";
import { GameArena } from "@/components/syswizard/GameArena";
import { DesignGenerator } from "@/components/syswizard/DesignGenerator";

type View = "home" | "game" | "design";

const emptySubscribe = () => () => {};
const getHydrated = () => true;
const getServerSnapshot = () => false;

export default function Home() {
  const hydrated = useSyncExternalStore(emptySubscribe, getHydrated, getServerSnapshot);
  const user = useSyncExternalStore(
    (cb) => authService.subscribeAuth(cb),
    () => authService.getAuthSnapshot(),
    () => null
  );
  // Completed topics list via external store (sidebar checkmarks)
  const completed = useSyncExternalStore(
    (cb) => progressService.subscribeProgress(cb),
    () => progressService.getCompletedSnapshot(),
    () => [] as string[]
  );
  const authed = user !== null;
  const [view, setView] = useState<View>("home");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState<FlatTopic | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState("");

  useEffect(() => {
    const onSelectCat = (e: Event) => setCategory((e as CustomEvent).detail as string);
    window.addEventListener("syswizard:selectCat", onSelectCat);
    return () => window.removeEventListener("syswizard:selectCat", onSelectCat);
  }, []);

  function openTopic(id: string) {
    const t = getTopicById(id);
    if (t) {
      setActiveTopic(t);
      setView("home");
    }
  }

  function askAI(prompt: string) {
    setAiSeed(prompt);
    setAiOpen(true);
  }

  if (!hydrated) return null;

  if (!authed || !user) {
    return (
      <AuthScreen
        onAuthed={() => {
          window.dispatchEvent(new Event("syswizard:auth"));
        }}
      />
    );
  }

  // Topic detail view
  if (activeTopic) {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          user={user}
          completedCount={progressService.count()}
          activeView={view}
          activeCategory={category}
          completed={completed}
          onSelectView={(v) => { setView(v); setActiveTopic(null); }}
          onSelectCategory={(c) => { setCategory(c); setActiveTopic(null); setView("home"); }}
          onSelectTopic={openTopic}
          onOpenAI={() => setAiOpen(true)}
        />
        <main className="flex-1 min-w-0">
          <TopicDetail
            topic={activeTopic}
            onBack={() => setActiveTopic(null)}
            onProgressChange={() => {
              window.dispatchEvent(new Event("syswizard:progress"));
            }}
          />
        </main>
        <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} currentTopic={activeTopic.title} seed={aiSeed} />
      </div>
    );
  }

  // Game Arena / Design Generator views
  if (view === "game" || view === "design") {
    return (
      <div className="flex min-h-screen">
        <Sidebar
          user={user}
          completedCount={progressService.count()}
          activeView={view}
          activeCategory={category}
          completed={completed}
          onSelectView={(v) => { setView(v); setSearch(""); }}
          onSelectCategory={(c) => { setCategory(c); setView("home"); }}
          onSelectTopic={openTopic}
          onOpenAI={() => setAiOpen(true)}
        />
        <main className="flex-1 min-w-0 overflow-y-auto sw-scroll">
          {view === "game" ? (
            <GameArena onBack={() => setView("home")} />
          ) : (
            <DesignGenerator onBack={() => setView("home")} onAskAI={askAI} />
          )}
        </main>
        <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} seed={aiSeed} />
      </div>
    );
  }

  // Home (topic grid)
  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        completedCount={progressService.count()}
        activeView={view}
        activeCategory={category}
        completed={completed}
        onSelectView={setView}
        onSelectCategory={setCategory}
        onSelectTopic={openTopic}
        onOpenAI={() => setAiOpen(true)}
      />
      <main className="flex-1 min-w-0 overflow-y-auto sw-scroll">
        <HomeView
          activeCategory={category}
          searchQuery={search}
          completedCount={progressService.count()}
          onOpenTopic={(t) => setActiveTopic(t)}
          onProgressChange={() => window.dispatchEvent(new Event("syswizard:progress"))}
          onSearchChange={setSearch}
        />
      </main>
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} seed={aiSeed} />
    </div>
  );
}
