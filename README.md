# CodeGuard AI — Full-Stack Academic Integrity & Code Intelligence Platform

> **Explainable, Human-in-the-Loop Code Similarity & Academic Integrity Engine**  
> Built for Computer Science departments, universities, and code evaluation bodies.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────────────────┐
                                  │      React.js + Tailwind CSS UI         │
                                  │ (Vite, Glassmorphic Modern Dark/Light)  │
                                  └────────────────────┬────────────────────┘
                                                       │ JSON / JWT (Bearer Auth)
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │          Flask REST Backend             │
                                  │   (Flask-CORS, PyJWT, bcrypt, PyMongo)  │
                                  └────────────────────┬────────────────────┘
                                                       │
        ┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
        │                                                                                            │
        ▼                                                                                            ▼
┌─────────────────────────────────────────┐                                      ┌─────────────────────────────────────────┐
│     CodeGuard AI Analysis Pipeline      │                                      │          MongoDB Database               │
│                                         │                                      │            (codeguard)                  │
│ 1. Source Normalization (Tokens/Syntax) │                                      ├─────────────────────────────────────────┤
│ 2. Token N-Gram Sorensen-Dice Analysis  │                                      │ • users (admins, tutors, students)      │
│ 3. AST & Control-Flow Invariant Mapping │                                      │ • assignments                           │
│ 4. Semantic Algorithmic Embeddings      │                                      │ • submissions                           │
│ 5. Isolated Sandbox Behavioral Contract │                                      │ • similarity_results                    │
│ 6. Chronological Timeline Correlation   │                                      │ • reviews                               │
│ 7. Evidence Fusion & Weight Aggregation │                                      │ • clusters                              │
│ 8. Explainable Review Score Generation  │                                      │ • timeline_events                       │
└─────────────────────────────────────────┘                                      │ • settings                              │
                                                                                 └─────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.11+)
- **MongoDB** (Optional: Local daemon or MongoDB Atlas. If MongoDB is not running locally, the backend seamlessly activates an in-memory `mongomock` engine with zero configuration required).

---

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment (optional but recommended)
# Windows:
python -m venv venv
venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed the database with realistic academic demo cohort
python seed.py

# Start the Flask API Server (Port 5000)
python app.py
```

Backend will be active at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

### 2. Frontend Setup

```bash
cd codeguard-ai

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Frontend will be active at: `http://localhost:5173`

---

## 🔑 Demo Accounts & Roles

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **TUTOR** | Dr. Priya Kumar | `priya.kumar@nehru.ac.in` | `Tutor@123` |
| **TUTOR** | Prof. Rajesh Sharma | `rajesh.sharma@nehru.ac.in` | `Tutor@123` |
| **ADMIN** | System Administrator | `admin@codeguard.ai` | `Admin@123` |
| **STUDENT** | Arun Kumar | `arun.kumar@student.nehru.ac.in` | `Student@123` |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```ini
FLASK_ENV=development
FLASK_PORT=5000
SECRET_KEY=codeguard_secret_key_super_secure_development_2026
JWT_SECRET_KEY=codeguard_jwt_secret_token_secure_key_2026
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=codeguard
FRONTEND_URL=http://localhost:5173
```

### Frontend (`codeguard-ai/.env`):
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 🧠 CodeGuard AI Analysis Pipeline

The CodeGuard engine evaluates submissions across multi-vector representations to provide **Explainable Review Scores** rather than black-box probabilistic verdicts:

```
Source Code
    ↓
1. Normalization (stripping comments, docstrings, formatting differences, standardizing token identifiers)
    ↓
2. Token Analysis (N-Gram Sorensen-Dice lexical similarity & contiguous line mapping)
    ↓
3. AST / Structural Analysis (language syntax tree parsing, control flow graph branch invariants, loop conversions)
    ↓
4. Semantic Embedding (algorithmic operation feature vectors & expression transformation detection)
    ↓
5. Behavioral Analysis (safe isolated sandbox contract synthesis & I/O boundary invariant matching)
    ↓
6. Timeline Analysis (chronological submission delta calculation, simultaneous burst anomaly scoring)
    ↓
7. Evidence Fusion (weighted multi-vector score synthesis from configurable system weights)
    ↓
8. Explainable Review Score + Evidence + Transformation Cards
```

### Configurable Weights (Stored in MongoDB `settings`):
- **Structural Similarity**: 30%
- **Semantic Similarity**: 30%
- **Behavioral Similarity**: 20%
- **Timeline Correlation**: 20%

### Core Academic Principle:
- **Review Score** is an explainable triage metric (e.g., 85%), **NOT** "Probability of Cheating" or "Plagiarism Likelihood".
- The system **never** automatically declares a student guilty; all high-similarity cases require documented tutor evaluation, viva voce, or resolution.

---

## 📡 Complete REST API Reference

### Authentication
- `POST /api/auth/register` — Create user account (`ADMIN`, `TUTOR`, `STUDENT`)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/logout` — Terminate session
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/forgot-password` — Password reset dispatch

### Submissions
- `GET /api/submissions` — List submissions (filters: `assignmentId`, `language`, `status`, `search`)
- `GET /api/submissions/{id}` — Retrieve submission source code and analysis breakdown
- `POST /api/submissions` — Upload new submission and trigger automated comparison

### Similarity & Analysis
- `GET /api/similarity` or `GET /api/similarity/pairs` — List similarity comparisons
- `GET /api/similarity/{id}` — Retrieve detailed similarity pair breakdown
- `POST /api/similarity/analyze` — Execute multi-stage pipeline between two submissions

### Reviews & Triage
- `GET /api/reviews` — Retrieve cases requiring faculty review
- `PATCH /api/reviews/{id}` — Submit faculty verdict (`RESOLVED_ACCEPTABLE`, `RESOLVED_VIVA_REQUIRED`, `INVESTIGATING`), notes, and signature

### Clusters & Network
- `GET /api/clusters` — Retrieve similarity graph clusters and sharing rings
- `GET /api/clusters/{id}` — Retrieve cluster node topology and centrality scores

### Timeline & Chronology
- `GET /api/timeline` — Retrieve chronological submission events and burst deltas

### Course Assignments & Students
- `GET /api/assignments` — List course assignments and review status
- `POST /api/assignments` — Create a new programming assignment
- `GET /api/students` — Directory of enrolled students and assignment progress
- `GET /api/students/{id}` — Detailed student submission record

### Reports & System Settings
- `GET /api/reports/dashboard` — Live aggregated department analytics
- `GET /api/settings` — Read similarity thresholds, language rules, and pipeline weights
- `PATCH /api/settings` — Update similarity weights, thresholds, and normalization rules

---

## 🛡️ Security & Sandbox Architecture

- **Host Safety**: Arbitrary student code is **never** executed inside the Flask worker process.
- **Isolated Execution**: Behavioral analysis uses isolated execution interfaces and safe AST synthesis.
- **Passwords**: Hashed with `bcrypt` (12 salt rounds). Plaintext passwords are never stored.
- **Protected Endpoints**: JWT authentication with expiration headers and role-based access control.

---

## 📄 License
Academic Integrity License — Developed for Educational & Institutional Deployment.
