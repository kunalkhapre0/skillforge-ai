/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, Calendar, Target } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ isOpen, onClose }) => {
  const { userSkills, addLearningGoal } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillName, setSkillName] = useState(userSkills[0]?.skill_name || 'Docker & Containers');
  const [currentLevel, setCurrentLevel] = useState(30);
  const [targetLevel, setTargetLevel] = useState(80);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addLearningGoal({
      skill_id: 'sk_custom_' + Date.now(),
      title: title.trim(),
      description: description.trim() || `Targeting ${targetLevel}% proficiency in ${skillName}`,
      current_level: currentLevel,
      target_level: targetLevel,
      progress: Math.min(100, Math.round((currentLevel / targetLevel) * 100)),
      deadline,
      status: 'In Progress',
      skill_name: skillName,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm">Add Roadmap Learning Goal</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Docker Multi-Stage Containerization"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description / Deliverable
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key learning milestone or artifact produced..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Associated Technical Skill
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Docker, GraphQL, Kubernetes"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Current Level: {currentLevel}%
              </label>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Level: {targetLevel}%
              </label>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Create Goal (+10 XP)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
