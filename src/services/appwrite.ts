/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Account, Databases, ID, Query } from 'appwrite';
import type {
  UserRecord,
  SkillRecord,
  UserSkillRecord,
  ProjectRecord,
  CertificationRecord,
  LearningGoalRecord,
  ActivityRecord,
  RecommendationRecord,
  AchievementRecord,
  AppwriteConfigStatus,
} from '../types';

// Appwrite Database & Collection IDs
export const DATABASE_ID = (import.meta as any).env?.VITE_APPWRITE_DATABASE_ID || 'skillforge_db';

export const COLLECTIONS = {
  USERS: 'users',
  SKILLS: 'skills',
  USER_SKILLS: 'user_skills',
  PROJECTS: 'projects',
  CERTIFICATIONS: 'certifications',
  LEARNING_GOALS: 'learning_goals',
  ACTIVITIES: 'activities',
  RECOMMENDATIONS: 'recommendations',
  ACHIEVEMENTS: 'achievements',
} as const;

// Default initial config
const DEFAULT_ENDPOINT = (import.meta as any).env?.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const DEFAULT_PROJECT_ID = (import.meta as any).env?.VITE_APPWRITE_PROJECT_ID || '';

// Stored config keys
const STORAGE_CONFIG_KEY = 'skillforge_appwrite_config';
const STORAGE_TABLES_PREFIX = 'skillforge_tablesdb_';

function getInitialConfig(): { endpoint: string; projectId: string; databaseId: string } {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        endpoint: parsed.endpoint || DEFAULT_ENDPOINT,
        projectId: parsed.projectId || DEFAULT_PROJECT_ID,
        databaseId: parsed.databaseId || DATABASE_ID,
      };
    }
  } catch (e) {
    // ignore
  }
  return {
    endpoint: DEFAULT_ENDPOINT,
    projectId: DEFAULT_PROJECT_ID,
    databaseId: DATABASE_ID,
  };
}

const currentConfig = getInitialConfig();

// Initialize Appwrite Client
export const appwriteClient = new Client();
if (currentConfig.endpoint) {
  appwriteClient.setEndpoint(currentConfig.endpoint);
}
if (currentConfig.projectId) {
  appwriteClient.setProject(currentConfig.projectId);
}

export const appwriteAccount = new Account(appwriteClient);
export const appwriteDatabases = new Databases(appwriteClient);

// Re-export SDK tools
export { ID, Query };

// ==========================================================
// TablesDB Local Emulation Store (Zero-Dependency Fallback)
// Ensures the Hackathon demo is 100% resilient and offline-capable
// while mirroring exact Appwrite TablesDB operations and schemas.
// ==========================================================

function getCollectionStore<T>(collection: string): T[] {
  try {
    const data = localStorage.getItem(STORAGE_TABLES_PREFIX + collection);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(`Failed to read collection ${collection}`, e);
  }
  return [];
}

function setCollectionStore<T>(collection: string, items: T[]): void {
  try {
    localStorage.setItem(STORAGE_TABLES_PREFIX + collection, JSON.stringify(items));
  } catch (e) {
    console.error(`Failed to write collection ${collection}`, e);
  }
}

// Check if live Appwrite can be used
let isLiveAppwriteActive = Boolean(currentConfig.projectId && currentConfig.projectId !== 'your-appwrite-project-id');

export const appwriteService = {
  getConfig(): AppwriteConfigStatus {
    return {
      endpoint: currentConfig.endpoint,
      projectId: currentConfig.projectId,
      databaseId: currentConfig.databaseId,
      isConnected: isLiveAppwriteActive,
      isCustomConfig: !!localStorage.getItem(STORAGE_CONFIG_KEY),
      activeMode: isLiveAppwriteActive ? 'cloud' : 'local_tablesdb',
    };
  },

  updateConfig(endpoint: string, projectId: string, databaseId: string) {
    currentConfig.endpoint = endpoint.trim();
    currentConfig.projectId = projectId.trim();
    currentConfig.databaseId = databaseId.trim();

    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(currentConfig));

    appwriteClient.setEndpoint(currentConfig.endpoint);
    if (currentConfig.projectId) {
      appwriteClient.setProject(currentConfig.projectId);
      isLiveAppwriteActive = true;
    } else {
      isLiveAppwriteActive = false;
    }
  },

  async pingLiveAppwrite(): Promise<{ success: boolean; message: string }> {
    if (!currentConfig.projectId) {
      return { success: false, message: 'No Appwrite Project ID configured. Running in Local TablesDB Mode.' };
    }
    try {
      // Attempt to ping health or account
      await appwriteAccount.get();
      return { success: true, message: 'Connected to Appwrite Cloud with active session!' };
    } catch (err: any) {
      if (err?.code === 401) {
        // 401 means project is valid, just no logged-in session!
        return { success: true, message: 'Connected to Appwrite Cloud successfully! (Guest state)' };
      }
      return {
        success: false,
        message: err?.message || 'Could not connect to Appwrite Cloud. Check Project ID and CORS origins.',
      };
    }
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async createAccount(email: string, password: string, name: string) {
    if (isLiveAppwriteActive) {
      try {
        const res = await appwriteAccount.create(ID.unique(), email, password, name);
        // Automatically create session
        await appwriteAccount.createEmailPasswordSession(email, password);
        return res;
      } catch (err) {
        console.warn('Live Appwrite auth failed, falling back to local TablesDB user creation', err);
      }
    }

    // Local TablesDB fallback
    const users = getCollectionStore<UserRecord>(COLLECTIONS.USERS);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('A user with this email already exists.');
    }

    const userId = 'usr_' + Date.now();
    const newUser: UserRecord = {
      $id: userId,
      id: userId,
      name,
      email,
      education: 'Undergraduate in Computer Science',
      university: 'Stanford University',
      graduation_year: 2026,
      target_role: 'AI Engineer',
      bio: 'Enthusiastic developer focused on modern web engineering, AI applications, and distributed databases.',
      profile_image: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      career_score: 55,
      total_xp: 50,
      level: 1,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    setCollectionStore(COLLECTIONS.USERS, users);
    localStorage.setItem('skillforge_current_user_id', userId);
    return newUser;
  },

  async login(email: string, password: string) {
    if (isLiveAppwriteActive) {
      try {
        await appwriteAccount.createEmailPasswordSession(email, password);
        const accountUser = await appwriteAccount.get();
        return accountUser;
      } catch (err) {
        console.warn('Live Appwrite login failed, trying local TablesDB auth', err);
      }
    }

    // Local TablesDB login
    const users = getCollectionStore<UserRecord>(COLLECTIONS.USERS);
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error('Invalid email or password. You can also click "Explore Demo" to try instantly.');
    }

    localStorage.setItem('skillforge_current_user_id', found.id);
    return found;
  },

  async logout() {
    if (isLiveAppwriteActive) {
      try {
        await appwriteAccount.deleteSession('current');
      } catch (err) {
        // ignore
      }
    }
    localStorage.removeItem('skillforge_current_user_id');
  },

  async getCurrentUser(): Promise<UserRecord | null> {
    const storedUserId = localStorage.getItem('skillforge_current_user_id');
    const users = getCollectionStore<UserRecord>(COLLECTIONS.USERS);

    if (storedUserId) {
      const user = users.find((u) => u.id === storedUserId || u.$id === storedUserId);
      if (user) return user;
    }

    if (users.length > 0) {
      return users[0];
    }

    return null;
  },

  // ==========================================
  // TABLESDB CRUD & QUERY ENGINE
  // ==========================================
  async listDocuments<T extends { $id: string; [key: string]: any }>(
    collectionId: string,
    queries: string[] = []
  ): Promise<{ total: number; documents: T[] }> {
    if (isLiveAppwriteActive) {
      try {
        const res = await appwriteDatabases.listDocuments(currentConfig.databaseId, collectionId, queries);
        return { total: res.total, documents: res.documents as unknown as T[] };
      } catch (err) {
        console.warn(`Live Appwrite listDocuments error for ${collectionId}. Reading from local TablesDB cache.`, err);
      }
    }

    let items = getCollectionStore<T>(collectionId);

    // Apply Appwrite Queries emulation (equal, search, orderDesc, orderAsc, limit)
    for (const q of queries) {
      if (typeof q === 'string') {
        try {
          const parsed = JSON.parse(q);
          const method = parsed.method;
          const attr = parsed.attribute;
          const values = parsed.values;

          if (method === 'equal' && attr && values && values.length > 0) {
            items = items.filter((item) => String(item[attr]) === String(values[0]));
          } else if (method === 'search' && attr && values && values.length > 0) {
            const queryText = String(values[0]).toLowerCase();
            items = items.filter((item) => String(item[attr] || '').toLowerCase().includes(queryText));
          } else if (method === 'orderDesc' && attr) {
            items = items.sort((a, b) => {
              if (a[attr] < b[attr]) return 1;
              if (a[attr] > b[attr]) return -1;
              return 0;
            });
          } else if (method === 'orderAsc' && attr) {
            items = items.sort((a, b) => {
              if (a[attr] > b[attr]) return 1;
              if (a[attr] < b[attr]) return -1;
              return 0;
            });
          } else if (method === 'limit' && values && values[0]) {
            items = items.slice(0, Number(values[0]));
          }
        } catch {
          // If query string is raw Appwrite SDK query string
        }
      }
    }

    return { total: items.length, documents: items };
  },

  async createDocument<T extends { $id?: string; id?: string; [key: string]: any }>(
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    if (isLiveAppwriteActive) {
      try {
        const res = await appwriteDatabases.createDocument(
          currentConfig.databaseId,
          collectionId,
          documentId === 'unique()' ? ID.unique() : documentId,
          data
        );
        return res as unknown as T;
      } catch (err) {
        console.warn(`Live Appwrite createDocument failed for ${collectionId}, persisting to local TablesDB.`, err);
      }
    }

    const items = getCollectionStore<any>(collectionId);
    const newId = documentId === 'unique()' ? 'doc_' + Math.random().toString(36).substring(2, 9) : documentId;
    const now = new Date().toISOString();

    const newDoc = {
      ...data,
      $id: newId,
      id: newId,
      $createdAt: now,
      $updatedAt: now,
      created_at: data.created_at || now,
    };

    items.unshift(newDoc);
    setCollectionStore(collectionId, items);
    return newDoc as T;
  },

  async updateDocument<T extends { $id: string; [key: string]: any }>(
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    if (isLiveAppwriteActive) {
      try {
        const res = await appwriteDatabases.updateDocument(currentConfig.databaseId, collectionId, documentId, data);
        return res as unknown as T;
      } catch (err) {
        console.warn(`Live Appwrite updateDocument failed for ${collectionId}, updating local TablesDB.`, err);
      }
    }

    const items = getCollectionStore<any>(collectionId);
    const index = items.findIndex((item) => item.$id === documentId || item.id === documentId);
    if (index === -1) {
      throw new Error(`Document ${documentId} not found in collection ${collectionId}`);
    }

    const updatedDoc = {
      ...items[index],
      ...data,
      $updatedAt: new Date().toISOString(),
    };

    items[index] = updatedDoc;
    setCollectionStore(collectionId, items);
    return updatedDoc as T;
  },

  async deleteDocument(collectionId: string, documentId: string): Promise<boolean> {
    if (isLiveAppwriteActive) {
      try {
        await appwriteDatabases.deleteDocument(currentConfig.databaseId, collectionId, documentId);
        return true;
      } catch (err) {
        console.warn(`Live Appwrite deleteDocument failed for ${collectionId}.`, err);
      }
    }

    const items = getCollectionStore<any>(collectionId);
    const filtered = items.filter((item) => item.$id !== documentId && item.id !== documentId);
    setCollectionStore(collectionId, filtered);
    return true;
  },

  // ==========================================
  // SEED & DEMO INITIALIZATION
  // Pre-populates realistic data for judging
  // ==========================================
  seedDemoData(force = false) {
    const existingUsers = getCollectionStore<UserRecord>(COLLECTIONS.USERS);
    if (existingUsers.length > 0 && !force) {
      return;
    }

    const demoUserId = 'usr_alex_chen_2026';

    const demoUser: UserRecord = {
      $id: demoUserId,
      id: demoUserId,
      name: 'Alex Chen',
      email: 'alex.chen@stanford.edu',
      education: 'B.S. in Computer Science',
      university: 'Stanford University',
      graduation_year: 2026,
      target_role: 'AI Engineer',
      bio: 'Senior CS undergraduate passionate about distributed systems, large language model inference architectures, and full-stack engineering.',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      career_score: 82,
      total_xp: 1420,
      level: 7,
      created_at: '2026-09-01T08:00:00.000Z',
    };

    const demoSkills: SkillRecord[] = [
      { $id: 'sk_1', id: 'sk_1', name: 'Python', category: 'Programming', difficulty: 'Advanced' },
      { $id: 'sk_2', id: 'sk_2', name: 'TypeScript', category: 'Programming', difficulty: 'Intermediate' },
      { $id: 'sk_3', id: 'sk_3', name: 'PyTorch & ML', category: 'AI / ML', difficulty: 'Intermediate' },
      { $id: 'sk_4', id: 'sk_4', name: 'Large Language Models (LLMs)', category: 'AI / ML', difficulty: 'Intermediate' },
      { $id: 'sk_5', id: 'sk_5', name: 'Appwrite TablesDB', category: 'Database', difficulty: 'Intermediate' },
      { $id: 'sk_6', id: 'sk_6', name: 'PostgreSQL / SQL', category: 'Database', difficulty: 'Intermediate' },
      { $id: 'sk_7', id: 'sk_7', name: 'Docker & Containers', category: 'DevOps', difficulty: 'Beginner' },
      { $id: 'sk_8', id: 'sk_8', name: 'React & Tailwind', category: 'Web Development', difficulty: 'Advanced' },
      { $id: 'sk_9', id: 'sk_9', name: 'System Design', category: 'Tools', difficulty: 'Intermediate' },
      { $id: 'sk_10', id: 'sk_10', name: 'CI/CD & GitHub Actions', category: 'DevOps', difficulty: 'Beginner' },
    ];

    const demoUserSkills: UserSkillRecord[] = [
      { $id: 'usk_1', id: 'usk_1', user_id: demoUserId, skill_id: 'sk_1', proficiency: 88, verified: true, last_updated: '2026-10-15T12:00:00Z', skill_name: 'Python', skill_category: 'Programming' },
      { $id: 'usk_2', id: 'usk_2', user_id: demoUserId, skill_id: 'sk_2', proficiency: 82, verified: true, last_updated: '2026-10-18T10:00:00Z', skill_name: 'TypeScript', skill_category: 'Programming' },
      { $id: 'usk_3', id: 'usk_3', user_id: demoUserId, skill_id: 'sk_3', proficiency: 74, verified: false, last_updated: '2026-10-20T14:30:00Z', skill_name: 'PyTorch & ML', skill_category: 'AI / ML' },
      { $id: 'usk_4', id: 'usk_4', user_id: demoUserId, skill_id: 'sk_4', proficiency: 79, verified: true, last_updated: '2026-10-24T09:15:00Z', skill_name: 'Large Language Models (LLMs)', skill_category: 'AI / ML' },
      { $id: 'usk_5', id: 'usk_5', user_id: demoUserId, skill_id: 'sk_5', proficiency: 85, verified: true, last_updated: '2026-10-26T18:00:00Z', skill_name: 'Appwrite TablesDB', skill_category: 'Database' },
      { $id: 'usk_6', id: 'usk_6', user_id: demoUserId, skill_id: 'sk_6', proficiency: 48, verified: false, last_updated: '2026-10-12T11:00:00Z', skill_name: 'PostgreSQL / SQL', skill_category: 'Database' },
      { $id: 'usk_7', id: 'usk_7', user_id: demoUserId, skill_id: 'sk_7', proficiency: 35, verified: false, last_updated: '2026-10-08T15:45:00Z', skill_name: 'Docker & Containers', skill_category: 'DevOps' },
      { $id: 'usk_8', id: 'usk_8', user_id: demoUserId, skill_id: 'sk_8', proficiency: 92, verified: true, last_updated: '2026-10-25T16:20:00Z', skill_name: 'React & Tailwind', skill_category: 'Web Development' },
      { $id: 'usk_9', id: 'usk_9', user_id: demoUserId, skill_id: 'sk_9', proficiency: 42, verified: false, last_updated: '2026-10-10T13:00:00Z', skill_name: 'System Design', skill_category: 'Tools' },
      { $id: 'usk_10', id: 'usk_10', user_id: demoUserId, skill_id: 'sk_10', proficiency: 40, verified: false, last_updated: '2026-10-05T17:00:00Z', skill_name: 'CI/CD & GitHub Actions', skill_category: 'DevOps' },
    ];

    const demoProjects: ProjectRecord[] = [
      {
        $id: 'proj_1',
        id: 'proj_1',
        user_id: demoUserId,
        title: 'SkillForge AI — Career Roadmap Platform',
        description: 'AI-powered career development platform built for Appwrite Databases Hackathon with relational schema, Gemini AI integration, and gamification.',
        technologies: 'Appwrite TablesDB, React, TypeScript, Gemini API, Tailwind CSS',
        difficulty: 'Advanced',
        status: 'Completed',
        github_url: 'https://github.com/alexchen/skillforge-ai',
        demo_url: 'https://skillforge-ai.appwrite.network',
        created_at: '2026-10-28T09:00:00Z',
      },
      {
        $id: 'proj_2',
        id: 'proj_2',
        user_id: demoUserId,
        title: 'NeuralSearch — Multimodal Embedding Engine',
        description: 'Real-time semantic search over academic computer science preprints using dense embeddings, vector indexing, and fast approximate nearest neighbors.',
        technologies: 'Python, PyTorch, FastAPI, FAISS, Docker',
        difficulty: 'Advanced',
        status: 'Completed',
        github_url: 'https://github.com/alexchen/neuralsearch-engine',
        demo_url: 'https://neuralsearch.dev',
        created_at: '2026-09-15T14:00:00Z',
      },
      {
        $id: 'proj_3',
        id: 'proj_3',
        user_id: demoUserId,
        title: 'Microservices Containerized Cluster',
        description: 'Orchestrating microservices with automated health checking, Redis pub/sub queue, and Appwrite TablesDB persistence layer.',
        technologies: 'Docker, Redis, Node.js, Appwrite',
        difficulty: 'Intermediate',
        status: 'In Progress',
        github_url: 'https://github.com/alexchen/microservices-cluster',
        demo_url: '',
        created_at: '2026-10-22T11:30:00Z',
      },
    ];

    const demoCertifications: CertificationRecord[] = [
      {
        $id: 'cert_1',
        id: 'cert_1',
        user_id: demoUserId,
        name: 'Deep Learning Specialization',
        provider: 'DeepLearning.AI',
        credential_url: 'https://coursera.org/verify/specialization/DL2026AC',
        issue_date: '2026-04-12',
      },
      {
        $id: 'cert_2',
        id: 'cert_2',
        user_id: demoUserId,
        name: 'AWS Certified Cloud Practitioner',
        provider: 'Amazon Web Services',
        credential_url: 'https://aws.amazon.com/verification/AWS-CP-883921',
        issue_date: '2026-07-20',
      },
    ];

    const demoGoals: LearningGoalRecord[] = [
      {
        $id: 'goal_1',
        id: 'goal_1',
        user_id: demoUserId,
        skill_id: 'sk_7',
        title: 'Master Docker Multi-Stage Builds & Compose',
        description: 'Build production-grade container images with alpine bases, non-root users, and multi-service docker-compose networks.',
        current_level: 35,
        target_level: 80,
        progress: 60,
        deadline: '2026-11-15',
        status: 'In Progress',
        skill_name: 'Docker & Containers',
      },
      {
        $id: 'goal_2',
        id: 'goal_2',
        user_id: demoUserId,
        skill_id: 'sk_6',
        title: 'Appwrite TablesDB Relational Schema & Indexes',
        description: 'Implement compound indexes and optimize query execution for high-cardinality foreign key lookups.',
        current_level: 48,
        target_level: 85,
        progress: 85,
        deadline: '2026-11-20',
        status: 'In Progress',
        skill_name: 'PostgreSQL / SQL',
      },
      {
        $id: 'goal_3',
        id: 'goal_3',
        user_id: demoUserId,
        skill_id: 'sk_9',
        title: 'System Design: Distributed Caching & Rate Limiting',
        description: 'Study consistent hashing, token bucket rate limiters, and write-through caching patterns.',
        current_level: 42,
        target_level: 80,
        progress: 40,
        deadline: '2026-12-05',
        status: 'In Progress',
        skill_name: 'System Design',
      },
      {
        $id: 'goal_4',
        id: 'goal_4',
        user_id: demoUserId,
        skill_id: 'sk_8',
        title: 'Complete Modern React 19 Frontend Architecture',
        description: 'Implement responsive UI with TypeScript, Tailwind CSS, motion design, and accessible components.',
        current_level: 92,
        target_level: 95,
        progress: 100,
        deadline: '2026-10-25',
        status: 'Completed',
        skill_name: 'React & Tailwind',
      },
    ];

    const demoActivities: ActivityRecord[] = [
      {
        $id: 'act_1',
        id: 'act_1',
        user_id: demoUserId,
        type: 'project_completed',
        title: 'Completed SkillForge AI Capstone Project',
        description: 'Built full-stack AI career platform for Appwrite Databases Hackathon.',
        xp: 50,
        created_at: '2026-10-28T19:30:00Z',
      },
      {
        $id: 'act_2',
        id: 'act_2',
        user_id: demoUserId,
        type: 'goal_completed',
        title: 'Completed Goal: Modern React Architecture',
        description: 'Successfully reached 92% proficiency in React & Tailwind.',
        xp: 25,
        created_at: '2026-10-25T16:20:00Z',
      },
      {
        $id: 'act_3',
        id: 'act_3',
        user_id: demoUserId,
        type: 'certification_added',
        title: 'Added AWS Cloud Practitioner Certification',
        description: 'Verified cloud credential from Amazon Web Services.',
        xp: 100,
        created_at: '2026-07-20T10:15:00Z',
      },
      {
        $id: 'act_4',
        id: 'act_4',
        user_id: demoUserId,
        type: 'skill_added',
        title: 'Added Appwrite TablesDB to Skills',
        description: 'Initialized relational database tracking and queries.',
        xp: 10,
        created_at: '2026-10-26T18:00:00Z',
      },
    ];

    const demoRecommendations: RecommendationRecord[] = [
      {
        $id: 'rec_1',
        id: 'rec_1',
        user_id: demoUserId,
        type: 'project',
        title: 'Containerize Microservices with Docker Compose',
        description: 'Bridge your 35% Docker proficiency gap by packaging SkillForge services into unified compose topology.',
        priority: 'High',
        related_skill: 'Docker & Containers',
        status: 'pending',
        created_at: '2026-10-27T08:00:00Z',
      },
      {
        $id: 'rec_2',
        id: 'rec_2',
        user_id: demoUserId,
        type: 'skill',
        title: 'Strengthen System Design Patterns',
        description: 'Review distributed database partitioning, sharding, and write-ahead logging to prepare for senior interviews.',
        priority: 'High',
        related_skill: 'System Design',
        status: 'pending',
        created_at: '2026-10-26T09:00:00Z',
      },
      {
        $id: 'rec_3',
        id: 'rec_3',
        user_id: demoUserId,
        type: 'course',
        title: 'GitHub Actions for Continuous Integration',
        description: 'Automate linting and Docker image registry publishing on every pull request.',
        priority: 'Medium',
        related_skill: 'CI/CD & GitHub Actions',
        status: 'pending',
        created_at: '2026-10-25T11:00:00Z',
      },
      {
        $id: 'rec_4',
        id: 'rec_4',
        user_id: demoUserId,
        type: 'certification',
        title: 'Prepare for CKAD (Certified Kubernetes App Developer)',
        description: 'Targeted milestone for Q1 2027 to solidify your cloud infrastructure mastery.',
        priority: 'Low',
        related_skill: 'DevOps',
        status: 'pending',
        created_at: '2026-10-24T14:00:00Z',
      },
    ];

    const demoAchievements: AchievementRecord[] = [
      {
        $id: 'ach_1',
        id: 'ach_1',
        user_id: demoUserId,
        name: 'First Project',
        description: 'Created and deployed your first technical portfolio project.',
        icon: 'Rocket',
        unlocked_at: '2026-09-15T14:00:00Z',
      },
      {
        $id: 'ach_2',
        id: 'ach_2',
        user_id: demoUserId,
        name: 'Skill Builder',
        description: 'Added and tracked 5+ core technical competencies.',
        icon: 'Layers',
        unlocked_at: '2026-10-18T10:00:00Z',
      },
      {
        $id: 'ach_3',
        id: 'ach_3',
        user_id: demoUserId,
        name: 'Roadmap Starter',
        description: 'Generated personalized career milestones and began active learning.',
        icon: 'Compass',
        unlocked_at: '2026-10-20T08:00:00Z',
      },
      {
        $id: 'ach_4',
        id: 'ach_4',
        user_id: demoUserId,
        name: 'Certified',
        description: 'Verified an industry recognized technical certification.',
        icon: 'Award',
        unlocked_at: '2026-07-20T10:15:00Z',
      },
      {
        $id: 'ach_5',
        id: 'ach_5',
        user_id: demoUserId,
        name: 'Career Ready',
        description: 'Surpassed 80/100 on the AI Career Readiness benchmark!',
        icon: 'CheckCircle2',
        unlocked_at: '2026-10-28T19:30:00Z',
      },
    ];

    setCollectionStore(COLLECTIONS.USERS, [demoUser]);
    setCollectionStore(COLLECTIONS.SKILLS, demoSkills);
    setCollectionStore(COLLECTIONS.USER_SKILLS, demoUserSkills);
    setCollectionStore(COLLECTIONS.PROJECTS, demoProjects);
    setCollectionStore(COLLECTIONS.CERTIFICATIONS, demoCertifications);
    setCollectionStore(COLLECTIONS.LEARNING_GOALS, demoGoals);
    setCollectionStore(COLLECTIONS.ACTIVITIES, demoActivities);
    setCollectionStore(COLLECTIONS.RECOMMENDATIONS, demoRecommendations);
    setCollectionStore(COLLECTIONS.ACHIEVEMENTS, demoAchievements);

    localStorage.setItem('skillforge_current_user_id', demoUserId);
  },
};

// Auto-seed on first load if empty
appwriteService.seedDemoData(false);
