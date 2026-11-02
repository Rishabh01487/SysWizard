export type Level = "beginner" | "intermediate" | "advanced";

export interface Tradeoffs {
  pros: string[];
  cons: string[];
}

export interface TopicContent {
  overview: string;
  howItWorks: string[];
  keyConcepts: string[];
  realWorld: string;
  tradeoffs: Tradeoffs;
  codeExample: string;
  interviewTips: string[];
}

export interface Topic {
  id: string;
  title: string;
  icon: string;
  description: string;
  tags: string[];
  hasAnimation: boolean;
  content: TopicContent;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  level: Level;
  topics: Topic[];
}

export interface FlatTopic extends Topic {
  category: string;
  categoryName: string;
  categoryIcon: string;
  level: Level;
}
