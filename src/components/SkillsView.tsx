/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  Sliders,
  Filter,
} from 'lucide-react';
import type { SkillCategory, DifficultyLevel, UserSkillRecord } from '../types';
import { useData } from '../context/DataContext';

const CATEGORIES: ('All' | SkillCategory)[] = [
  'All',
  'Programming',
  'AI / ML',
  'Cloud',
  'Database',
  'DevOps',
  'Web Development',
  'Tools',
];

export const SkillsView: React.FC = () => {
  const { userSkills, addUserSkill, updateSkillProficiency, deleteUserSkill } = useData();

  const [activeCategory, setActiveCategory] = useState<'All' | SkillCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Programming');
  const [newSkillProficiency, setNewSkillProficiency] = useState(70);
  const [newSkillDifficulty, setNewSkillDifficulty] = useState<DifficultyLevel>('Intermediate');

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    await addUserSkill(
      newSkillName.trim(),
      newSkillCategory,
      newSkillProficiency,
      newSkillDifficulty
    );

    setNewSkillName('');
    setIsModalOpen(false);
  };

  // Filter skills
  const filteredSkills = userSkills.filter((s) => {
    const matchesCategory = activeCategory === 'All' || s.skill_category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      (s.skill_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.skill_category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Technical Skill Matrix
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track competency levels across 7 technical categories · Stored in Appwrite TablesDB.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Skill (+10 XP)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills (e.g. Python, Docker, SQL)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No skills found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add new skills to your profile or try adjusting your search filters.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              Add Skill (+10 XP)
            </button>
          </div>
        ) : (
          filteredSkills.map((skill) => {
            const isVerified = skill.proficiency >= 75;

            return (
              <div
                key={skill.$id || skill.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {skill.skill_category}
                      </span>
                      {isVerified && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{skill.skill_name}</h3>
                  </div>

                  <button
                    onClick={() => deleteUserSkill(skill.$id || skill.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Proficiency Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Proficiency</span>
                    <span className="font-mono font-bold text-indigo-600">{skill.proficiency}%</span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={skill.proficiency}
                    onChange={(e) =>
                      updateSkillProficiency(skill.$id || skill.id, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Status:{' '}
                    {skill.proficiency < 50
                      ? 'Developing'
                      : skill.proficiency < 75
                      ? 'Intermediate'
                      : 'Production Ready'}
                  </span>
                  <span className="font-mono">
                    Updated {new Date(skill.last_updated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add New Technical Skill</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Skill Name
                </label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. GraphQL, Kubernetes, Rust"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  <span>Proficiency Level</span>
                  <span className="font-mono text-indigo-600">{newSkillProficiency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
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
                  Save Skill (+10 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
