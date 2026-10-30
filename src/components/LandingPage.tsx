/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  FolderGit2,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onExploreDemo: () => void;
  openAppwriteInspector: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onExploreDemo,
  openAppwriteInspector,
}) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hackathon Badge Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Built for Appwrite Databases Hackathon 2026</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span>Appwrite TablesDB Architecture</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Turn Your Skills Into Your Career Roadmap.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              SkillForge AI analyzes your skills, projects and goals to create a personalized path toward your dream tech career. Powered by Appwrite TablesDB and intelligent AI analysis.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartOnboarding}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <span>Build My Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <span>Explore Demo</span>
                <span className="text-xs text-slate-500 font-normal">(Alex Chen, Stanford '26)</span>
              </button>

              <button
                onClick={openAppwriteInspector}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>View Appwrite Schema</span>
              </button>
            </div>
          </div>

          {/* Quick Dashboard Snapshot preview */}
          <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-900 p-2 sm:p-3 shadow-xl">
            <div className="rounded-xl bg-slate-950 p-4 sm:p-6 text-white border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-300">Live Hackathon Showcase Preview</span>
                    <span className="text-xs text-emerald-400 font-mono">Appwrite TablesDB · 9 Collections Active</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">AI Engineer Career Readiness Dashboard</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Readiness Score</span>
                    <span className="text-3xl font-extrabold text-emerald-400">82/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Identified Skill Gaps</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Docker & Containers</span>
                      <span className="text-red-400 font-mono">35% / 80%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[35%]" />
                    </div>

                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-300">Appwrite TablesDB & SQL</span>
                      <span className="text-amber-400 font-mono">48% / 85%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[48%]" />
                    </div>

                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-300">Distributed System Design</span>
                      <span className="text-amber-400 font-mono">42% / 80%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[42%]" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Milestone Goals</span>
                  <div className="mt-3 space-y-2.5">
                    <div className="text-xs">
                      <p className="font-medium text-slate-200">Containerize Microservices with Compose</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                        <span>Due Nov 15</span>
                        <span className="text-indigo-400">60% complete</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-slate-200">Relational Indexes & Query Optimization</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                        <span>Due Nov 20</span>
                        <span className="text-indigo-400">85% complete</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gamification & XP</span>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">Level 7 Explorer</span>
                      <span className="text-xs font-mono text-indigo-400">1,420 Total XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div className="bg-indigo-500 h-full w-[70%]" />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">180 XP to Level 8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Problem & 2. Solution Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Problem */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-2">The Real Problem</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Generic roadmaps leave students guessing what top tech teams actually require.
            </h2>
            <ul className="mt-6 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Students learn random online tutorials without knowing which specific skills they are actually missing for their target role.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>Portfolios end up with clone projects that recruiters ignore instead of production-ready architectures.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 font-bold">✕</span>
                <span>No unified system to connect daily learning, projects, certifications, and career readiness scores.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-white p-8 rounded-2xl border border-indigo-100 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-2">The SkillForge Solution</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              An intelligent career engine powered by Appwrite TablesDB & AI analysis.
            </h2>
            <ul className="mt-6 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Precise skill gap diagnostics benchmarked against industry role archetypes (AI, Cloud, Full Stack, ML).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Project Lab recommends capstone projects explicitly designed to close your individual weakest competencies.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Full relational persistence across 9 Appwrite TablesDB collections with real-time gamification XP and verified credentials.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The 4-Step Journey</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">How SkillForge AI Works</h2>
            <p className="text-sm text-slate-600 mt-2">
              From onboarding to your final career readiness score, every step is persisted in Appwrite TablesDB.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                step: '01',
                title: 'Build Profile & Skills',
                desc: 'Select your target role and record your current technical skills with initial proficiencies.',
                icon: Layers,
              },
              {
                step: '02',
                title: 'AI Gap Analysis',
                desc: 'Gemini AI evaluates your skills, projects, and certifications to highlight critical gaps and readiness score.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Milestone Roadmap',
                desc: 'Receive a structured 4-phase learning roadmap with concrete deliverables and deadlines.',
                icon: Compass,
              },
              {
                step: '04',
                title: 'Project Lab & XP',
                desc: 'Build recommended projects that bridge your gaps, earn XP, unlock badges, and achieve job readiness.',
                icon: Trophy,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="p-6 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-indigo-600">{s.step}</span>
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Appwrite Technology Architecture Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-md text-xs font-mono mb-3">
                <Database className="w-3.5 h-3.5" />
                <span>Appwrite TablesDB Architecture</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Engineered for the Appwrite Databases Hackathon
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
                Appwrite TablesDB is the primary, persistent database engine powering every user interaction, query, and relational data structure.
              </p>
            </div>

            <button
              onClick={openAppwriteInspector}
              className="px-4 py-2.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
            >
              Open Schema & Query Inspector
            </button>
          </div>

          {/* Architecture Pipeline Visualizer */}
          <div className="pt-8">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-4">
              Data Pipeline & Relational Flow
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Student User', desc: 'Secure Session' },
                { label: 'Appwrite Auth', desc: 'account.createSession' },
                { label: 'SkillForge AI', desc: 'React 19 + Express' },
                { label: 'Appwrite TablesDB', desc: '9 Normalized Collections' },
                { label: 'Relational Queries', desc: 'Query.equal / orderDesc' },
                { label: 'Gemini 3.8 Flash', desc: 'Server-Side Analysis' },
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-mono font-bold mx-auto flex items-center justify-center mb-1.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-white">{step.label}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Collections Schema Grid */}
            <div className="mt-8 pt-8 border-t border-slate-800/80">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-4">
                Appwrite TablesDB Collections
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { name: 'users', count: '12 attributes' },
                  { name: 'skills', count: '4 attributes' },
                  { name: 'user_skills', count: '6 attributes' },
                  { name: 'projects', count: '9 attributes' },
                  { name: 'certifications', count: '6 attributes' },
                  { name: 'learning_goals', count: '9 attributes' },
                  { name: 'activities', count: '6 attributes' },
                  { name: 'recommendations', count: '7 attributes' },
                  { name: 'achievements', count: '5 attributes' },
                  { name: 'indexes & rules', count: 'Relational scoping' },
                ].map((col) => (
                  <div key={col.name} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-left">
                    <p className="font-mono text-xs font-semibold text-emerald-400 truncate">{col.name}</p>
                    <p className="text-[10px] text-slate-400">{col.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="py-16 text-center border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Forge Your Tech Career Roadmap?
          </h2>
          <p className="text-sm text-slate-600 mt-3 max-w-xl mx-auto">
            Take the guesswork out of job preparation. Identify your skill gaps, build high-impact projects, and track your progress to career readiness.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartOnboarding}
              className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Start Free Onboarding
            </button>
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              Open Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">SkillForge AI</span>
            <span>— Solo Hackathon Submission for Appwrite Databases Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={openAppwriteInspector} className="hover:text-slate-800">Appwrite Inspector</button>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span>Built with Appwrite TablesDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
