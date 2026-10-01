# CodeGuard AI — AI-Powered Code Integrity & Plagiarism Intelligence

> **Tagline:** *"Understand code similarity. Investigate with evidence."*  
> **Short description:** *"AI-assisted code integrity intelligence for educators."*

CodeGuard AI is an AI-assisted code integrity platform built for colleges and tutors. It analyzes programming submissions using structural, semantic, behavioral, and temporal evidence to identify submissions that deserve manual review.

---

### Core Ethical Product Principle
> **"We don't decide whether a student cheated. We identify meaningful similarities and present the evidence so an educator can make an informed decision."**

The platform strictly avoids accusatory labels such as *"cheater"* or *"guilty"*. Instead, it adheres to objective academic terminology: **"Review Required"**, **"Suspicious Similarity"**, **"Review Priority"**, and **"Temporal Correlation Detected"**, ensuring that the final judgment always belongs to the tutor ("Human-in-the-Loop"). No permanent "plagiarism score" is assigned to students.

---

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Build Tool:** Vite v8
- **Visuals:** SVG-based interactive charts (similarity trends, detection breakdown, network graph, score distributions, Monaco code viewers)

---

## Project Structure
```
codeguard-ai/
  ├── public/
  ├── src/
  │   ├── api/
  │   │   ├── types.ts           # Strongly typed domain interfaces
  │   │   ├── mockData.ts        # Realistic Java solutions & cohort data
  │   │   └── apiService.ts      # RESTful API client layer
  │   ├── components/
  │   │   ├── layout/
  │   │   │   ├── Sidebar.tsx    # 10-item navigation & tutor profile
  │   │   │   └── Topbar.tsx     # Search, scan action, theme toggle
  │   │   ├── code/
  │   │   │   ├── MonacoCodeViewer.tsx # Code viewer with syntax highlighting
  │   │   │   ├── CodeDiffViewer.tsx   # Side-by-side synchronized comparison
  │   │   │   └── EvidenceGraph.tsx    # Multi-dimensional pipeline graph
  │   │   ├── charts/
  │   │   │   ├── LineChart.tsx        # 7-day similarity trends
  │   │   │   ├── DonutChart.tsx       # Signal breakdown
  │   │   │   ├── ClusterNetwork.tsx   # Interactive SVG network graph
  │   │   │   └── HistogramChart.tsx   # Score distribution
  │   │   └── common/
  │   │       ├── Badge.tsx
  │   │       ├── CircularProgress.tsx
  │   │       ├── ProgressBar.tsx
  │   │       ├── Modal.tsx
  │   │       └── ToastContainer.tsx
  │   ├── context/
  │   │   ├── ThemeContext.tsx   # Dark/light mode persistence
  │   │   └── AppContext.tsx     # Navigation & selection state
  │   ├── pages/
  │   │   ├── LandingPage.tsx
  │   │   ├── DashboardPage.tsx
  │   │   ├── SubmissionsPage.tsx
  │   │   ├── SubmissionDetailPage.tsx
  │   │   ├── SimilarityAnalysisPage.tsx
  │   │   ├── ReviewQueuePage.tsx
  │   │   ├── ClustersPage.tsx
  │   │   ├── TimelinePage.tsx
  │   │   ├── AssignmentsPage.tsx
  │   │   ├── StudentsPage.tsx
  │   │   ├── ReportsPage.tsx
  │   │   └── SettingsPage.tsx
  │   ├── App.tsx
  │   ├── main.tsx
  │   └── index.css
  ├── index.html
  ├── package.json
  ├── tsconfig.json
  └── vite.config.ts
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## Pages Included
1. **Landing Page (`/`)**: Public portal with live inference visualization, 5-step pipeline, and paradigm comparison.
2. **Dashboard (`/dashboard`)**: Key statistics, 7-day trends line chart, detection breakdown donut, priority review table, and live activity feed.
3. **Submissions (`/submissions`)**: Repository table with search, filters, single submission upload, and bulk archive intake.
4. **Submission Detail (`/submissions/:id`)**: Deep inspection with Monaco viewer, circular progress gauge, and evidence cards.
5. **Similarity Analysis (`/similarity`)**: Dual selectors, side-by-side diff viewer with transformation cards, evidence graph, and tutor decision logging.
6. **Review Queue (`/review-queue`)**: Filterable queue by priority with direct investigation action and audit modals.
7. **Clusters (`/clusters`)**: Interactive SVG network graph visualizing student collusion rings and hub centrality.
8. **Timeline (`/timeline`)**: Chronological sequence mapping submission events and temporal correlation signals.
9. **Assignments (`/assignments`)**: Problem set management across course modules with export tools and creation modal.
10. **Students (`/students`)**: Student directory with profile drawer and history (zero permanent plagiarism score policy).
11. **Reports (`/reports`)**: Distribution histograms, departmental metrics, CSV download, and printable PDF reports.
12. **Settings (`/settings`)**: Sensitivity threshold sliders, language support indicators, and active rule toggles.

---
© 2026 CodeGuard AI. Nehru Institute of Technology. All rights reserved.
