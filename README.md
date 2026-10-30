# SkillForge AI — Turn Your Skills Into Your Career Roadmap

> **Official Submission for the Appwrite Databases Hackathon 2026**  
> *Category: Productivity & Developer Tools / Databases*  
> *Developer: Solo submission by Kunal Khapre*

---

## 🚀 Project Overview

**SkillForge AI** is an AI-powered career development platform built for college students and early-career developers. Rather than relying on generic, one-size-fits-all roadmaps, SkillForge AI conducts deep, multi-dimensional gap analysis against real-world tech roles (AI Engineer, Cloud Architect, Full Stack Developer, Data Scientist, ML Engineer, and Software Engineer).

The platform bridges identified gaps through **custom-tailored capstone project recommendations**, an **actionable 4-phase milestone roadmap**, **gamified XP and leveling**, and an **objective Career Readiness Score (0–100)**.

---

## 🏆 Appwrite TablesDB Architecture & Relational Schema

Appwrite Authentication and **Appwrite TablesDB** form the core persistent backbone of the application. All student profiles, competencies, projects, certifications, goals, recommendations, and gamification logs are strictly modeled as normalized collections:

```
User (Student)
  │
  ├── Appwrite Authentication (account.create / createEmailPasswordSession)
  │
  ├── Appwrite TablesDB (skillforge_db)
  │     ├── users                (Profiles, career score, XP, graduation year)
  │     ├── skills               (Global catalog with difficulty & category)
  │     ├── user_skills          (Junction: user_id ↔ skill_id, proficiency 0-100%, verified)
  │     ├── projects             (Portfolio builds, technologies, GitHub/demo links, status)
  │     ├── certifications       (Credentials, providers, verification URLs, issue date)
  │     ├── learning_goals       (Milestone deadlines, progress %, target level, status)
  │     ├── activities           (Real-time timeline of XP awards and achievement events)
  │     ├── recommendations      (Prioritized AI recommendations for targeted skills & projects)
  │     └── achievements         (Gamification badges unlocked across milestones)
  │
  └── Gemini 3.8 Flash Engine (Server-side career gap diagnostics & project lab recommendations)
```

### Relational Schema Specification

1. **`users`**
   - `id`: string (Primary Key)
   - `name`: string
   - `email`: string
   - `education`: string (e.g. "B.S. in Computer Science")
   - `university`: string (e.g. "Stanford University")
   - `graduation_year`: integer (e.g. 2026)
   - `target_role`: enum (`AI Engineer`, `Machine Learning Engineer`, `Cloud Engineer`, `Data Scientist`, `Full Stack Developer`, `Software Engineer`)
   - `bio`: string
   - `profile_image`: string (URL)
   - `career_score`: integer (0–100)
   - `total_xp`: integer
   - `level`: integer
   - `created_at`: string (ISO-8601)

2. **`skills`**
   - `id`: string (Primary Key)
   - `name`: string
   - `category`: enum (`Programming`, `AI / ML`, `Cloud`, `Database`, `DevOps`, `Web Development`, `Tools`)
   - `difficulty`: enum (`Beginner`, `Intermediate`, `Advanced`)

3. **`user_skills`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `skill_id`: string (Foreign Key → skills.id)
   - `proficiency`: integer (0–100)
   - `verified`: boolean
   - `last_updated`: string (ISO-8601)

4. **`projects`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `title`: string
   - `description`: string
   - `technologies`: string
   - `difficulty`: enum (`Beginner`, `Intermediate`, `Advanced`)
   - `status`: enum (`Planned`, `In Progress`, `Completed`)
   - `github_url`: string
   - `demo_url`: string
   - `created_at`: string (ISO-8601)

5. **`certifications`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `name`: string
   - `provider`: string (e.g. "AWS", "Google Cloud", "DeepLearning.AI")
   - `credential_url`: string
   - `issue_date`: string

6. **`learning_goals`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `skill_id`: string (Foreign Key → skills.id)
   - `title`: string
   - `description`: string
   - `current_level`: integer
   - `target_level`: integer
   - `progress`: integer (0–100)
   - `deadline`: string
   - `status`: enum (`Not Started`, `In Progress`, `Completed`)

7. **`activities`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `type`: enum (`skill_added`, `goal_completed`, `project_created`, `project_completed`, `certification_added`)
   - `title`: string
   - `description`: string
   - `xp`: integer
   - `created_at`: string (ISO-8601)

8. **`recommendations`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `type`: enum (`project`, `skill`, `certification`, `course`)
   - `title`: string
   - `description`: string
   - `priority`: enum (`High`, `Medium`, `Low`)
   - `related_skill`: string
   - `status`: enum (`pending`, `accepted`, `dismissed`)
   - `created_at`: string (ISO-8601)

9. **`achievements`**
   - `id`: string (Primary Key)
   - `user_id`: string (Foreign Key → users.id)
   - `name`: string
   - `description`: string
   - `icon`: string
   - `unlocked_at`: string (ISO-8601)

---

## 🛠️ Appwrite SDK Queries Used

SkillForge AI utilizes standard Appwrite Query SDK operations:

```typescript
// Relational scoping and sorting
databases.listDocuments('skillforge_db', 'projects', [
  Query.equal('user_id', currentUserId),
  Query.orderDesc('created_at'),
  Query.limit(20)
]);

// Full-text search and category filtering
databases.listDocuments('skillforge_db', 'skills', [
  Query.search('name', searchQuery),
  Query.equal('category', selectedCategory),
  Query.orderAsc('name')
]);

// Atomic updates
await databases.updateDocument('skillforge_db', 'learning_goals', goalId, {
  progress: 100,
  status: 'Completed'
});
```

---

## 🎮 Gamification Mechanics

- **+10 XP**: Add or track a skill
- **+25 XP**: Complete a learning goal milestone
- **+50 XP**: Complete and deploy a portfolio project
- **+100 XP**: Add a verified industry certification
- **Level Tiers**:
  - Level 1 → Beginner (0 XP)
  - Level 5 → Explorer (800 XP)
  - Level 10 → Builder (1,800 XP)
  - Level 20 → Career Ready (3,800+ XP)
- **Badges**: *First Project*, *Skill Builder*, *Roadmap Starter*, *Certified*, *Project Master*, *Career Ready*.

---

## 💻 Tech Stack

- **Backend**: Appwrite Cloud & TablesDB (`appwrite` v17+ SDK), Node.js Express server
- **AI Core**: Google Gemini 3.8 Flash (`@google/genai` TypeScript SDK)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Build & Dev**: Vite 8, tsx

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Required for Gemini AI Career Analysis & Project Recommendations
GEMINI_API_KEY="your-gemini-api-key"

# Appwrite Cloud or Self-Hosted configuration
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT_ID="your-appwrite-project-id"
VITE_APPWRITE_DATABASE_ID="skillforge_db"
```

> **Note for Hackathon Judges**: SkillForge AI includes an interactive **Appwrite Cloud Connection & Inspector Panel** directly in the top navigation bar. You can view the live schema, test your own Appwrite Cloud Project ID with an instant ping, or copy the automated bash CLI setup script to replicate all 9 collections in 30 seconds!

---

## 🏃 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the full-stack development server (Express + Vite)
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 📦 1-Click Appwrite CLI Provisioning

To automatically create all collections and indexes in your Appwrite project:

```bash
# Set your Appwrite Project
appwrite init project

# Run the automated schema script (available in Appwrite Inspector modal in-app)
./scripts/setup-appwrite-schema.sh
```

---

## 🚢 Deployment (Vercel / Cloud Run)

To deploy to Vercel:
```bash
npm run build
vercel
```
Ensure `GEMINI_API_KEY`, `VITE_APPWRITE_ENDPOINT`, and `VITE_APPWRITE_PROJECT_ID` are set in the Vercel project environment variables.
