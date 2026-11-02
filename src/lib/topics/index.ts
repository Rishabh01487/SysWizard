import type { Category, FlatTopic } from "./types";
import { FUNDAMENTALS } from "./fundamentals";
import { CORE_INFRA } from "./coreInfra";
import { COMMUNICATION } from "./communication";
import { SECURITY, PERFORMANCE } from "./securityPerformance";
import { DISTRIBUTED } from "./distributed";
import { PATTERNS } from "./patterns";
import { DATA_STORAGE } from "./dataStorage";
import { REAL_WORLD } from "./realWorld";
import { ALGORITHMS } from "./algorithms";
import { EXPANDED } from "./expanded";
import { FULLSTACK } from "./fullstack";
import { SOFTWARE_ENG } from "./softwareEng";

export const CATEGORIES: Category[] = [
  FUNDAMENTALS,
  CORE_INFRA,
  COMMUNICATION,
  SECURITY,
  DISTRIBUTED,
  PATTERNS,
  DATA_STORAGE,
  PERFORMANCE,
  REAL_WORLD,
  ALGORITHMS,
  EXPANDED,
  FULLSTACK,
  SOFTWARE_ENG,
];

export * from "./types";

/** Flat list of all topics with their category info attached */
export function getAllTopics(): FlatTopic[] {
  const all: FlatTopic[] = [];
  for (const cat of CATEGORIES) {
    for (const topic of cat.topics) {
      all.push({
        ...topic,
        category: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        level: cat.level,
      });
    }
  }
  return all;
}

/** Get topics filtered by category id */
export function getTopicsByCategory(categoryId: string): FlatTopic[] {
  if (!categoryId || categoryId === "all") return getAllTopics();
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat
    ? cat.topics.map((t) => ({
        ...t,
        category: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        level: cat.level,
      }))
    : [];
}

/** Get topics filtered by difficulty level */
export function getTopicsByLevel(level: string): FlatTopic[] {
  if (!level || level === "all") return getAllTopics();
  return getAllTopics().filter((t) => t.level === level);
}

/** Search topics by query */
export function searchTopics(query: string): FlatTopic[] {
  if (!query) return getAllTopics();
  const q = query.toLowerCase();
  return getAllTopics().filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

/** Get a single topic by id */
export function getTopicById(topicId: string): FlatTopic | undefined {
  return getAllTopics().find((t) => t.id === topicId);
}

/** Total topic count */
export const TOTAL_TOPICS = getAllTopics().length;
