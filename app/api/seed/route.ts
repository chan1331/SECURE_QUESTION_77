import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import QuestionPaper from '@/models/QuestionPaper';
import AuditLog from '@/models/AuditLog';
import SecurityEvent from '@/models/SecurityEvent';
import { hashPassword } from '@/lib/auth';
import { encryptContent } from '@/lib/encryption';
import { generateHash } from '@/lib/hash';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@sc-qpms.edu' });
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'System database has already been initialized with demo accounts.',
      });
    }

    const demoUsers = [
      {
        name: 'Dr. Katherine Vance (Admin)',
        email: 'admin@sc-qpms.edu',
        password: 'AdminPassword@2026',
        role: 'Admin',
      },
      {
        name: 'Prof. Alan Turing (Setter)',
        email: 'setter@sc-qpms.edu',
        password: 'SetterPassword@2026',
        role: 'Question Setter',
      },
      {
        name: 'Dr. Ada Lovelace (Reviewer)',
        email: 'reviewer@sc-qpms.edu',
        password: 'ReviewerPassword@2026',
        role: 'Reviewer',
      },
      {
        name: 'Registrar Marcus Cole (Authority)',
        email: 'authority@sc-qpms.edu',
        password: 'AuthorityPassword@2026',
        role: 'Examination Authority',
      },
      {
        name: 'Chief Invigilator Sarah Chen (Center)',
        email: 'center@sc-qpms.edu',
        password: 'CenterPassword@2026',
        role: 'Examination Center',
      },
    ];

    const createdUsers: Record<string, any> = {};

    for (const u of demoUsers) {
      const passwordHash = await hashPassword(u.password);
      const userDoc = await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        active: true,
      });
      createdUsers[u.role] = userDoc;
    }

    // Seed Sample Papers at different stages of the workflow
    const samplePapers = [
      {
        paperId: 'QP-2026-1001',
        title: 'Advanced Computer Networks & Cryptographic Protocols',
        content: `NATIONAL EXAMINATION BOARD - CONFIDENTIAL
Course Code: CS-804 | Advanced Cryptographic Protocols
Time Allowed: 3 Hours | Max Marks: 100

SECTION A: COMPULSORY
1. Explain the mathematical foundation of AES-256 Rijndael Galois Counter Mode (GCM).
2. Contrast Diffie-Hellman Key Exchange with Elliptic Curve Cryptography in forward secrecy.
3. Formulate the zero-knowledge proof algorithm for threshold signature schemes.

SECTION B: PRACTICAL ARCHITECTURE
4. Design a tamper-evident distributed ledger for secure state examination release.
5. Analyze timing attack vulnerabilities in constant-time hash comparisons.`,
        status: 'Created',
        releaseStatus: 'Locked',
        createdBy: createdUsers['Question Setter']._id,
        examDate: '2026-10-15',
      },
      {
        paperId: 'QP-2026-2042',
        title: 'Distributed Systems & Fault Tolerant Architectures',
        content: `UNIVERSITY APEX ACADEMIC COUNCIL
Course Code: CS-702 | Distributed Systems Core Exam
Time Allowed: 3 Hours | Max Marks: 100

SECTION 1: CONSENSUS PROTOCOLS
1. Prove the FLP Impossibility Theorem in asynchronous networks.
2. Step through the Raft leader election and log replication failover cycle.

SECTION 2: STORAGE INTEGRITY
3. Design a geo-replicated multi-master database with causal consistency guarantees.`,
        status: 'Reviewed',
        releaseStatus: 'Locked',
        createdBy: createdUsers['Question Setter']._id,
        reviewedBy: createdUsers['Reviewer']._id,
        reviewComments: 'Syllabus alignment confirmed. Question distribution is rigorous and adheres to apex board standards.',
        examDate: '2026-10-18',
      },
      {
        paperId: 'QP-2026-3099',
        title: 'Cybersecurity Incident Response & Digital Forensics',
        content: `CENTRAL UNIVERSITY EXAMINATION BOARD
Course Code: CYBER-901 | Incident Response & Digital Forensics
Time: 3 Hours | Total Marks: 100

1. Reconstruct attack vector from compromised memory dump (Volatiles).
2. Detail kernel-level rootkit detection methodologies under hardened Linux environments.
3. Outline chain of custody cryptographic hashing procedures for digital evidence admissibility.`,
        status: 'Approved',
        releaseStatus: 'Locked',
        createdBy: createdUsers['Question Setter']._id,
        reviewedBy: createdUsers['Reviewer']._id,
        approvedBy: createdUsers['Examination Authority']._id,
        // Scheduled in the PAST so it is immediately unlockable by the Examination Center!
        examTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        examDate: new Date().toISOString().split('T')[0],
      },
      {
        paperId: 'QP-2026-4400',
        title: 'Artificial Intelligence & Neural Machine Translation',
        content: `DEPARTMENT OF ADVANCED COMPUTING
Course Code: AI-605 | Neural Architecture & Deep Models
Time: 3 Hours | Marks: 100

1. Derive mathematical gradients for Multi-Head Self-Attention layers.
2. Explain FlashAttention memory optimization using SRAM tiling.`,
        status: 'Approved',
        releaseStatus: 'Locked',
        createdBy: createdUsers['Question Setter']._id,
        reviewedBy: createdUsers['Reviewer']._id,
        approvedBy: createdUsers['Examination Authority']._id,
        // Scheduled in the FUTURE to demonstrate Premature Release Prevention!
        examTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        examDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ];

    for (const p of samplePapers) {
      const { encryptedContent, iv } = encryptContent(p.content);
      const hash = generateHash(p.content);

      await QuestionPaper.create({
        paperId: p.paperId,
        title: p.title,
        encryptedContent,
        iv,
        hash,
        status: p.status,
        releaseStatus: p.releaseStatus,
        createdBy: p.createdBy,
        reviewedBy: p.reviewedBy,
        approvedBy: p.approvedBy,
        reviewComments: p.reviewComments,
        examDate: p.examDate,
        examTime: p.examTime,
      });

      await AuditLog.create({
        userId: p.createdBy.toString(),
        userEmail: 'setter@sc-qpms.edu',
        userRole: 'Question Setter',
        action: 'PAPER_CREATED',
        paperId: p.paperId,
        timestamp: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Database Seeder',
        metadata: { title: p.title, hashPrefix: hash.substring(0, 16) },
      });
    }

    // Seed sample security event
    await SecurityEvent.create({
      eventType: 'SYSTEM_INITIALIZATION',
      severity: 'LOW',
      description: 'System database initialized with cryptographic seed parameters and demo accounts.',
      ipAddress: '127.0.0.1',
      userAgent: 'System Bootstrapper',
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Demo credentials and sample workflow papers seeded successfully.',
      demoAccounts: [
        { role: 'Admin', email: 'admin@sc-qpms.edu', password: 'AdminPassword@2026' },
        { role: 'Question Setter', email: 'setter@sc-qpms.edu', password: 'SetterPassword@2026' },
        { role: 'Reviewer', email: 'reviewer@sc-qpms.edu', password: 'ReviewerPassword@2026' },
        { role: 'Examination Authority', email: 'authority@sc-qpms.edu', password: 'AuthorityPassword@2026' },
        { role: 'Examination Center', email: 'center@sc-qpms.edu', password: 'CenterPassword@2026' },
      ],
      authorizedDevice: 'DEV-EC-HYD-001',
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Seeding failed.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
