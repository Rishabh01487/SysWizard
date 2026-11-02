"use client";

import { useState } from "react";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthScreen({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res =
      mode === "login"
        ? authService.login(email, password)
        : authService.signup(name, email, password);
    if (!res.ok) {
      setError(res.error || "Something went wrong.");
      return;
    }
    onAuthed();
  }

  return (
    <div className="fixed inset-0 z-[9999] flex bg-[#0f0b1e] overflow-hidden">
      {/* Left visual side */}
      <div
        className="relative flex-1.2 hidden lg:flex flex-col items-center justify-center p-10 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #0f0b1e 100%)" }}
      >
        <div
          className="absolute rounded-full blur-[100px] opacity-30 sw-glow-pulse"
          style={{
            width: 500,
            height: 500,
            top: -100,
            left: -100,
            background: "#6b1d6e",
          }}
        />
        <div
          className="absolute rounded-full blur-[100px] opacity-30 sw-glow-pulse"
          style={{
            width: 400,
            height: 400,
            bottom: -50,
            right: -50,
            background: "#f47a20",
            animationDelay: "-3s",
          }}
        />
        <div className="absolute top-8 left-8 text-xs text-white/40 tracking-widest uppercase">
          🧙‍♂️ Explore the Wizard&apos;s Realm
        </div>
        {[
          { e: "☁️", t: "20%", l: "30%" },
          { e: "📦", t: "60%", l: "20%" },
          { e: "🚀", t: "30%", l: "70%" },
          { e: "💾", t: "70%", l: "60%" },
        ].map((f, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-15 sw-float"
            style={{ top: f.t, left: f.l, animationDelay: `${i * 0.8}s` }}
          >
            {f.e}
          </div>
        ))}
        <div className="relative z-10 text-center max-w-md">
          <h2 className="text-6xl font-black tracking-tight text-white mb-5">
            Sys<span style={{ background: "var(--grad-warm)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Wizard</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed font-light">
            Every system has a story. Let the wizard show you how data flows
            across the digital world.
          </p>
          <div className="mt-8 pl-[18px] pr-5 py-4 border-l-[3px] border-purple-400/75 bg-purple-500/10 rounded-r-xl text-left sw-fade-up">
            <p className="italic text-[1.05rem] leading-relaxed text-white/90 font-serif">
              &ldquo;The images that appear on the canvas of the mind become
              tomorrow&apos;s reality&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-[#0f0b1e]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🧙‍♂️</div>
            <h1 className="text-3xl font-bold text-white">
              {mode === "login" ? "Welcome " : "Begin Your "}
              <span style={{ background: "var(--grad-warm)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {mode === "login" ? "Back" : "Journey"}
              </span>
            </h1>
            <p className="text-white/50 text-sm mt-2">
              {mode === "login"
                ? "Continue your system design journey"
                : "Create an account to start learning"}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label className="text-white/80 text-sm">Master Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Rishi Kumar"
                  required
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-purple-400"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curious@wizard.com"
                required
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-purple-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Secret Word (Password)</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min 4 characters" : "••••••••"}
                required
                minLength={4}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-purple-400"
              />
            </div>
            {error && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold text-white border-0"
              style={{ background: "var(--grad-primary)" }}
            >
              {mode === "login" ? "Login to Realm →" : "Begin Journey ✨"}
            </Button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            {mode === "login" ? "New to the magic? " : "Already a member? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-purple-300 hover:text-purple-200 font-semibold underline-offset-2 hover:underline"
            >
              {mode === "login" ? "Sign up here" : "Login here"}
            </button>
          </p>

          <p className="text-center text-white/30 text-xs mt-8">
            85+ Topics · Interactive Lab · AI Mentor · v3.0
          </p>
        </div>
      </div>
    </div>
  );
}
