/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TargetRole =
  | 'AI Engineer'
  | 'Machine Learning Engineer'
  | 'Cloud Engineer'
  | 'Data Scientist'
  | 'Full Stack Developer'
  | 'Software Engineer';

export type SkillCategory =
  | 'Programming'
  | 'AI / ML'
  | 'Cloud'
  | 'Database'
  | 'DevOps'
  | 'Web Development'
  | 'Tools';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ProjectStatus = 'Planned' | 'In Progress' | 'Completed';

export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed';

export type RecommendationPriority = 'High' | 'Medium' | 'Low';

export type ActivityType =
  | 'skill_added'
  | 'skill_updated'
  | 'goal_completed'
  | 'goal_created'
  | 'project_created'
  | 'project_completed'
  | 'certification_added'
  | 'achievement_unlocked';

// ==========================================
// Appwrite TablesDB Schema Models
// ==========================================

export interface UserRecord {
  $id: string;
  id: string;
  name: string;
  email: string;
  education: string;
  university: string;
  graduation_year: number;
  target_role: TargetRole;
  bio: string;
  profile_image: string;
  career_score: number;
  total_xp: number;
  level: number;
  created_at: string;
}

export interface SkillRecord {
  $id: string;
  id: string;
  name: string;
  category: SkillCategory;
  difficulty: DifficultyLevel;
}

export interface UserSkillRecord {
  $id: string;
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: number; // 0 - 100
  verified: boolean;
  last_updated: string;
  // Denormalized / populated join fields for optimal UI display
  skill_name?: string;
  skill_category?: SkillCategory;
  skill_difficulty?: DifficultyLevel;
}

export interface ProjectRecord {
  $id: string;
  id: string;
  user_id: string;
  title: string;
  description: string;
  technologies: string; // Comma-separated or array representation
  difficulty: DifficultyLevel;
  status: ProjectStatus;
  github_url: string;
  demo_url: string;
  created_at: string;
}

export interface CertificationRecord {
  $id: string;
  id: string;
  user_id: string;
  name: string;
  provider: string;
  credential_url: string;
  issue_date: string;
}

export interface LearningGoalRecord {
  $id: string;
  id: string;
  user_id: string;
  skill_id: string;
  title: string;
  description: string;
  current_level: number;
  target_level: number;
  progress: number; // 0 - 100
  deadline: string;
  status: GoalStatus;
  skill_name?: string;
}

export interface ActivityRecord {
  $id: string;
  id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  description: string;
  xp: number;
  created_at: string;
}

export interface RecommendationRecord {
  $id: string;
  id: string;
  user_id: string;
  type: 'project' | 'skill' | 'certification' | 'course';
  title: string;
  description: string;
  priority: RecommendationPriority;
  related_skill: string;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface AchievementRecord {
  $id: string;
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

// ==========================================
// AI & Roadmap Data Models
// ==========================================

export interface AICareerAnalysisResult {
  overallReadiness: number;
  strengths: string[];
  skillGaps: {
    skill: string;
    category: string;
    currentProficiency: number;
    targetProficiency: number;
    priority: RecommendationPriority;
    reason: string;
    estimatedWeeks: number;
  }[];
  readinessExplanation: string;
  recommendedActions: string[];
  marketInsights: {
    roleDemand: string;
    avgSalaryRange: string;
    topHiringCompanies: string[];
    keyTrends: string;
  };
}

export interface AIProjectRecommendation {
  title: string;
  problemSolves: string;
  skillsDeveloped: string[];
  difficulty: DifficultyLevel;
  estimatedTime: string;
  whyRecommended: string;
  architectureHighlights: string[];
  stepByStepGuide: string[];
  suggestedRepoName: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  subtitle: string;
  estimatedWeeks: string;
  goals: {
    title: string;
    description: string;
    skill: string;
    difficulty: DifficultyLevel;
    targetHours: number;
    keyDeliverable: string;
  }[];
}

// Appwrite Connection Status
export interface AppwriteConfigStatus {
  endpoint: string;
  projectId: string;
  databaseId: string;
  isConnected: boolean;
  isCustomConfig: boolean;
  activeMode: 'cloud' | 'local_tablesdb';
}
