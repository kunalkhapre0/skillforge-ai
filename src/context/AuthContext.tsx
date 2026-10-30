/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserRecord, TargetRole } from '../types';
import { appwriteService, COLLECTIONS } from '../services/appwrite';

interface AuthContextType {
  user: UserRecord | null;
  loading: boolean;
  isOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: () => void;
  updateUser: (updates: Partial<UserRecord>) => Promise<void>;
  completeOnboarding: (data: {
    name: string;
    university: string;
    graduation_year: number;
    education: string;
    target_role: TargetRole;
    initialSkills: { name: string; category: string; proficiency: number }[];
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const current = await appwriteService.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Error loading current user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await appwriteService.login(email, password);
      const current = await appwriteService.getCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const newUser = (await appwriteService.createAccount(email, password, name)) as UserRecord;
      setUser(newUser);
      setIsOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await appwriteService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUser = () => {
    appwriteService.seedDemoData(true);
    const demo = appwriteService.getCurrentUser();
    demo.then((u) => {
      setUser(u);
      setIsOnboarding(false);
    });
  };

  const updateUser = async (updates: Partial<UserRecord>) => {
    if (!user) return;
    try {
      const updated = await appwriteService.updateDocument<UserRecord>(
        COLLECTIONS.USERS,
        user.$id || user.id,
        updates
      );
      setUser((prev) => (prev ? { ...prev, ...updated } : updated));
    } catch (e) {
      console.error('Failed to update user profile in Appwrite TablesDB:', e);
    }
  };

  const completeOnboarding = async (data: {
    name: string;
    university: string;
    graduation_year: number;
    education: string;
    target_role: TargetRole;
    initialSkills: { name: string; category: string; proficiency: number }[];
  }) => {
    if (!user) return;
    try {
      const initialScore = 65;
      const initialXp = 100;
      const updated = await appwriteService.updateDocument<UserRecord>(
        COLLECTIONS.USERS,
        user.$id || user.id,
        {
          name: data.name,
          university: data.university,
          graduation_year: data.graduation_year,
          education: data.education,
          target_role: data.target_role,
          career_score: initialScore,
          total_xp: initialXp,
          level: 1,
        }
      );
      setUser(updated);
      setIsOnboarding(false);
    } catch (err) {
      console.error('Failed to save onboarding data to Appwrite TablesDB:', err);
      setIsOnboarding(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOnboarding,
        login,
        signup,
        logout,
        switchDemoUser,
        updateUser,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
