/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  SkillRecord,
  UserSkillRecord,
  ProjectRecord,
  CertificationRecord,
  LearningGoalRecord,
  ActivityRecord,
  RecommendationRecord,
  AchievementRecord,
  DifficultyLevel,
  SkillCategory,
  ProjectStatus,
  GoalStatus,
  RecommendationPriority,
} from '../types';
import { appwriteService, COLLECTIONS, Query } from '../services/appwrite';
import { useAuth } from './AuthContext';
import { triggerConfetti, triggerMilestoneConfetti } from '../utils/confetti';

interface DataContextType {
  skills: SkillRecord[];
  userSkills: UserSkillRecord[];
  projects: ProjectRecord[];
  certifications: CertificationRecord[];
  learningGoals: LearningGoalRecord[];
  activities: ActivityRecord[];
  recommendations: RecommendationRecord[];
  achievements: AchievementRecord[];
  careerScore: number;
  totalXp: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  loading: boolean;
  refreshData: () => Promise<void>;

  // Skill actions
  addUserSkill: (name: string, category: SkillCategory, proficiency: number, difficulty?: DifficultyLevel) => Promise<void>;
  updateSkillProficiency: (userSkillId: string, proficiency: number) => Promise<void>;
  deleteUserSkill: (userSkillId: string) => Promise<void>;

  // Project actions
  addProject: (data: Omit<ProjectRecord, '$id' | 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectRecord>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Certification actions
  addCertification: (data: Omit<CertificationRecord, '$id' | 'id' | 'user_id'>) => Promise<void>;
  deleteCertification: (id: string) => Promise<void>;

  // Learning Goal actions
  addLearningGoal: (data: Omit<LearningGoalRecord, '$id' | 'id' | 'user_id'>) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Recommendation actions
  acceptRecommendation: (id: string) => Promise<void>;
  dismissRecommendation: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();

  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkillRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoalRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.$id || user?.id || 'usr_alex_chen_2026';

  // Gamification calculations
  const totalXp = user?.total_xp || 1420;
  const level = Math.max(1, Math.floor(totalXp / 200) + 1);
  const xpInCurrentLevel = totalXp % 200;
  const xpToNextLevel = 200 - xpInCurrentLevel;

  const getLevelTitle = (lvl: number) => {
    if (lvl >= 20) return 'Career Ready';
    if (lvl >= 10) return 'Builder';
    if (lvl >= 5) return 'Explorer';
    return 'Beginner';
  };
  const levelTitle = getLevelTitle(level);

  // Load all user collections from Appwrite TablesDB
  const refreshData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const currentUserId = user.$id || user.id;

      // Appwrite query using Query.equal for relational scoping
      const userFilter = [Query.equal('user_id', currentUserId)];

      const [
        skillsRes,
        userSkillsRes,
        projectsRes,
        certsRes,
        goalsRes,
        activitiesRes,
        recsRes,
        achieveRes,
      ] = await Promise.all([
        appwriteService.listDocuments<SkillRecord>(COLLECTIONS.SKILLS, [Query.limit(100)]),
        appwriteService.listDocuments<UserSkillRecord>(COLLECTIONS.USER_SKILLS, userFilter),
        appwriteService.listDocuments<ProjectRecord>(COLLECTIONS.PROJECTS, [
          ...userFilter,
          Query.orderDesc('created_at'),
        ]),
        appwriteService.listDocuments<CertificationRecord>(COLLECTIONS.CERTIFICATIONS, userFilter),
        appwriteService.listDocuments<LearningGoalRecord>(COLLECTIONS.LEARNING_GOALS, userFilter),
        appwriteService.listDocuments<ActivityRecord>(COLLECTIONS.ACTIVITIES, [
          ...userFilter,
          Query.orderDesc('created_at'),
        ]),
        appwriteService.listDocuments<RecommendationRecord>(COLLECTIONS.RECOMMENDATIONS, userFilter),
        appwriteService.listDocuments<AchievementRecord>(COLLECTIONS.ACHIEVEMENTS, userFilter),
      ]);

      setSkills(skillsRes.documents);
      setUserSkills(userSkillsRes.documents);
      setProjects(projectsRes.documents);
      setCertifications(certsRes.documents);
      setLearningGoals(goalsRes.documents);
      setActivities(activitiesRes.documents);
      setRecommendations(recsRes.documents);
      setAchievements(achieveRes.documents);
    } catch (err) {
      console.error('Error fetching data from Appwrite TablesDB:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Log activity and award XP
  const awardXpAndLogActivity = async (
    xpGain: number,
    type: ActivityRecord['type'],
    title: string,
    description: string
  ) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;
    const newTotalXp = (user.total_xp || 0) + xpGain;
    const newLevel = Math.max(1, Math.floor(newTotalXp / 200) + 1);

    // Update user profile in Appwrite
    await updateUser({ total_xp: newTotalXp, level: newLevel });

    // Create Activity in Appwrite TablesDB
    const activity = await appwriteService.createDocument<ActivityRecord>(
      COLLECTIONS.ACTIVITIES,
      'unique()',
      {
        user_id: currentUserId,
        type,
        title,
        description,
        xp: xpGain,
        created_at: new Date().toISOString(),
      }
    );

    setActivities((prev) => [activity, ...prev]);

    // Check achievement milestones
    checkAchievements(newTotalXp, projects.length, userSkills.length, certifications.length);
  };

  // Re-calculate Career Score based on dimensions
  const calculateCareerScore = useCallback(() => {
    const avgProficiency =
      userSkills.length > 0
        ? userSkills.reduce((acc, s) => acc + s.proficiency, 0) / userSkills.length
        : 40;
    const skillScore = (avgProficiency / 100) * 40;

    const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;
    const inProgressProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
    const projectScore = Math.min(30, completedProjectsCount * 12 + inProgressProjectsCount * 5);

    const certScore = Math.min(15, certifications.length * 7.5);

    const completedGoalsCount = learningGoals.filter((g) => g.status === 'Completed').length;
    const goalsScore = Math.min(15, completedGoalsCount * 4 + learningGoals.length * 2);

    const raw = Math.round(skillScore + projectScore + certScore + goalsScore);
    return Math.max(20, Math.min(98, raw));
  }, [userSkills, projects, certifications, learningGoals]);

  const careerScore = user?.career_score || calculateCareerScore();

  // Check achievement conditions
  const checkAchievements = async (
    currentXp: number,
    projCount: number,
    skillCount: number,
    certCount: number
  ) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;
    const existing = new Set(achievements.map((a) => a.name));

    const toUnlock: { name: string; description: string; icon: string }[] = [];

    if (projCount >= 1 && !existing.has('First Project')) {
      toUnlock.push({
        name: 'First Project',
        description: 'Created and deployed your first technical portfolio project.',
        icon: 'Rocket',
      });
    }
    if (skillCount >= 5 && !existing.has('Skill Builder')) {
      toUnlock.push({
        name: 'Skill Builder',
        description: 'Added and tracked 5+ core technical competencies.',
        icon: 'Layers',
      });
    }
    if (learningGoals.length >= 1 && !existing.has('Roadmap Starter')) {
      toUnlock.push({
        name: 'Roadmap Starter',
        description: 'Generated personalized career milestones and began active learning.',
        icon: 'Compass',
      });
    }
    if (certCount >= 1 && !existing.has('Certified')) {
      toUnlock.push({
        name: 'Certified',
        description: 'Verified an industry recognized technical certification.',
        icon: 'Award',
      });
    }
    if (projects.filter((p) => p.status === 'Completed').length >= 3 && !existing.has('Project Master')) {
      toUnlock.push({
        name: 'Project Master',
        description: 'Completed 3+ real-world portfolio projects.',
        icon: 'Crown',
      });
    }
    if (careerScore >= 80 && !existing.has('Career Ready')) {
      toUnlock.push({
        name: 'Career Ready',
        description: 'Surpassed 80/100 on the AI Career Readiness benchmark!',
        icon: 'CheckCircle2',
      });
    }

    for (const item of toUnlock) {
      const doc = await appwriteService.createDocument<AchievementRecord>(
        COLLECTIONS.ACHIEVEMENTS,
        'unique()',
        {
          user_id: currentUserId,
          name: item.name,
          description: item.description,
          icon: item.icon,
          unlocked_at: new Date().toISOString(),
        }
      );
      setAchievements((prev) => [...prev, doc]);
      triggerMilestoneConfetti();
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const addUserSkill = async (
    name: string,
    category: SkillCategory,
    proficiency: number,
    difficulty: DifficultyLevel = 'Intermediate'
  ) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;

    // Check if skill exists in catalog, or create
    let skill = skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (!skill) {
      skill = await appwriteService.createDocument<SkillRecord>(COLLECTIONS.SKILLS, 'unique()', {
        name,
        category,
        difficulty,
      });
      setSkills((prev) => [...prev, skill!]);
    }

    // Check if user already has skill
    const existingUserSkill = userSkills.find((us) => us.skill_name?.toLowerCase() === name.toLowerCase());
    if (existingUserSkill) {
      await updateSkillProficiency(existingUserSkill.$id || existingUserSkill.id, proficiency);
      return;
    }

    const newUserSkill = await appwriteService.createDocument<UserSkillRecord>(
      COLLECTIONS.USER_SKILLS,
      'unique()',
      {
        user_id: currentUserId,
        skill_id: skill.$id || skill.id,
        proficiency,
        verified: proficiency > 70,
        last_updated: new Date().toISOString(),
        skill_name: name,
        skill_category: category,
        skill_difficulty: difficulty,
      }
    );

    setUserSkills((prev) => [...prev, newUserSkill]);
    triggerConfetti();
    await awardXpAndLogActivity(10, 'skill_added', `Added Skill: ${name}`, `Targeted ${proficiency}% proficiency in ${category}`);
  };

  const updateSkillProficiency = async (userSkillId: string, proficiency: number) => {
    const updated = await appwriteService.updateDocument<UserSkillRecord>(
      COLLECTIONS.USER_SKILLS,
      userSkillId,
      {
        proficiency,
        verified: proficiency >= 75,
        last_updated: new Date().toISOString(),
      }
    );
    setUserSkills((prev) => prev.map((s) => (s.$id === userSkillId || s.id === userSkillId ? { ...s, ...updated } : s)));
  };

  const deleteUserSkill = async (userSkillId: string) => {
    await appwriteService.deleteDocument(COLLECTIONS.USER_SKILLS, userSkillId);
    setUserSkills((prev) => prev.filter((s) => s.$id !== userSkillId && s.id !== userSkillId));
  };

  const addProject = async (data: Omit<ProjectRecord, '$id' | 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;
    const newProj = await appwriteService.createDocument<ProjectRecord>(
      COLLECTIONS.PROJECTS,
      'unique()',
      {
        ...data,
        user_id: currentUserId,
        created_at: new Date().toISOString(),
      }
    );

    setProjects((prev) => [newProj, ...prev]);
    const xp = data.status === 'Completed' ? 50 : 20;
    triggerConfetti();
    await awardXpAndLogActivity(
      xp,
      data.status === 'Completed' ? 'project_completed' : 'project_created',
      `${data.status === 'Completed' ? 'Completed' : 'Added'} Project: ${data.title}`,
      `Technologies: ${data.technologies}`
    );
  };

  const updateProject = async (id: string, updates: Partial<ProjectRecord>) => {
    const old = projects.find((p) => p.$id === id || p.id === id);
    const updated = await appwriteService.updateDocument<ProjectRecord>(COLLECTIONS.PROJECTS, id, updates);

    setProjects((prev) => prev.map((p) => (p.$id === id || p.id === id ? { ...p, ...updated } : p)));

    if (old && old.status !== 'Completed' && updates.status === 'Completed') {
      triggerMilestoneConfetti();
      await awardXpAndLogActivity(50, 'project_completed', `Completed Project: ${updated.title}`, `Mastered ${updated.technologies}`);
    }
  };

  const deleteProject = async (id: string) => {
    await appwriteService.deleteDocument(COLLECTIONS.PROJECTS, id);
    setProjects((prev) => prev.filter((p) => p.$id !== id && p.id !== id));
  };

  const addCertification = async (data: Omit<CertificationRecord, '$id' | 'id' | 'user_id'>) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;
    const newCert = await appwriteService.createDocument<CertificationRecord>(
      COLLECTIONS.CERTIFICATIONS,
      'unique()',
      {
        ...data,
        user_id: currentUserId,
      }
    );

    setCertifications((prev) => [newCert, ...prev]);
    triggerMilestoneConfetti();
    await awardXpAndLogActivity(100, 'certification_added', `Added Certification: ${data.name}`, `Issued by ${data.provider}`);
  };

  const deleteCertification = async (id: string) => {
    await appwriteService.deleteDocument(COLLECTIONS.CERTIFICATIONS, id);
    setCertifications((prev) => prev.filter((c) => c.$id !== id && c.id !== id));
  };

  const addLearningGoal = async (data: Omit<LearningGoalRecord, '$id' | 'id' | 'user_id'>) => {
    if (!user) return;
    const currentUserId = user.$id || user.id;
    const newGoal = await appwriteService.createDocument<LearningGoalRecord>(
      COLLECTIONS.LEARNING_GOALS,
      'unique()',
      {
        ...data,
        user_id: currentUserId,
      }
    );

    setLearningGoals((prev) => [newGoal, ...prev]);
    triggerConfetti();
    await awardXpAndLogActivity(10, 'goal_created', `Set New Goal: ${data.title}`, `Target: ${data.target_level}% proficiency`);
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    const isCompleted = progress >= 100;
    const updated = await appwriteService.updateDocument<LearningGoalRecord>(
      COLLECTIONS.LEARNING_GOALS,
      id,
      {
        progress,
        status: isCompleted ? 'Completed' : 'In Progress',
      }
    );

    setLearningGoals((prev) => prev.map((g) => (g.$id === id || g.id === id ? { ...g, ...updated } : g)));

    if (isCompleted) {
      triggerMilestoneConfetti();
      await awardXpAndLogActivity(25, 'goal_completed', `Completed Goal: ${updated.title}`, `Reached target mastery!`);
    }
  };

  const completeGoal = async (id: string) => {
    await updateGoalProgress(id, 100);
  };

  const deleteGoal = async (id: string) => {
    await appwriteService.deleteDocument(COLLECTIONS.LEARNING_GOALS, id);
    setLearningGoals((prev) => prev.filter((g) => g.$id !== id && g.id !== id));
  };

  const acceptRecommendation = async (id: string) => {
    const rec = recommendations.find((r) => r.$id === id || r.id === id);
    if (!rec) return;

    await appwriteService.updateDocument<RecommendationRecord>(COLLECTIONS.RECOMMENDATIONS, id, {
      status: 'accepted',
    });

    setRecommendations((prev) =>
      prev.map((r) => (r.$id === id || r.id === id ? { ...r, status: 'accepted' } : r))
    );

    // If it's a project recommendation, automatically create a planned project in portfolio!
    if (rec.type === 'project') {
      await addProject({
        title: rec.title,
        description: rec.description,
        technologies: rec.related_skill || 'Appwrite, TypeScript, React',
        difficulty: 'Intermediate',
        status: 'Planned',
        github_url: '',
        demo_url: '',
      });
    } else if (rec.type === 'skill') {
      await addLearningGoal({
        skill_id: 'sk_new',
        title: rec.title,
        description: rec.description,
        current_level: 30,
        target_level: 80,
        progress: 10,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'In Progress',
        skill_name: rec.related_skill,
      });
    }
  };

  const dismissRecommendation = async (id: string) => {
    await appwriteService.updateDocument<RecommendationRecord>(COLLECTIONS.RECOMMENDATIONS, id, {
      status: 'dismissed',
    });
    setRecommendations((prev) => prev.filter((r) => r.$id !== id && r.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        skills,
        userSkills,
        projects,
        certifications,
        learningGoals,
        activities,
        recommendations,
        achievements,
        careerScore,
        totalXp,
        level,
        levelTitle,
        xpToNextLevel,
        loading,
        refreshData,
        addUserSkill,
        updateSkillProficiency,
        deleteUserSkill,
        addProject,
        updateProject,
        deleteProject,
        addCertification,
        deleteCertification,
        addLearningGoal,
        updateGoalProgress,
        completeGoal,
        deleteGoal,
        acceptRecommendation,
        dismissRecommendation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
