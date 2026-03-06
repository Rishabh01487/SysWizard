/**
 * AuthService — localStorage-based authentication
 * Handles signup, login, logout, session management, and per-user progress tracking.
 */

const USERS_KEY = 'syswizard_users';
const SESSION_KEY = 'syswizard_session';

class AuthService {
    constructor() {
        this._listeners = [];
    }

    /** Get all registered users */
    _getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; }
    }

    /** Save users map */
    _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    /** Register a new user */
    signup(name, email, password) {
        const users = this._getUsers();
        const key = email.toLowerCase().trim();
        if (users[key]) return { success: false, error: 'Email already registered. Please login.' };
        if (!name.trim()) return { success: false, error: 'Please enter your name.' };
        if (!email.trim() || !email.includes('@')) return { success: false, error: 'Please enter a valid email.' };
        if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };

        users[key] = {
            name: name.trim(),
            email: key,
            password: btoa(password), // simple encoding (not for production)
            avatar: name.trim()[0].toUpperCase(),
            createdAt: Date.now(),
            completedTopics: [],
            quizScores: {},
        };
        this._saveUsers(users);
        this._setSession(key, users[key]);
        return { success: true, user: users[key] };
    }

    /** Login an existing user */
    login(email, password) {
        const users = this._getUsers();
        const key = email.toLowerCase().trim();
        const user = users[key];
        if (!user) return { success: false, error: 'No account found with this email.' };
        if (atob(user.password) !== password) return { success: false, error: 'Incorrect password.' };
        this._setSession(key, user);
        return { success: true, user };
    }

    /** Logout */
    logout() {
        localStorage.removeItem(SESSION_KEY);
        this._notify();
    }

    /** Get current session user */
    getCurrentUser() {
        try {
            const session = JSON.parse(localStorage.getItem(SESSION_KEY));
            if (!session) return null;
            // Refresh from users store to get latest data
            const users = this._getUsers();
            return users[session.email] || null;
        } catch { return null; }
    }

    /** Check if logged in */
    isLoggedIn() {
        return !!this.getCurrentUser();
    }

    /** Set session */
    _setSession(email, user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email, name: user.name, loginAt: Date.now() }));
        this._notify();
    }

    /** Mark a topic as completed for the current user */
    markTopicComplete(topicId) {
        const user = this.getCurrentUser();
        if (!user) return;
        const users = this._getUsers();
        const key = user.email;
        if (!users[key].completedTopics.includes(topicId)) {
            users[key].completedTopics.push(topicId);
            this._saveUsers(users);
        }
    }

    /** Unmark a topic */
    markTopicIncomplete(topicId) {
        const user = this.getCurrentUser();
        if (!user) return;
        const users = this._getUsers();
        const key = user.email;
        users[key].completedTopics = users[key].completedTopics.filter(t => t !== topicId);
        this._saveUsers(users);
    }

    /** Get completed topics for current user */
    getCompletedTopics() {
        const user = this.getCurrentUser();
        return user?.completedTopics || [];
    }

    /** Save quiz score */
    saveQuizScore(topicId, score, total) {
        const user = this.getCurrentUser();
        if (!user) return;
        const users = this._getUsers();
        const key = user.email;
        users[key].quizScores[topicId] = { score, total, date: Date.now() };
        this._saveUsers(users);
    }

    /** Listen for auth state changes */
    onAuthChange(cb) {
        this._listeners.push(cb);
        return () => { this._listeners = this._listeners.filter(l => l !== cb); };
    }

    _notify() {
        this._listeners.forEach(cb => cb(this.getCurrentUser()));
    }
}

export const authService = new AuthService();
