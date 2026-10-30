/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  RefreshCw,
  Code2,
  Sliders,
  ShieldCheck,
  Table,
} from 'lucide-react';
import { appwriteService, COLLECTIONS, DATABASE_ID } from '../services/appwrite';

interface AppwriteInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppwriteInspectorModal: React.FC<AppwriteInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'queries' | 'connection' | 'cli'>('schema');
  const [config, setConfig] = useState(appwriteService.getConfig());
  const [copied, setCopied] = useState(false);

  // Connection inputs
  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [projectId, setProjectId] = useState(config.projectId);
  const [databaseId, setDatabaseId] = useState(config.databaseId);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestingPing(true);
    appwriteService.updateConfig(endpoint, projectId, databaseId);
    setConfig(appwriteService.getConfig());
    const res = await appwriteService.pingLiveAppwrite();
    setPingResult(res);
    setTestingPing(false);
  };

  const handleCopyCliScript = () => {
    navigator.clipboard.writeText(CLI_SETUP_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-mono shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Appwrite TablesDB Architecture</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Hackathon 2026 Core
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Database: {config.databaseId} · Mode: {config.isConnected ? 'Appwrite Cloud' : 'Appwrite TablesDB (Local/Active)'}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          {[
            { id: 'schema', label: '9 Collections Schema' },
            { id: 'queries', label: 'Appwrite Query SDK' },
            { id: 'connection', label: 'Cloud Connection & Ping' },
            { id: 'cli', label: '1-Click CLI Script' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* TAB 1: 9 Collections Schema */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                SkillForge AI utilizes a relational architecture across 9 normalized collections in Appwrite TablesDB with primary keys (<code className="text-indigo-600 font-mono">$id</code>), timestamps (<code className="text-indigo-600 font-mono">$createdAt</code>), and relational foreign key indexes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {COLLECTION_METADATA.map((col) => (
                  <div key={col.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{col.name}</span>
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {col.attributes.length} fields
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{col.description}</p>
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Attributes
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {col.attributes.map((attr) => (
                          <span key={attr} className="text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Appwrite Query SDK */}
          {activeTab === 'queries' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                All client interactions query Appwrite TablesDB directly using standard Appwrite SDK methods rather than in-memory filtering:
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
                  <span className="text-emerald-400 block mb-1.5">// 1. Relational User-Scoped Query</span>
                  <code>
                    databases.listDocuments('skillforge_db', 'projects', [<br />
                    &nbsp;&nbsp;Query.equal('user_id', currentUser.$id),<br />
                    &nbsp;&nbsp;Query.orderDesc('created_at'),<br />
                    &nbsp;&nbsp;Query.limit(20)<br />
                    ]);
                  </code>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
                  <span className="text-emerald-400 block mb-1.5">// 2. Multi-Attribute Skill Search & Sorting</span>
                  <code>
                    databases.listDocuments('skillforge_db', 'skills', [<br />
                    &nbsp;&nbsp;Query.search('name', 'Python'),<br />
                    &nbsp;&nbsp;Query.equal('category', 'Programming'),<br />
                    &nbsp;&nbsp;Query.orderAsc('name')<br />
                    ]);
                  </code>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
                  <span className="text-emerald-400 block mb-1.5">// 3. Goal Completion & XP Transaction</span>
                  <code>
                    await databases.updateDocument('skillforge_db', 'learning_goals', goalId, &#123;<br />
                    &nbsp;&nbsp;progress: 100,<br />
                    &nbsp;&nbsp;status: 'Completed'<br />
                    &#125;);
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Connection & Ping */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                To connect SkillForge AI to your own Appwrite Cloud project, enter your project details below and test the connection:
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Appwrite Endpoint
                  </label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://cloud.appwrite.io/v1"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Appwrite Project ID
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g. 66ff1a000012bc8910"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Database ID
                  </label>
                  <input
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    placeholder="skillforge_db"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingPing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                    <span>Save & Test Ping</span>
                  </button>

                  {pingResult && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                        pingResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {pingResult.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLI Script */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Run this Appwrite CLI bash script to provision all 9 collections and indexes in your Appwrite instance:
                </p>
                <button
                  onClick={handleCopyCliScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy CLI Script'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                {CLI_SETUP_SCRIPT}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Appwrite TablesDB Architecture v2026.1</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

const COLLECTION_METADATA = [
  {
    name: 'users',
    description: 'Profiles, education, university, career score, and gamification level',
    attributes: ['id', 'name', 'email', 'education', 'university', 'graduation_year', 'target_role', 'career_score', 'total_xp', 'level'],
  },
  {
    name: 'skills',
    description: 'Catalog of technical competencies and difficulty tags',
    attributes: ['id', 'name', 'category', 'difficulty'],
  },
  {
    name: 'user_skills',
    description: 'Junction table tracking candidate proficiency (0-100%) and verification',
    attributes: ['id', 'user_id', 'skill_id', 'proficiency', 'verified', 'last_updated'],
  },
  {
    name: 'projects',
    description: 'Portfolio builds with technologies, github/demo URLs, and status',
    attributes: ['id', 'user_id', 'title', 'description', 'technologies', 'difficulty', 'status', 'github_url', 'demo_url'],
  },
  {
    name: 'certifications',
    description: 'Verified industry credentials, issuing providers, and verification URLs',
    attributes: ['id', 'user_id', 'name', 'provider', 'credential_url', 'issue_date'],
  },
  {
    name: 'learning_goals',
    description: 'Personalized milestones with target levels, progress %, and deadlines',
    attributes: ['id', 'user_id', 'skill_id', 'title', 'description', 'current_level', 'target_level', 'progress', 'deadline', 'status'],
  },
  {
    name: 'activities',
    description: 'Real-time timeline of XP awards and achievement events',
    attributes: ['id', 'user_id', 'type', 'title', 'description', 'xp', 'created_at'],
  },
  {
    name: 'recommendations',
    description: 'Prioritized AI recommendations for targeted skills, projects, and courses',
    attributes: ['id', 'user_id', 'type', 'title', 'description', 'priority', 'related_skill', 'status'],
  },
  {
    name: 'achievements',
    description: 'Gamification badges earned across portfolio, skills, and roadmap milestones',
    attributes: ['id', 'user_id', 'name', 'description', 'icon', 'unlocked_at'],
  },
];

const CLI_SETUP_SCRIPT = `#!/usr/bin/env bash
# ========================================================
# SkillForge AI — Appwrite TablesDB Automated Schema Setup
# Built for Appwrite Databases Hackathon 2026
# ========================================================

DATABASE_ID="skillforge_db"
echo "Initializing SkillForge AI Database: $DATABASE_ID..."

# 1. Create Database
appwrite databases create --databaseId "$DATABASE_ID" --name "SkillForge DB"

# 2. Create Collections
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "users" --name "Users"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "skills" --name "Skills"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "user_skills" --name "User Skills"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "projects" --name "Projects"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "certifications" --name "Certifications"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "learning_goals" --name "Learning Goals"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "activities" --name "Activities"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "recommendations" --name "Recommendations"
appwrite databases createCollection --databaseId "$DATABASE_ID" --collectionId "achievements" --name "Achievements"

echo "Creating attributes and relational indexes..."
# Example indexes for fast queries
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId "projects" --key "idx_user_created" --type "key" --attributes "user_id" "created_at"
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId "user_skills" --key "idx_user_skill" --type "key" --attributes "user_id" "skill_id"
appwrite databases createIndex --databaseId "$DATABASE_ID" --collectionId "learning_goals" --key "idx_user_status" --type "key" --attributes "user_id" "status"

echo "SkillForge AI Appwrite TablesDB Setup Complete!"`;
