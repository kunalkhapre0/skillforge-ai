/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Filter,
  ArrowUpDown,
  Calendar,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LearningGoalRecord, GoalStatus, DifficultyLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface RoadmapViewProps {
  onOpenNewGoalModal: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ onOpenNewGoalModal }) => {
  const { user } = useAuth();
  const { learningGoals, updateGoalProgress, completeGoal, deleteGoal } = useData();

  const [filterStatus, setFilterStatus] = useState<'All' | GoalStatus>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'title'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter goals
  const filteredGoals = learningGoals.filter((g) => {
    if (filterStatus === 'All') return true;
    return g.status === filterStatus;
  });

  // Sort goals
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'deadline') {
      comparison = (a.deadline || '').localeCompare(b.deadline || '');
    } else if (sortBy === 'progress') {
      comparison = a.progress - b.progress;
    } else {
      comparison = a.title.localeCompare(b.title);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate phase milestones
  const phases = [
    {
      number: 1,
      title: 'Foundations & Database Modeling',
      subtitle: 'Appwrite TablesDB, relational normalization, and algorithmic fundamentals',
      estimated: 'Weeks 1-4',
    },
    {
      number: 2,
      title: 'Backend Engineering & APIs',
      subtitle: 'REST architectures, authentication security, and containerization',
      estimated: 'Weeks 5-8',
    },
    {
      number: 3,
      title: 'Cloud Infrastructure & CI/CD',
      subtitle: 'Automated deployment pipelines, distributed caching, and microservices',
      estimated: 'Weeks 9-12',
    },
    {
      number: 4,
      title: 'Capstone Mastery & Portfolio Launch',
      subtitle: 'Full-scale capstone projects, architecture design, and career readiness',
      estimated: 'Weeks 13-16',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured roadmap for <span className="font-semibold text-indigo-600">{user?.target_role}</span> · All progress is saved in Appwrite TablesDB.
          </p>
        </div>

        <button
          onClick={onOpenNewGoalModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Goal</span>
        </button>
      </div>

      {/* 4 Roadmap Phases Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {phases.map((phase) => (
          <div key={phase.number} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-indigo-600">PHASE {phase.number}</span>
              <span className="text-slate-400">{phase.estimated}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">{phase.title}</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{phase.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Filter and Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Filter Tabs (Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['All', 'In Progress', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'All' ? `(${learningGoals.length})` : ''}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="deadline">Deadline</option>
            <option value="progress">Progress %</option>
            <option value="title">Goal Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {sortedGoals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Compass className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No learning goals found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add custom goals or generate them from the AI Career Analysis page.
            </p>
            <button
              onClick={onOpenNewGoalModal}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          sortedGoals.map((goal) => {
            const isCompleted = goal.status === 'Completed';

            return (
              <div
                key={goal.$id || goal.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {goal.status}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-semibold text-slate-600">{goal.skill_name || 'Competency'}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{goal.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{goal.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted ? (
                      <button
                        onClick={() => completeGoal(goal.$id || goal.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Complete (+25 XP)</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed (+25 XP)</span>
                      </div>
                    )}

                    <button
                      onClick={() => deleteGoal(goal.$id || goal.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar and slider */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Goal Completion Progress</span>
                    <span className="font-mono font-bold text-indigo-600">{goal.progress}%</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goal.progress}
                    disabled={isCompleted}
                    onChange={(e) => updateGoalProgress(goal.$id || goal.id, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-60"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>Target Deadline: {goal.deadline || 'No deadline'}</span>
                    </span>
                    <span>Target: {goal.target_level}% proficiency</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
