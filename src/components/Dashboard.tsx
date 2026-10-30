/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FolderGit2,
  Award,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  openNewGoalModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, openNewGoalModal }) => {
  const { user } = useAuth();
  const {
    userSkills,
    projects,
    certifications,
    learningGoals,
    activities,
    recommendations,
    careerScore,
    totalXp,
    level,
    levelTitle,
    xpToNextLevel,
    completeGoal,
    acceptRecommendation,
    dismissRecommendation,
  } = useData();

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Dimensional breakdown of the Career Readiness Score
  const avgSkillProf =
    userSkills.length > 0
      ? Math.round(userSkills.reduce((acc, s) => acc + s.proficiency, 0) / userSkills.length)
      : 50;
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length;
  const completedGoalsCount = learningGoals.filter((g) => g.status === 'Completed').length;

  const skillScorePts = Math.round((avgSkillProf / 100) * 40);
  const projectScorePts = Math.min(30, completedProjectsCount * 12 + (projects.length - completedProjectsCount) * 4);
  const certScorePts = Math.min(15, Math.round(certifications.length * 7.5));
  const goalScorePts = Math.min(15, completedGoalsCount * 5 + learningGoals.length * 2);

  // Skill gaps: find lowest 3 proficiency skills
  const sortedByLowest = [...userSkills].sort((a, b) => a.proficiency - b.proficiency);
  const topGaps = sortedByLowest.slice(0, 3);

  // Active goals (in progress or not started)
  const activeGoals = learningGoals.filter((g) => g.status !== 'Completed').slice(0, 3);

  // Pending recommendations
  const activeRecs = recommendations.filter((r) => r.status === 'pending').slice(0, 4);

  // SVG circular score parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (careerScore / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting & Role Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            {getGreeting()}, {user?.name || 'Developer'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's your career progress today · Target Role:{' '}
            <span className="font-semibold text-indigo-600">{user?.target_role || 'AI Engineer'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('career-analysis')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Career Analysis</span>
          </button>
          <button
            onClick={() => onNavigate('roadmap')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>View Roadmap</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Row: Career Readiness Score & XP Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Readiness Score Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center gap-8">
          {/* Circular Score Gauge */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="text-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{careerScore}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          {/* Dimensional Explanation */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Career Readiness Score</h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {careerScore >= 80 ? 'Competitive Candidate' : 'In Acceleration'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Objective benchmark derived from your 9 Appwrite TablesDB collections against 2026 industry requirements.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Skills (40%)</span>
                <span className="text-sm font-bold text-slate-900">{skillScorePts} / 40</span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${(skillScorePts / 40) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Projects (30%)</span>
                <span className="text-sm font-bold text-slate-900">{projectScorePts} / 30</span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${(projectScorePts / 30) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Certs (15%)</span>
                <span className="text-sm font-bold text-slate-900">{certScorePts} / 15</span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${(certScorePts / 15) * 100}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Goals (15%)</span>
                <span className="text-sm font-bold text-slate-900">{goalScorePts} / 15</span>
                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${(goalScorePts / 15) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* XP / Level Gamification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Gamification</span>
              <span className="text-xs font-semibold text-indigo-600">{levelTitle}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">Level {level}</span>
              <span className="text-xs font-mono text-slate-500">· {totalXp.toLocaleString()} Total XP</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Earn XP by completing roadmap goals (+25), finishing projects (+50), and adding certifications (+100).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Next Level Progress</span>
              <span className="font-mono text-indigo-600">{xpToNextLevel} XP to Level {level + 1}</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((200 - xpToNextLevel) / 200) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Top Skill Gaps & Active Learning Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skill Gaps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Skill Gaps</h2>
              <p className="text-xs text-slate-500">Highest leverage competencies to close next</p>
            </div>
            <button
              onClick={() => onNavigate('skills')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>All Skills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {topGaps.map((skill) => (
              <div key={skill.$id || skill.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{skill.skill_name}</span>
                    <span className="text-[11px] text-slate-500">· {skill.skill_category}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600">{skill.proficiency}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      skill.proficiency < 40 ? 'bg-red-500' : skill.proficiency < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Target Benchmark: 80%</span>
                  <button
                    onClick={() => onNavigate('project-lab')}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Find Practice Project →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Learning Goals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Learning Goals</h2>
              <p className="text-xs text-slate-500">Active milestones toward {user?.target_role}</p>
            </div>
            <button
              onClick={openNewGoalModal}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">All current goals completed!</p>
              <p className="text-[11px] text-slate-500 mt-1">Explore your roadmap to add new targets.</p>
              <button
                onClick={() => onNavigate('roadmap')}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700"
              >
                Go to Roadmap
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeGoals.map((goal) => (
                <div key={goal.$id || goal.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{goal.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{goal.description}</p>
                    </div>
                    <button
                      onClick={() => completeGoal(goal.$id || goal.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 rounded-md transition-colors shrink-0"
                    >
                      Complete (+25 XP)
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="font-mono font-bold text-indigo-600">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Due {goal.deadline}</span>
                    </span>
                    <span className="font-medium text-slate-600">{goal.skill_name || 'Technical Milestone'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Steps & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Next Steps (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recommended Next Steps</h2>
              <p className="text-xs text-slate-500">Prioritized tactical recommendations for this week</p>
            </div>
            <button
              onClick={() => onNavigate('project-lab')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Project Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeRecs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending recommendations.</p>
            ) : (
              activeRecs.map((rec) => (
                <div
                  key={rec.$id || rec.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === 'High'
                            ? 'text-red-600'
                            : rec.priority === 'Medium'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                    <span className="text-[11px] text-slate-400 block">Related: {rec.related_skill}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => acceptRecommendation(rec.$id || rec.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                    >
                      Accept Action
                    </button>
                    <button
                      onClick={() => dismissRecommendation(rec.$id || rec.id)}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Recent Activity</h2>
          <p className="text-xs text-slate-500 mb-4">Latest XP events in Appwrite TablesDB</p>

          <div className="space-y-3.5">
            {activities.slice(0, 5).map((act) => (
              <div key={act.$id || act.id} className="flex items-start gap-3 text-xs">
                <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                    {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600 text-xs shrink-0">+{act.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
