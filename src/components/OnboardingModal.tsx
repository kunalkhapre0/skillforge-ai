/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import type { TargetRole, SkillCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_ROLES: TargetRole[] = [
  'AI Engineer',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Data Scientist',
  'Full Stack Developer',
  'Software Engineer',
];

const PRESET_SKILLS_BY_ROLE: Record<TargetRole, { name: string; category: SkillCategory; defaultProficiency: number }[]> = {
  'AI Engineer': [
    { name: 'Python', category: 'Programming', defaultProficiency: 80 },
    { name: 'PyTorch & ML', category: 'AI / ML', defaultProficiency: 65 },
    { name: 'Large Language Models (LLMs)', category: 'AI / ML', defaultProficiency: 60 },
    { name: 'Appwrite TablesDB', category: 'Database', defaultProficiency: 70 },
    { name: 'Docker & Containers', category: 'DevOps', defaultProficiency: 40 },
    { name: 'System Design', category: 'Tools', defaultProficiency: 45 },
  ],
  'Machine Learning Engineer': [
    { name: 'Python', category: 'Programming', defaultProficiency: 85 },
    { name: 'TensorFlow / PyTorch', category: 'AI / ML', defaultProficiency: 70 },
    { name: 'Data Preprocessing & Pandas', category: 'AI / ML', defaultProficiency: 75 },
    { name: 'Model Deployment & MLOps', category: 'DevOps', defaultProficiency: 40 },
    { name: 'SQL & Database Indexing', category: 'Database', defaultProficiency: 60 },
  ],
  'Cloud Engineer': [
    { name: 'Linux / Bash', category: 'DevOps', defaultProficiency: 75 },
    { name: 'Docker & Kubernetes', category: 'DevOps', defaultProficiency: 60 },
    { name: 'AWS / Cloud Architecture', category: 'Cloud', defaultProficiency: 65 },
    { name: 'Terraform & IaC', category: 'Cloud', defaultProficiency: 45 },
    { name: 'Networking & Security', category: 'Tools', defaultProficiency: 55 },
  ],
  'Data Scientist': [
    { name: 'Python', category: 'Programming', defaultProficiency: 85 },
    { name: 'SQL & Data Warehousing', category: 'Database', defaultProficiency: 75 },
    { name: 'Statistical Modeling', category: 'AI / ML', defaultProficiency: 70 },
    { name: 'Data Visualization (Plotly)', category: 'Tools', defaultProficiency: 80 },
    { name: 'Machine Learning Algorithms', category: 'AI / ML', defaultProficiency: 65 },
  ],
  'Full Stack Developer': [
    { name: 'TypeScript & JavaScript', category: 'Programming', defaultProficiency: 80 },
    { name: 'React 19 & Tailwind', category: 'Web Development', defaultProficiency: 85 },
    { name: 'Node.js & Express', category: 'Web Development', defaultProficiency: 75 },
    { name: 'Appwrite TablesDB / PostgreSQL', category: 'Database', defaultProficiency: 70 },
    { name: 'REST APIs & GraphQL', category: 'Web Development', defaultProficiency: 75 },
    { name: 'Docker', category: 'DevOps', defaultProficiency: 40 },
  ],
  'Software Engineer': [
    { name: 'Data Structures & Algorithms', category: 'Programming', defaultProficiency: 80 },
    { name: 'Java / C++ / Python', category: 'Programming', defaultProficiency: 80 },
    { name: 'Relational Databases & SQL', category: 'Database', defaultProficiency: 70 },
    { name: 'System Design', category: 'Tools', defaultProficiency: 50 },
    { name: 'Git & CI/CD', category: 'DevOps', defaultProficiency: 70 },
  ],
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, completeOnboarding } = useAuth();
  const { addUserSkill, addLearningGoal } = useData();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState('Stanford University');
  const [graduationYear, setGraduationYear] = useState(2026);
  const [education, setEducation] = useState('B.S. in Computer Science');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [targetRole, setTargetRole] = useState<TargetRole>('AI Engineer');

  // Selected skills with sliders
  const [skillsList, setSkillsList] = useState(PRESET_SKILLS_BY_ROLE['AI Engineer']);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: TargetRole) => {
    setTargetRole(newRole);
    setSkillsList(PRESET_SKILLS_BY_ROLE[newRole] || PRESET_SKILLS_BY_ROLE['AI Engineer']);
  };

  const handleSkillProficiencyChange = (index: number, val: number) => {
    const updated = [...skillsList];
    updated[index].defaultProficiency = val;
    setSkillsList(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding({
        name: name || 'Student Developer',
        university,
        graduation_year: graduationYear,
        education,
        target_role: targetRole,
        initialSkills: skillsList.map((s) => ({
          name: s.name,
          category: s.category,
          proficiency: s.defaultProficiency,
        })),
      });

      // Save each skill to Appwrite TablesDB
      for (const s of skillsList) {
        await addUserSkill(s.name, s.category, s.defaultProficiency);
      }

      // Automatically create an initial learning goal in Appwrite TablesDB
      const weakestSkill = [...skillsList].sort((a, b) => a.defaultProficiency - b.defaultProficiency)[0];
      if (weakestSkill) {
        await addLearningGoal({
          skill_id: 'sk_init',
          title: `Master ${weakestSkill.name} for ${targetRole}`,
          description: `Close the proficiency gap in ${weakestSkill.name} from ${weakestSkill.defaultProficiency}% to 80% to achieve role readiness.`,
          current_level: weakestSkill.defaultProficiency,
          target_level: 80,
          progress: 15,
          deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'In Progress',
          skill_name: weakestSkill.name,
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Career Profile Onboarding</h3>
              <p className="text-xs text-slate-500">Step {step} of 3</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-7 h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-indigo-600' : s < step ? 'bg-indigo-300' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Education & Identity */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  University / College
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Graduation Year
                </label>
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Degree / Major
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.S. in Computer Science"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Current Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      experienceLevel === lvl
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Target Career Role */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Select Your Target Role
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                SkillForge AI will benchmark your profile against industry standards for this position.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {TARGET_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    targetRole === role
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className={`w-4 h-4 ${targetRole === role ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold text-slate-900">{role}</span>
                  </div>
                  {targetRole === role && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Technical Skills & Proficiency Sliders */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Set Your Initial Skill Proficiencies
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust the sliders based on your current comfort level with {targetRole} requirements.
              </p>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {skillsList.map((skill, index) => (
                <div key={skill.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{skill.name}</span>
                    <span className="font-mono text-indigo-600 font-bold">{skill.defaultProficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={skill.defaultProficiency}
                    onChange={(e) => handleSkillProficiencyChange(index, parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>{skill.category}</span>
                    <span>
                      {skill.defaultProficiency < 50
                        ? 'Learning'
                        : skill.defaultProficiency < 75
                        ? 'Proficient'
                        : 'Advanced'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <span>Generating Roadmap in Appwrite...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Finish & Calculate Readiness</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
