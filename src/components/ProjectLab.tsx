/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  FolderPlus,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import type { AIProjectRecommendation, DifficultyLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { geminiService } from '../services/gemini';

interface ProjectLabProps {
  onNavigate: (tab: string) => void;
}

export const ProjectLab: React.FC<ProjectLabProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { userSkills, addProject } = useData();

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIProjectRecommendation[]>([]);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());

  // Derive missing / low proficiency skills
  const missingSkills = [...userSkills]
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, 4)
    .map((s) => s.skill_name || 'Core System');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await geminiService.recommendProjects(
        user?.target_role || 'AI Engineer',
        missingSkills.length > 0 ? missingSkills : ['Docker', 'Vector Databases', 'System Design']
      );
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load project recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user?.target_role]);

  const handleSaveToPortfolio = async (project: AIProjectRecommendation) => {
    await addProject({
      title: project.title,
      description: `${project.problemSolves} ${project.whyRecommended}`,
      technologies: project.skillsDeveloped.join(', '),
      difficulty: project.difficulty,
      status: 'Planned',
      github_url: `https://github.com/alexchen/${project.suggestedRepoName || 'portfolio-project'}`,
      demo_url: '',
    });

    setSavedTitles((prev) => new Set(prev).add(project.title));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            AI Project Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Project recommendations custom-engineered to target your specific skill gaps in{' '}
            <span className="font-semibold text-slate-800">{missingSkills.slice(0, 3).join(', ')}</span>.
          </p>
        </div>

        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Generate New Projects</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">Synthesizing Capstone Projects...</h3>
          <p className="text-xs text-slate-500 mt-1">Analyzing your skill matrix and designing architectures via Gemini AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recommendations.map((project, index) => {
            const isSaved = savedTitles.has(project.title);

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {project.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{project.estimatedTime}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{project.title}</h3>
                  </div>

                  {/* Problem Solved */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Problem It Solves
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{project.problemSolves}</p>
                  </div>

                  {/* Why Recommended Callout */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Why Recommended For You
                    </span>
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">"{project.whyRecommended}"</p>
                  </div>

                  {/* Skills Developed */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Skills Developed
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skillsDeveloped.map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Highlights */}
                  {project.architectureHighlights && project.architectureHighlights.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Architecture Highlights
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {project.architectureHighlights.map((arch, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold">·</span>
                            <span>{arch}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  {isSaved ? (
                    <button
                      onClick={() => onNavigate('portfolio')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved to Appwrite Portfolio</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveToPortfolio(project)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Add to My Projects (+20 XP)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
