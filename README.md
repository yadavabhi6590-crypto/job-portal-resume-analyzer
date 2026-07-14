# Job Portal with Resume Analyzer

A corporate-level SaaS platform for AI-powered resume analysis, skill assessment, and career readiness tracking.

## 🚀 Features

- **Clerk Authentication**: Secure login/signup with role-based access.
- **Resume Analyzer**: PDF/DOCX text extraction with ATS scoring (0-100).
- **Skill Mapping**: Matches resume skills to industry standard roles.
- **AI Feedback**: Identifies weak language and structural gaps in resumes.
- **OMR Skill Test**: Role-based MCQ assessments with performance analytics.
- **Career Readiness Score**: Combined score from Resume + Test results.
- **PDF Report**: Professional downloadable PDF report with detailed insights.
- **Admin Panel**: Manage roles, questions, and view platform-wide analytics.
- **Modern UI**: Sleek dark mode design with Chart.js visualizations and animations.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Clerk, Chart.js, Axios, React Router.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Clerk SDK.
- **Tools**: PDFKit (Report Generation), Multer (File Uploads), pdf-parse.

## 📦 Setup Instructions

### 1. Prerequisites
- Node.js installed.
- MongoDB running locally or a MongoDB Atlas URI.
- Clerk Account (Free Tier).

### 2. Backend Setup
1. Open the `backend` folder.
2. Create/Edit `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jobportal
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   NODE_ENV=development
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (Initial Roles & Questions):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open the `frontend` folder.
2. Create/Edit `.env` file:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   VITE_API_URL=http://localhost:5000/api/v1
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## 📈 Database Schema (ER Summary)
- **User**: Clerk ID, profile details, role (Student/Admin).
- **JobRole**: Title, category, required skills.
- **ResumeAnalysis**: Scores, extracted skills, AI feedback, improvement plan.
- **RoleTest**: MCQ questions mapped to specific roles.
- **TestResult**: Answers, test score, knowledge level, career readiness.
- **IndustryTrend**: Trending skills and high-demand roles.

## 📄 Academic Deliverables
Refer to `academic_deliverables.md` for:
- DFDs (Level 0 & 1)
- ER Diagram Explanation
- Flowchart
- Viva Questions & Answers
- Project Abstract
