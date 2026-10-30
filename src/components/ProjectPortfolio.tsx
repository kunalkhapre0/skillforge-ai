/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Github,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  Code2,
} from 'lucide-react';
import type { ProjectRecord, DifficultyLevel, ProjectStatus } from '../types';
import { useData } from '../context/DataContext';

export const ProjectPortfolio: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useData();

  const [filterDifficulty, setFilterDifficulty] = useState<'All' | DifficultyLevel>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | ProjectStatus>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'title'>('newest');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setTechnologies('React, TypeScript, Appwrite');
    setDifficulty('Intermediate');
    setStatus('In Progress');
    setGithubUrl('https://github.com/username/project');
    setDemoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: ProjectRecord) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setTechnologies(proj.technologies);
    setDifficulty(proj.difficulty);
    setStatus(proj.status);
    setGithubUrl(proj.github_url || '');
    setDemoUrl(proj.demo_url || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingProject) {
      await updateProject(editingProject.$id || editingProject.id, {
        title,
        description,
        technologies,
        difficulty,
        status,
        github_url: githubUrl,
        demo_url: demoUrl,
      });
    } else {
      await addProject({
        title,
        description,
        technologies,
        difficulty,
        status,
        github_url: githubUrl,
        demo_url: demoUrl,
      });
    }

    setIsModalOpen(false);
  };

  // Filter & Sort
  const filtered = projects.filter((p) => {
    if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.created_at || '').localeCompare(a.created_at || '');
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Project Portfolio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and showcase your real-world builds · Stored in Appwrite TablesDB.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project (+20 XP)</span>
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Planned', 'In Progress', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="title">Project Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <FolderGit2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No projects found in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your portfolio projects or import them from the AI Project Lab.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Add Project Now
            </button>
          </div>
        ) : (
          sorted.map((proj) => {
            const isCompleted = proj.status === 'Completed';

            return (
              <div
                key={proj.$id || proj.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : proj.status === 'In Progress'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {proj.status}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium">{proj.difficulty}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{proj.description}</p>

                  {/* Tech stack */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Technologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.split(',').map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Links & Actions */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-50"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProject(proj.$id || proj.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProject ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Event Stream Engine"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Impact
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the project solves and key architectural decisions..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Technologies (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Appwrite TablesDB, TypeScript, Docker, Redis"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed (+50 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  {editingProject ? 'Save Changes' : 'Save Project to Appwrite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
