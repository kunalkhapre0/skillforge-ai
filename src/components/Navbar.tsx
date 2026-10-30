/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  FolderGit2,
  Award,
  BarChart3,
  Database,
  Trophy,
  ChevronDown,
  LogOut,
  User,
  FlaskConical,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { appwriteService } from '../services/appwrite';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAppwriteInspector: () => void;
  openAchievements: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAppwriteInspector,
  openAchievements,
  openAuthModal,
}) => {
  const { user, logout, switchDemoUser } = useAuth();
  const { totalXp, level, levelTitle, achievements } = useData();
  const [profileDropdown, setProfileDropdown] = useState(false);

  const config = appwriteService.getConfig();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'career-analysis', label: 'AI Career Analysis', icon: Sparkles },
    { id: 'roadmap', label: 'My Roadmap', icon: Compass },
    { id: 'project-lab', label: 'Project Lab', icon: FlaskConical },
    { id: 'portfolio', label: 'Projects', icon: FolderGit2 },
    { id: 'skills', label: 'Skills', icon: Layers },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-lg">SkillForge</span>
                <span className="text-xs font-semibold text-indigo-600 ml-1 bg-indigo-50 px-1.5 py-0.5 rounded">AI</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Appwrite TablesDB Status Pill */}
            <button
              onClick={openAppwriteInspector}
              title="Click to view Appwrite TablesDB Schema and Connection"
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-[11px]">
                {config.isConnected ? 'Appwrite Cloud' : 'Appwrite TablesDB'}
              </span>
            </button>

            {user ? (
              <>
                {/* Gamification Level & XP pill */}
                <button
                  onClick={openAchievements}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-semibold"
                >
                  <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Lvl {level} · {totalXp.toLocaleString()} XP
                  </span>
                </button>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                  >
                    <img
                      src={user.profile_image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-medium text-slate-800 hidden lg:inline-block max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdown && (
                    <div
                      onMouseLeave={() => setProfileDropdown(false)}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-xs font-medium text-indigo-600 mt-1">
                          {user.target_role} · {user.university}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          openAchievements();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Trophy className="w-4 h-4 text-indigo-600" />
                        <span>Achievements ({achievements.length} unlocked)</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          openAppwriteInspector();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span>Appwrite Schema & Inspector</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          switchDemoUser();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 text-left"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Switch to Alex Chen (Demo)</span>
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdown(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchDemoUser()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Explore Demo
                </button>
                <button
                  onClick={openAuthModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign In / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        {user && (
          <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
