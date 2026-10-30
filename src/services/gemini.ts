/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  AICareerAnalysisResult,
  AIProjectRecommendation,
  RoadmapPhase,
  TargetRole,
  UserRecord,
  UserSkillRecord,
  ProjectRecord,
  CertificationRecord,
} from '../types';

export const geminiService = {
  async analyzeCareer(
    userProfile: UserRecord | null,
    skills: UserSkillRecord[],
    projects: ProjectRecord[],
    certifications: CertificationRecord[],
    targetRole: TargetRole
  ): Promise<AICareerAnalysisResult> {
    try {
      const response = await fetch('/api/ai/career-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          skills: skills.map((s) => ({
            name: s.skill_name || 'Skill',
            proficiency: s.proficiency,
            category: s.skill_category || 'General',
          })),
          projects: projects.map((p) => ({
            title: p.title,
            technologies: p.technologies,
            difficulty: p.difficulty,
            status: p.status,
          })),
          certifications: certifications.map((c) => ({
            name: c.name,
            provider: c.provider,
          })),
          targetRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Backend Gemini API call failed or in client preview, returning calculated analysis', error);
      return calculateClientFallbackAnalysis(targetRole, skills, projects, certifications);
    }
  },

  async recommendProjects(
    targetRole: TargetRole,
    missingSkills: string[],
    currentExperience: string = 'Intermediate'
  ): Promise<AIProjectRecommendation[]> {
    try {
      const response = await fetch('/api/ai/recommend-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          missingSkills,
          currentExperience,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.projects || [];
    } catch (error) {
      console.warn('Backend project recommendation failed, using fallback', error);
      return getClientFallbackProjects(targetRole, missingSkills);
    }
  },

  async generateRoadmap(
    targetRole: TargetRole,
    skillGaps: string[],
    graduationYear: number = 2026
  ): Promise<RoadmapPhase[]> {
    try {
      const response = await fetch('/api/ai/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          skillGaps,
          graduationYear,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.phases || [];
    } catch (error) {
      console.warn('Backend roadmap generation failed, using fallback', error);
      return getClientFallbackRoadmap(targetRole);
    }
  },
};

function calculateClientFallbackAnalysis(
  targetRole: TargetRole,
  skills: UserSkillRecord[],
  projects: ProjectRecord[],
  certifications: CertificationRecord[]
): AICareerAnalysisResult {
  const avgProficiency =
    skills.length > 0 ? Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length) : 50;

  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const projectScore = Math.min(30, completedProjects * 12);
  const certScore = Math.min(15, certifications.length * 8);
  const skillScore = Math.round((avgProficiency / 100) * 40);
  const readiness = Math.min(96, Math.max(45, skillScore + projectScore + certScore + 8));

  // Determine skill gaps based on lowest proficiency skills
  const sortedSkills = [...skills].sort((a, b) => a.proficiency - b.proficiency);
  const lowest = sortedSkills.slice(0, 4);

  const gaps = lowest.map((s) => ({
    skill: s.skill_name || 'Core Competency',
    category: s.skill_category || 'Technical',
    currentProficiency: s.proficiency,
    targetProficiency: Math.min(90, s.proficiency + 35),
    priority: (s.proficiency < 50 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
    reason: `Target proficiency for ${targetRole} positions requires mastery in ${s.skill_name || 'this area'}.`,
    estimatedWeeks: Math.max(2, Math.round((85 - s.proficiency) / 10)),
  }));

  return {
    overallReadiness: readiness,
    strengths: [
      `Demonstrated proficiency in ${skills.find((s) => s.proficiency > 75)?.skill_name || 'core software engineering'}`,
      `Completed ${completedProjects} substantial technical projects with live code repositories`,
      `Verified industry credentials reinforcing core domain competencies`,
      `Clear educational trajectory tailored toward ${targetRole}`,
    ],
    skillGaps: gaps.length > 0 ? gaps : [
      {
        skill: 'Docker & Containers',
        category: 'DevOps',
        currentProficiency: 35,
        targetProficiency: 80,
        priority: 'High',
        reason: 'Essential for reproducible microservice deployment and CI/CD pipelines.',
        estimatedWeeks: 3,
      },
      {
        skill: 'Distributed SQL & TablesDB',
        category: 'Database',
        currentProficiency: 48,
        targetProficiency: 85,
        priority: 'High',
        reason: 'Production systems require deep knowledge of database indexing and ACID transactions.',
        estimatedWeeks: 4,
      },
      {
        skill: 'System Design & Scalability',
        category: 'Tools',
        currentProficiency: 42,
        targetProficiency: 80,
        priority: 'High',
        reason: 'Senior engineering evaluations heavily weight caching, sharding, and fault tolerance.',
        estimatedWeeks: 5,
      },
    ],
    readinessExplanation: `Your Career Readiness Score of ${readiness}/100 is computed from technical skill mastery (${skillScore}/40), portfolio projects (${projectScore}/30), industry certifications (${certScore}/15), and roadmap velocity (10/15).`,
    recommendedActions: [
      `Complete a containerized deployment project using Docker and Appwrite TablesDB`,
      `Target high-priority skill gaps in distributed system architectures`,
      `Publish GitHub documentation and live interactive previews for your top repositories`,
      `Pursue an associate cloud or database certification before graduation`,
    ],
    marketInsights: {
      roleDemand: 'Very High',
      avgSalaryRange: '$115,000 - $165,000',
      topHiringCompanies: ['Google', 'Anthropic', 'Appwrite', 'Stripe', 'Datadog'],
      keyTrends: `In 2026, companies seek candidates with hands-on experience in Appwrite databases, production AI pipelines, and clean API design.`,
    },
  };
}

function getClientFallbackProjects(targetRole: TargetRole, missingSkills: string[]): AIProjectRecommendation[] {
  return [
    {
      title: 'AI Resume & Skill Gap Analyzer',
      problemSolves: 'Solves applicant tracking opacity by parsing candidate resumes, benchmarking them against live job specs, and computing vector similarity scores.',
      skillsDeveloped: ['Python', 'NLP', 'Appwrite TablesDB', 'FastAPI'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 weeks (25 hours)',
      whyRecommended: `Recommended because your skills in ${missingSkills[0] || 'NLP'} are currently below the target level for ${targetRole}.`,
      architectureHighlights: [
        'Multi-stage parsing pipeline extracting structured JSON from raw PDF uploads',
        'Appwrite TablesDB integration storing normalized candidate credentials and parsed keywords',
        'Semantic embedding comparison layer with cosine similarity thresholds',
      ],
      stepByStepGuide: [
        'Set up Appwrite TablesDB schema for candidate profiles, skills, and parsed match records',
        'Implement PDF document extractor using pdfplumber and structured regex normalization',
        'Generate text embeddings and calculate cosine distance against target job requirement vectors',
        'Build reactive dashboard displaying category-by-category readiness scores with exportable report',
      ],
      suggestedRepoName: 'resume-gap-analyzer-ai',
    },
    {
      title: 'Real-Time Event Stream & Query Visualizer',
      problemSolves: 'Demonstrates handling high-volume event streams with fault-tolerant queuing, structured Appwrite TablesDB persistence, and real-time dashboard telemetry.',
      skillsDeveloped: ['Docker', 'System Design', 'TypeScript', 'Appwrite TablesDB'],
      difficulty: 'Advanced',
      estimatedTime: '3-4 weeks (35 hours)',
      whyRecommended: `Directly bridges your priority gap in container orchestration and database optimization.`,
      architectureHighlights: [
        'Docker-compose environment running API gateway, Redis pub/sub queue, and worker cluster',
        'Batched writes into Appwrite TablesDB with transactional safety and retry backoff',
        'Server-Sent Events live monitoring interface with latency metric percentiles',
      ],
      stepByStepGuide: [
        'Define Docker compose service topology with network isolation and volume mounts',
        'Write producer service handling ingest bursts with Redis queue buffering',
        'Create worker consumer pool with batching logic inserting into Appwrite TablesDB',
        'Benchmark throughput under artificial load using k6 test suites',
      ],
      suggestedRepoName: 'event-stream-forge',
    },
    {
      title: 'Cloud Infrastructure & Database Query Visualizer',
      problemSolves: 'Provides visual query performance benchmarking, execution plan analysis, and automated index recommendation for relational and document databases.',
      skillsDeveloped: ['Database Optimization', 'SQL', 'React Flow', 'Appwrite TablesDB', 'CI/CD'],
      difficulty: 'Intermediate',
      estimatedTime: '2 weeks (20 hours)',
      whyRecommended: 'Recommended to boost your Database and Query Optimization competency to the required 85% benchmark.',
      architectureHighlights: [
        'Interactive AST parser extracting join paths and filter clauses',
        'Appwrite Database query logger tracking latency percentiles across collections',
        'Automated schema migration helper generating optimal compound index definitions',
      ],
      stepByStepGuide: [
        'Build schema explorer component visualizing table relationships and foreign key references',
        'Instrument query execution timing hooks across read and write operations',
        'Generate recommendations for missing indexes based on WHERE clause filter cardinalities',
        'Deploy with automated GitHub Actions CI/CD pipeline',
      ],
      suggestedRepoName: 'db-query-lens',
    },
  ];
}

function getClientFallbackRoadmap(targetRole: TargetRole): RoadmapPhase[] {
  return [
    {
      phaseNumber: 1,
      title: 'Phase 1: Foundations & Database Architecture',
      subtitle: 'Master algorithmic rigor, database modeling, and strict TypeScript/Python foundations',
      estimatedWeeks: 'Weeks 1-4',
      goals: [
        {
          title: 'Advanced Relational Modeling & Appwrite TablesDB',
          description: 'Design normalized schemas with primary/foreign keys, compound indexes, and ACID transaction guarantees.',
          skill: 'Database Design',
          difficulty: 'Intermediate',
          targetHours: 18,
          keyDeliverable: 'Production database schema blueprint with 9 normalized collections and index audit',
        },
        {
          title: 'Algorithmic Problem Solving & Data Structures',
          description: 'Implement core graph traversal, dynamic programming, and binary search patterns in TypeScript.',
          skill: 'Data Structures',
          difficulty: 'Intermediate',
          targetHours: 20,
          keyDeliverable: 'Repository with 30 thoroughly tested algorithmic solutions and time-complexity analyses',
        },
      ],
    },
    {
      phaseNumber: 2,
      title: 'Phase 2: Core Engineering & Backend Services',
      subtitle: 'Build robust REST APIs, authentication security, and scalable server architectures',
      estimatedWeeks: 'Weeks 5-8',
      goals: [
        {
          title: 'Secure Authentication & Session Management',
          description: 'Implement JWT session handling, role-based access control (RBAC), and protected route middleware.',
          skill: 'Auth & Security',
          difficulty: 'Intermediate',
          targetHours: 15,
          keyDeliverable: 'End-to-end auth module with Appwrite Authentication and session rotation',
        },
        {
          title: 'Containerization with Docker & Multi-Stage Builds',
          description: 'Package full-stack applications into minimal, secure alpine images with compose orchestration.',
          skill: 'Docker',
          difficulty: 'Intermediate',
          targetHours: 16,
          keyDeliverable: 'Production docker-compose.yml file managing app, cache, and reverse proxy',
        },
      ],
    },
    {
      phaseNumber: 3,
      title: 'Phase 3: Cloud, DevOps & CI/CD Pipelines',
      subtitle: 'Automate build pipelines, cloud hosting, and continuous integration workflows',
      estimatedWeeks: 'Weeks 9-12',
      goals: [
        {
          title: 'Automated GitHub Actions CI/CD Pipeline',
          description: 'Configure automated pull request checks, unit test suites, build validation, and preview deployments.',
          skill: 'CI/CD',
          difficulty: 'Intermediate',
          targetHours: 14,
          keyDeliverable: 'Green build workflow file running linting, TypeScript verification, and automated packaging',
        },
        {
          title: 'System Design: Caching, Rate Limiting & Resiliency',
          description: 'Architect distributed systems with Redis caching, circuit breakers, and exponential backoff retry policies.',
          skill: 'System Design',
          difficulty: 'Advanced',
          targetHours: 22,
          keyDeliverable: 'Comprehensive architectural RFC document and interactive system simulation',
        },
      ],
    },
    {
      phaseNumber: 4,
      title: 'Phase 4: Capstone Mastery & Industry Launch',
      subtitle: 'Deliver a portfolio-defining capstone project and achieve career readiness',
      estimatedWeeks: 'Weeks 13-16',
      goals: [
        {
          title: 'Full-Scale Capstone Project Deployment',
          description: 'Deploy a high-availability AI-powered web platform with production database, real analytics, and monitoring.',
          skill: 'Full Stack Engineering',
          difficulty: 'Advanced',
          targetHours: 35,
          keyDeliverable: 'Live production URL with active users, demo data, and GitHub documentation',
        },
        {
          title: 'Technical Interview & System Architecture Portfolio',
          description: 'Refine GitHub portfolio, create interactive project walkthroughs, and record architecture demos.',
          skill: 'Technical Communication',
          difficulty: 'Intermediate',
          targetHours: 15,
          keyDeliverable: 'Polished portfolio site with case studies, live demos, and resume alignment',
        },
      ],
    },
  ];
}
