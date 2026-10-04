# Secure Cloud-Based Question Paper Management System (SC-QPMS)

A professional, institutional-grade examination security platform engineered for end-to-end cryptographic lifecycle management, confidentiality protection, tamper detection, and time-gated controlled release of sensitive question papers.

---

## 1. Project Overview

The **Secure Cloud-Based Question Paper Management System (SC-QPMS)** addresses critical security vulnerabilities in modern higher-education and standardized testing examination workflows. 

Traditional examination distribution channels are prone to unauthorized leaks, insider tampering, physical transit theft, premature disclosure, and unauthenticated device access. SC-QPMS guarantees zero plaintext exposure from initial faculty formulation to real-time examination center release.

### Core Security Lifecycle Pipeline:

```
Question Setter
      ↓
Question Paper Formulation
      ↓
AES-256 Symmetric Encryption + SHA-256 Digest Generation
      ↓
Academic Reviewer (Peer Verification & Syllabus Alignment)
      ↓
Review Approval / Rejection
      ↓
Apex Examination Authority
      ↓
Official Council Approval
      ↓
State-Synchronized Exam Scheduling
      ↓
Cryptographically Locked Cloud Storage (MongoDB Atlas)
      ↓
Authorized Examination Center Terminal
      ↓
7-Gate Controlled Release Protocol
      ↓
Authenticated Decryption & Integrity-Verified Paper Display
```

---

## 2. Deployment Architecture (Vercel + MongoDB Atlas)

The system is engineered strictly for **serverless cloud deployment on Vercel** without any dependencies on:
- No AWS EC2 instances
- No PM2 background process managers
- No SQLite or local disk-based databases
- No persistent local filesystem storage
- No separate standalone Express backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge / Serverless                 │
│  ┌─────────────────────────────┬──────────────────────────┐ │
│  │   Next.js App Router (UI)   │   Route Handlers (API)   │ │
│  │   • Institutional Theme     │   • Server-Side RBAC     │ │
│  │   • Role Workspaces         │   • AES-256 Encryption   │ │
│  │   • Real-Time Telemetry     │   • SHA-256 Integrity    │ │
│  └─────────────────────────────┴──────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ Pooled Mongoose Connection
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             MongoDB Atlas (Cloud Cluster Database)          │
│  • users               • question_papers (Encrypted Ciphers)│
│  • reviews             • audit_logs    • security_events    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend Runtime**: Next.js Serverless Route Handlers (Node.js runtime)
- **Database**: MongoDB Atlas via Mongoose with pooled connection caching
- **Cryptographic Engine**:
  - **AES-256-CBC**: Symmetric ciphertext formulation with 16-byte random Initialization Vectors (IV)
  - **SHA-256**: Cryptographic digest generation and constant-time integrity verification
- **Authentication**: JWT (JSON Web Tokens) transported exclusively inside secure `HTTP-Only`, `SameSite=Lax` cookies
- **Password Protection**: Salted bcrypt hashing (10 rounds)
- **Authorization**: Strict server-side Role-Based Access Control (RBAC) enforced on every API route handler

---

## 4. User Roles & Access Control Matrix

| Role | Formulate Paper | Review Paper | Approve Paper | Schedule Exam | Controlled Release | Audit & Threat Telemetry |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Question Setter** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reviewer** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Examination Authority** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Examination Center** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. The 7-Gate Controlled Release Protocol

To prevent early leaks, unauthorized devices, or compromised question papers, the release endpoint (`POST /api/papers/release`) executes seven sequential verification gates:

1. **Gate 1: JWT Authentication** — Validates active cryptographically signed session cookie.
2. **Gate 2: Role Clearance** — Verifies operator holds `Examination Center` or `Admin` privileges.
3. **Gate 3: Paper Existence** — Validates existence of the requested Paper ID in MongoDB Atlas.
4. **Gate 4: Authority Approval** — Verifies paper status is formally `Approved` by the Examination Authority.
5. **Gate 5: Time Lock Verification** — Enforces `currentTime >= scheduledExamTime`. Blocks any premature disclosure.
6. **Gate 6: Hardware / Device Trust Handshake** — Validates terminal ID against server-configured `AUTHORIZED_DEVICE_IDS`.
7. **Gate 7: Cryptographic Integrity Verification** — Decrypts AES-256 ciphertext and verifies that `SHA256(decryptedContent) === storedHash`. If a single bit differs, release is rejected with a critical tampering security incident.

---

## 6. Pre-Configured Demo Credentials

The platform features a **1-click seed trigger** on the login screen or via `npm run seed`:

| Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@sc-qpms.edu` | `AdminPassword@2026` | `/admin` |
| **Question Setter** | `setter@sc-qpms.edu` | `SetterPassword@2026` | `/setter` |
| **Reviewer** | `reviewer@sc-qpms.edu` | `ReviewerPassword@2026` | `/reviewer` |
| **Examination Authority** | `authority@sc-qpms.edu` | `AuthorityPassword@2026` | `/authority` |
| **Examination Center** | `center@sc-qpms.edu` | `CenterPassword@2026` | `/exam-center` |

### Authorized Terminal ID for Examination Center:
- **`DEV-EC-HYD-001`** (Pre-authorized in default configuration)

---

## 7. Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sc_qpms_db?retryWrites=true&w=majority

# Cryptographically Secure JWT Secret for Session Cookies
JWT_SECRET=c2VjdXJlLWNsb3VkLXF1ZXN0aW9uLXBhcGVyLW1ndC1zeXN0ZW0tc2VjcmV0LWtleS0yMDI2

# Cryptographically Secure AES-256 Symmetric Encryption Key
ENCRYPTION_KEY=d9f48a17b8c2e35a09b45e7f123456789abcdef0123456789abcdef01234567

# Comma-Separated Authorized Examination Center Terminal Hardware IDs
AUTHORIZED_DEVICE_IDS=DEV-EC-HYD-001,DEV-EC-BLR-002,DEV-EC-CHN-003,SECURE-TERMINAL-01

# Public Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 8. Local Setup & Execution

### Prerequisites:
- Node.js v18+ or v20 LTS
- npm or pnpm

### Steps:
```bash
# 1. Install all dependencies
npm install

# 2. Seed database with demo accounts and sample lifecycle papers
npm run seed

# 3. Launch development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 9. Vercel Deployment Instructions

1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure the **Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `AUTHORIZED_DEVICE_IDS`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**.
5. Once deployed, navigate to `/login` and click **"Initialize Demo Data"** to bootstrap the cloud database with the default accounts and sample test papers.

---

## 10. API Specification

| Endpoint | Method | Role Required | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | POST | Public | Validates credentials, sets HTTP-only cookie, logs audit event |
| `/api/auth/logout` | POST | Public | Invalidates and expires session cookie |
| `/api/auth/me` | GET | Authenticated | Returns current authenticated user profile |
| `/api/papers` | GET | Authenticated | Lists papers filtered by role clearance |
| `/api/papers` | POST | Setter / Admin | Ingests, encrypts (AES-256), hashes (SHA-256), and locks paper |
| `/api/papers/[id]` | GET | Authenticated | Retrieves paper metadata and audit trail |
| `/api/papers/review` | POST | Reviewer / Admin | Submits formal evaluation comments & decision |
| `/api/papers/approve` | POST | Authority / Admin | Formally approves paper for examination scheduling |
| `/api/papers/reject` | POST | Authority / Admin | Rejects paper with institutional justification |
| `/api/papers/schedule` | POST | Authority / Admin | Sets exam date and locked release timestamp |
| `/api/papers/release` | POST | Center / Admin | Executes 7-gate release and returns decrypted content |
| `/api/audit` | GET | Authority / Admin | Fetches audit logs with filtering |
| `/api/security-events`| GET | Admin | Monitors security alerts and tampering attempts |
| `/api/users` | GET, POST | Admin | Manages user directory and provisioning |
| `/api/users/[id]` | PATCH | Admin | Toggles user active/suspended state |
| `/api/seed` | POST | Public / Dev | Bootstraps demo accounts and test question papers |

---

## 11. Security Demonstration Walkthrough

To demonstrate the full security workflow during evaluation:

1. **Step 1: Formulate & Encrypt (Question Setter)**
   - Sign in as `setter@sc-qpms.edu`.
   - Formulate a new question paper.
   - Observe that the paper is immediately encrypted with AES-256, assigned a SHA-256 hash, and locked.

2. **Step 2: Academic Review (Reviewer)**
   - Sign in as `reviewer@sc-qpms.edu`.
   - Open the submitted paper from "Papers Awaiting Review".
   - Submit review notes and select **"Mark as Reviewed"**.

3. **Step 3: Approval & Scheduling (Examination Authority)**
   - Sign in as `authority@sc-qpms.edu`.
   - Under "Section 1", click **"Approve Paper"**.
   - Under "Section 2", click **"Schedule"** and pick an examination timestamp.

4. **Step 4: Premature Release Prevention (Examination Center)**
   - Sign in as `center@sc-qpms.edu`.
   - Enter a Paper ID scheduled in the future with device `DEV-EC-HYD-001`.
   - Click **"Open Question Paper"**.
   - Verify that release is blocked: *"Paper is locked until the scheduled examination time."*
   - Verify that this attempt was logged as a security event.

5. **Step 5: Unauthorized Device Prevention (Examination Center)**
   - Enter an unauthorized device ID (e.g., `UNTRUSTED-LAPTOP-99`).
   - Click **"Open Question Paper"**.
   - Verify that release is rejected: *"Unauthorized examination device."*

6. **Step 6: Authorized Decryption & Integrity Verification**
   - Enter paper `QP-2026-3099` (scheduled for active time) and device `DEV-EC-HYD-001`.
   - Click **"Open Question Paper"**.
   - The system validates all 7 gates, decrypts the AES-256 ciphertext, verifies the SHA-256 hash, and displays the paper.

7. **Step 7: Threat Telemetry & Audit Ledger (Admin)**
   - Sign in as `admin@sc-qpms.edu`.
   - Inspect the **Audit Logs** and **Security Events** tabs to verify that every single access attempt, creation, review, and lock violation was immutably recorded.
