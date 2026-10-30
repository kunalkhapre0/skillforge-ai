/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AICareerAnalysis } from './components/AICareerAnalysis';
import { RoadmapView } from './components/RoadmapView';
import { ProjectLab } from './components/ProjectLab';
import { ProjectPortfolio } from './components/ProjectPortfolio';
import { SkillsView } from './components/SkillsView';
import { CertificationsView } from './components/CertificationsView';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { AppwriteInspectorModal } from './components/AppwriteInspectorModal';
import { AchievementsModal } from './components/AchievementsModal';
import { NewGoalModal } from './components/NewGoalModal';

function MainApp() {
  const { user, isOnboarding, switchDemoUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAppwriteInspectorOpen, setIsAppwriteInspectorOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [forceOnboarding, setForceOnboarding] = useState(false);

  // If user is not logged in and not on demo, display Landing Page
  const showLanding = !user && activeTab !== 'demo';

  const handleStartOnboarding = () => {
    setIsAuthModalOpen(true);
  };

  const handleExploreDemo = () => {
    switchDemoUser();
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAppwriteInspector={() => setIsAppwriteInspectorOpen(true)}
        openAchievements={() => setIsAchievementsOpen(true)}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {showLanding ? (
          <LandingPage
            onStartOnboarding={handleStartOnboarding}
            onExploreDemo={handleExploreDemo}
            openAppwriteInspector={() => setIsAppwriteInspectorOpen(true)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                onNavigate={setActiveTab}
                openNewGoalModal={() => setIsNewGoalModalOpen(true)}
              />
            )}
            {activeTab === 'career-analysis' && (
              <AICareerAnalysis onNavigate={setActiveTab} />
            )}
            {activeTab === 'roadmap' && (
              <RoadmapView onOpenNewGoalModal={() => setIsNewGoalModalOpen(true)} />
            )}
            {activeTab === 'project-lab' && (
              <ProjectLab onNavigate={setActiveTab} />
            )}
            {activeTab === 'portfolio' && <ProjectPortfolio />}
            {activeTab === 'skills' && <SkillsView />}
            {activeTab === 'certifications' && <CertificationsView />}
          </>
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboarding || forceOnboarding}
        onClose={() => setForceOnboarding(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />

      <AppwriteInspectorModal
        isOpen={isAppwriteInspectorOpen}
        onClose={() => setIsAppwriteInspectorOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <NewGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
