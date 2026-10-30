/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Briefcase,
  Target,
  DollarSign,
  Building,
  Calendar,
} from 'lucide-react';
import type { TargetRole, AICareerAnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';

const TARGET_ROLES: TargetRole[] = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Software Engineer',
];

interface AICareerAnalysisProps {
  onNavigate: (tab: string) => void;
}

export const AICareerAnalysis: React.FC<AICareerAnalysisProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { userSkills, projects, certifications, learningGoals, addLearningGoal } = useData();

  const [selectedRole, setSelectedRole] = useState<TargetRole>(user?.target_role || 'AI Engineer');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AICareerAnalysisResult | null>(null);

  const runAnalysis = async (role: TargetRole = selectedRole) => {
    setLoading(true);
    try {
      const result = await geminiService.analyzeCareer(
        user,
        userSkills,
        projects,
        certifications,
        role
      );
      setAnalysis(result);

      // If user changed role, update user target_role in Appwrite TablesDB
      if (user && user.target_role !== role) {
        await updateUser({ target_role: role, career_score: result.overallReadiness });
      }
    } catch (err) {
      console.error('Failed to run AI career analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(selectedRole);
  }, [selectedRole]);

  const handleRoleSelect = (role: TargetRole) => {
    setSelectedRole(role);
  };

  const handleCreateGoalFromGap = async (gap: { skill: string; targetProficiency: number; currentProficiency: number }) => {
    await addLearningGoal({
      skill_id: 'sk_gap_' + Date.now(),
      title: `Close Gap in ${gap.skill}`,
      description: `Targeting ${gap.targetProficiency}% proficiency for ${selectedRole} readiness.`,
      current_level: gap.currentProficiency,
      target_level: gap.targetProficiency,
      progress: Math.round((gap.currentProficiency / gap.targetProficiency) * 100),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      skill_name: gap.skill,
    });
    onNavigate('roadmap');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Target Role Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini 3.8 Flash Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            AI Career Gap Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Deep benchmark analyzing your Appwrite TablesDB portfolio, skills proficiency, and certifications against hiring criteria.
          </p>
        </div>

        {/* Role Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {TARGET_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === role
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">Evaluating Profile for {selectedRole}...</h3>
          <p className="text-xs text-slate-500 mt-1">Cross-referencing skills, completed projects, and market criteria via Gemini AI.</p>
        </div>
      ) : analysis ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Score Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                  {analysis.overallReadiness}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedRole} Benchmark
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Role Match: High
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {analysis.readinessExplanation}
                </p>
              </div>
            </div>

            <button
              onClick={() => runAnalysis(selectedRole)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run Analysis</span>
            </button>
          </div>

          {/* Strengths & Market Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Key Strengths Identified</h3>
              </div>
              <ul className="space-y-3">
                {analysis.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2026 Market Insights */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">2026 Industry Hiring Insights</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-mono">Market Demand</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{analysis.marketInsights.roleDemand}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block uppercase font-mono">Avg Salary Band</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">{analysis.marketInsights.avgSalaryRange}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <span className="text-[11px] text-slate-400 block uppercase font-mono mb-1">Top Tech Employers</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.marketInsights.topHiringCompanies.map((c) => (
                    <span key={c} className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                "{analysis.marketInsights.keyTrends}"
              </p>
            </div>
          </div>

          {/* Identified Skill Gaps Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Priority Skill Gaps</h3>
                <p className="text-xs text-slate-500">Ranked by impact on {selectedRole} readiness</p>
              </div>
              <button
                onClick={() => onNavigate('project-lab')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Find Projects for Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.skillGaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            gap.priority === 'High'
                              ? 'bg-red-100 text-red-700'
                              : gap.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {gap.priority} Priority
                        </span>
                        <span className="text-xs font-bold text-slate-900">{gap.skill}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {gap.currentProficiency}% → {gap.targetProficiency}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{gap.reason}</p>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="bg-indigo-600 h-full" style={{ width: `${gap.currentProficiency}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 text-xs">
                    <span className="text-[11px] text-slate-500">~{gap.estimatedWeeks} weeks to bridge</span>
                    <button
                      onClick={() => handleCreateGoalFromGap(gap)}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      <span>Add Goal to Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Tactical Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Recommended Action Plan</h3>
            <p className="text-xs text-slate-500 mb-4">Concrete tactical actions to improve your score</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysis.recommendedActions.map((action, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">{action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
