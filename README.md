# ⚡ Eduspheere — Premium E-Learning SaaS Platform

Eduspheere is a production-oriented academic e-learning SaaS platform inspired by the structured curriculum hierarchy of **Coursera** and the mentorship and interactive warmth of **Vedantu**, designed with a distinctive **White & Warm Golden-Amber** aesthetic and **Adorn** serif display typography.

---

## 🌟 Key Features

### 🎓 1. Student Scholar Cockpit & Learning Dashboard
- **"Continue Learning" Hero Card**: Cursor-responsive 3D tilt card pointing to the student's next unfinished topic with instant resume capabilities.
- **Academic Health & Operations**:
  - **Attendance Dossier**: Verified presence rate calculation with examination eligibility thresholds.
  - **Doubts & Mentorship Tracker**: Active questions in faculty queue with solution badges.
  - **Problem Bank Quick Access**: Direct entry to topic-wise practice problems.
- **Enrolled Courses Grid**: Visual progress bars and curriculum depth metrics across all enrolled courses.
- **Cooper AI Study Prompts**: 1-click academic questions (Raft consensus, Attention math, Maxwell equations).

### 📚 2. Course Catalogue & Syllabus Breakdown
- **4 Comprehensive Deep Academic Courses**:
  1. `CS-DIST-401`: **Distributed Systems & Cloud Architecture** (Consensus, Raft fault tolerance, CRDTs)
  2. `AI-DEEP-502`: **Deep Learning Systems & Transformer Architectures** (Attention proof, KV-caching, FlashAttention)
  3. `PHY-ELECTRO-301`: **Advanced Electrodynamics & Wave Optics** (Maxwell equations, displacement currents, Poynting vectors)
  4. `BIO-COMP-201`: **Computational Bio-Science & Structural Modeling** (Dynamic programming, Needleman-Wunsch, AlphaFold)
- **Course Detail & Syllabus**:
  - Full module outline with topic completion states and reading duration.
  - End-of-module assessment cards with time limits and passing thresholds.
  - Faculty credentials and verified learning outcomes.

### 📖 3. Topic-Wise Notes Reader
- **Breadcrumb Navigation**: `Course > Module > Topic` hierarchy.
- **Key Takeaways Box**: Highlighted conceptual summary with amber accents.
- **Structured Markdown & Code Blocks**: Renders mathematical proofs, ASCII architectural diagrams, and code with copy-to-clipboard functionality.
- **Reading Controls**: Font size toggle (`A+`/`A-`), bookmarking, completion toggle, and **"Ask Cooper"** query trigger.

### ✏️ 4. Curated Topic Question Bank
- Filterable by Course, Difficulty (Beginner, Intermediate, Advanced), Question Type (Single Choice, Multi-Select, True/False), and Bookmarked items.
- **Accurate Evaluation**: Verifies answers against real answer keys (`correctIndices`) with emerald/rose visual feedback.
- **Faculty Academic Explanations**: Deep explanations for every question.
- **Cooper AI Dissection**: Step-by-step doubt clearing powered by Cooper.

### 🏆 5. Timed Assessment & Quiz Arena
- Pre-quiz briefing with duration, item count, and passing mark (e.g., 75%).
- Active testing screen with a **live countdown timer** (visual pulse under 2 mins, auto-submits on expiry).
- **Question Navigator Grid**: Displays answered, unanswered, and marked-for-review items.
- **Post-Quiz Review**: Detailed score card with question-by-question review and explanations.

### 📅 6. Faculty & Staff Portal (Dean Console)
- Seamless role switching in the navbar pill:
  - **Student Scholar Cockpit**: Param Sahar
  - **Faculty Portal**: Dr. K. Rajan (Dean & Professor)
- **Publish Notes**: Upload class lecture notes with PDF attachments and subject tags.
- **Mark Daily Attendance**: Class roster attendance marker (Present, Absent, Late).
- **Student Doubts Queue**: Answer student questions and mark them resolved.

### 🤖 7. Cooper AI Assistant & MCP Tools
- Conversational tutor accessible as an embedded tab or floating modal.
- Integrates with MCP tools:
  - `get_user_notes`
  - `get_user_attendance`
  - `get_user_doubts`
  - `post_new_doubt`

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 16.4.1 (Turbopack, App Router)](https://nextjs.org/)
- **UI & State**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom Adorn display typography & Golden-Amber palette
- **Hydration Safe**: `useSyncExternalStore` mounting hook (`useMounted`) preventing SSR/client hydration discrepancies
- **Accessible Motion**: `useCard3DTilt` respecting `prefers-reduced-motion` and touchscreen devices
- **Database & Auth Ready**: Supabase schema and Edge Functions integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.18 or later)
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/srikailash1313/desktop-tutorial.git
   cd desktop-tutorial
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

4. **Run TypeScript check**:
   ```bash
   npx tsc --noEmit
   ```

5. **Run ESLint**:
   ```bash
   npm run lint
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License
This project is licensed under the MIT License.
