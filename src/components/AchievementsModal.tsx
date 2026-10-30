/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Trophy,
  Rocket,
  Layers,
  Compass,
  Award,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_ACHIEVEMENTS = [
  {
    name: 'First Project',
    description: 'Created and deployed your first technical portfolio project.',
    icon: Rocket,
    criteria: 'Add 1 portfolio project',
  },
  {
    name: 'Skill Builder',
    description: 'Added and tracked 5+ core technical competencies.',
    icon: Layers,
    criteria: 'Track at least 5 skills in your profile',
  },
  {
    name: 'Roadmap Starter',
    description: 'Generated personalized career milestones and began active learning.',
    icon: Compass,
    criteria: 'Add or complete 1 roadmap goal',
  },
  {
    name: 'Certified',
    description: 'Verified an industry recognized technical certification.',
    icon: Award,
    criteria: 'Log 1 verified certification',
  },
  {
    name: 'Project Master',
    description: 'Completed 3+ real-world portfolio projects.',
    icon: Crown,
    criteria: 'Mark 3 projects as Completed in Appwrite',
  },
  {
    name: 'Career Ready',
    description: 'Surpassed 80/100 on the AI Career Readiness benchmark!',
    icon: CheckCircle2,
    criteria: 'Reach Career Readiness Score >= 80%',
  },
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { achievements, totalXp, level, levelTitle, xpToNextLevel } = useData();

  if (!isOpen) return null;

  const unlockedMap = new Map(achievements.map((a) => [a.name, a]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Gamification & Achievements</h3>
              <p className="text-xs text-slate-500">
                Level {level} {levelTitle} · {totalXp.toLocaleString()} Total XP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-base p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Level Progress Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl text-white">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs font-mono uppercase text-indigo-300">Current Standing</span>
                <h4 className="text-xl font-bold text-white mt-0.5">
                  Level {level} — {levelTitle}
                </h4>
              </div>
              <span className="text-xs font-mono text-indigo-300">{totalXp.toLocaleString()} XP</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((200 - xpToNextLevel) / 200) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5">
              <span>{200 - xpToNextLevel} / 200 XP in current level</span>
              <span>{xpToNextLevel} XP to Level {level + 1}</span>
            </div>
          </div>

          {/* XP Rules Table */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
              How to Earn Career XP
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-600 text-sm block">+10 XP</span>
                <span className="text-slate-600 text-[11px]">Add Skill</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-600 text-sm block">+25 XP</span>
                <span className="text-slate-600 text-[11px]">Complete Goal</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-600 text-sm block">+50 XP</span>
                <span className="text-slate-600 text-[11px]">Finish Project</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-indigo-600 text-sm block">+100 XP</span>
                <span className="text-slate-600 text-[11px]">Add Certificate</span>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Achievement Badges ({unlockedMap.size} / {ALL_ACHIEVEMENTS.length} Unlocked)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_ACHIEVEMENTS.map((item) => {
                const Icon = item.icon;
                const unlocked = unlockedMap.get(item.name);

                return (
                  <div
                    key={item.name}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                      unlocked
                        ? 'bg-white border-indigo-200 shadow-xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        unlocked
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                        {unlocked && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.description}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                        {unlocked ? `Unlocked ${new Date(unlocked.unlocked_at).toLocaleDateString()}` : item.criteria}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
