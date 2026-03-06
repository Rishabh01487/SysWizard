/**
 * Master Topic Registry — combines all categories
 */
import { FUNDAMENTALS } from './fundamentals.js';
import { CORE_INFRA } from './coreInfra.js';
import { DISTRIBUTED } from './distributed.js';
import { PATTERNS } from './patterns.js';
import { COMMUNICATION } from './communication.js';
import { DATA_STORAGE } from './dataStorage.js';
import { SECURITY, PERFORMANCE } from './securityPerformance.js';
import { REAL_WORLD } from './realWorld.js';

export const CATEGORIES = [
    FUNDAMENTALS,
    CORE_INFRA,
    COMMUNICATION,
    SECURITY,
    DISTRIBUTED,
    PATTERNS,
    DATA_STORAGE,
    PERFORMANCE,
    REAL_WORLD,
];

/** Flat list of all topics with their category info attached */
export function getAllTopics() {
    const all = [];
    for (const cat of CATEGORIES) {
        for (const topic of cat.topics) {
            all.push({ ...topic, category: cat.id, categoryName: cat.name, categoryIcon: cat.icon, level: cat.level });
        }
    }
    return all;
}

/** Get topics filtered by category id */
export function getTopicsByCategory(categoryId) {
    if (!categoryId || categoryId === 'all') return getAllTopics();
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.topics.map(t => ({ ...t, category: cat.id, categoryName: cat.name, categoryIcon: cat.icon, level: cat.level })) : [];
}

/** Get topics filtered by difficulty level */
export function getTopicsByLevel(level) {
    if (!level || level === 'all') return getAllTopics();
    return getAllTopics().filter(t => t.level === level);
}

/** Search topics by query */
export function searchTopics(query) {
    if (!query) return getAllTopics();
    const q = query.toLowerCase();
    return getAllTopics().filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
}

/** Get a single topic by id */
export function getTopicById(topicId) {
    return getAllTopics().find(t => t.id === topicId);
}
