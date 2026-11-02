/**
 * Auth + Progress service (localStorage-based, matching original SysWizard)
 */

export interface User {
  name: string;
  email: string;
  password: string; // plain (local-only demo, like original)
}

const USERS_KEY = "syswizard_users";
const SESSION_KEY = "syswizard_session";
const PROGRESS_KEY = "syswizard_progress";

function readUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authService = {
  _cachedUser: null as { name: string; email: string } | null,

  signup(name: string, email: string, password: string): { ok: boolean; error?: string } {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (password.length < 4) {
      return { ok: false, error: "Password must be at least 4 characters." };
    }
    users.push({ name, email, password });
    writeUsers(users);
    this.login(email, password);
    return { ok: true };
  },

  login(email: string, password: string): { ok: boolean; error?: string } {
    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = { name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this._cachedUser = session;
    window.dispatchEvent(new Event("syswizard:auth"));
    return { ok: true };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    this._cachedUser = null;
    window.dispatchEvent(new Event("syswizard:auth"));
  },

  current(): { name: string; email: string } | null {
    if (typeof window === "undefined") return null;
    if (this._cachedUser !== null || !localStorage.getItem(SESSION_KEY)) {
      return this._cachedUser;
    }
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      this._cachedUser = raw ? JSON.parse(raw) : null;
    } catch {
      this._cachedUser = null;
    }
    return this._cachedUser;
  },

  isLoggedIn(): boolean {
    return this.current() !== null;
  },

  /** Subscribe to auth/session changes (for useSyncExternalStore) */
  subscribeAuth(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", cb);
    window.addEventListener("syswizard:auth", cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener("syswizard:auth", cb);
    };
  },

  getAuthSnapshot(): { name: string; email: string } | null {
    return this.current();
  },
};

export const progressService = {
  getCompleted(): string[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    } catch {
      return [];
    }
  },

  isCompleted(topicId: string): boolean {
    return this.getCompleted().includes(topicId);
  },

  toggle(topicId: string): boolean {
    const done = this.getCompleted();
    const idx = done.indexOf(topicId);
    let completed: boolean;
    if (idx >= 0) {
      done.splice(idx, 1);
      completed = false;
    } else {
      done.push(topicId);
      completed = true;
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(done));
    this._cachedCompleted = done; // keep snapshot cache in sync
    window.dispatchEvent(new Event("syswizard:progress"));
    return completed;
  },

  count(): number {
    return this.getCompleted().length;
  },

  /** Subscribe to progress changes (for useSyncExternalStore) */
  subscribeProgress(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => cb();
    window.addEventListener("syswizard:progress", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("syswizard:progress", handler);
      window.removeEventListener("storage", handler);
    };
  },

  getProgressSnapshot(): number {
    return this.count();
  },

  _cachedCompleted: null as string[] | null,

  /** Cached completed-list snapshot (stable reference for useSyncExternalStore) */
  getCompletedSnapshot(): string[] {
    if (typeof window === "undefined") return [];
    if (this._cachedCompleted === null) {
      this._cachedCompleted = this.getCompleted();
    }
    return this._cachedCompleted;
  },
};
