import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:secure_password@cluster0.mongodb.net/sc_qpms_db?retryWrites=true&w=majority';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'd9f48a17b8c2e35a09b45e7f123456789abcdef0123456789abcdef01234567';

function getEncryptionKey() {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

function encryptContent(plainText) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedContent: encrypted, iv: iv.toString('hex') };
}

function generateHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

async function runSeed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const db = mongoose.connection.db;

  const usersCol = db.collection('users');
  const papersCol = db.collection('questionpapers');
  const auditCol = db.collection('auditlogs');
  const secCol = db.collection('securityevents');

  // Check if admin exists
  const existingAdmin = await usersCol.findOne({ email: 'admin@sc-qpms.edu' });
  if (existingAdmin) {
    console.log('Admin account already exists. Skipping duplicate seeding.');
    await mongoose.disconnect();
    return;
  }

  const demoUsers = [
    { name: 'Dr. Katherine Vance (Admin)', email: 'admin@sc-qpms.edu', password: 'AdminPassword@2026', role: 'Admin' },
    { name: 'Prof. Alan Turing (Setter)', email: 'setter@sc-qpms.edu', password: 'SetterPassword@2026', role: 'Question Setter' },
    { name: 'Dr. Ada Lovelace (Reviewer)', email: 'reviewer@sc-qpms.edu', password: 'ReviewerPassword@2026', role: 'Reviewer' },
    { name: 'Registrar Marcus Cole (Authority)', email: 'authority@sc-qpms.edu', password: 'AuthorityPassword@2026', role: 'Examination Authority' },
    { name: 'Chief Invigilator Sarah Chen (Center)', email: 'center@sc-qpms.edu', password: 'CenterPassword@2026', role: 'Examination Center' },
  ];

  const userMap = {};
  for (const u of demoUsers) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(u.password, salt);
    const res = await usersCol.insertOne({
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userMap[u.role] = res.insertedId;
    console.log(`Created user: ${u.email} [${u.role}]`);
  }

  // Sample papers
  const p1Content = 'EXAMINATION 2026 - CS804 Cryptographic Protocols. Section A: AES-256 Rijndael analysis. Section B: Zero-knowledge proofs.';
  const p1Enc = encryptContent(p1Content);
  await papersCol.insertOne({
    paperId: 'QP-2026-1001',
    title: 'Advanced Computer Networks & Cryptographic Protocols',
    encryptedContent: p1Enc.encryptedContent,
    iv: p1Enc.iv,
    hash: generateHash(p1Content),
    status: 'Created',
    releaseStatus: 'Locked',
    createdBy: userMap['Question Setter'],
    examDate: '2026-10-15',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const p2Content = 'EXAMINATION 2026 - CS702 Distributed Systems. FLP theorem and Raft consensus validation.';
  const p2Enc = encryptContent(p2Content);
  await papersCol.insertOne({
    paperId: 'QP-2026-2042',
    title: 'Distributed Systems & Fault Tolerant Architectures',
    encryptedContent: p2Enc.encryptedContent,
    iv: p2Enc.iv,
    hash: generateHash(p2Content),
    status: 'Reviewed',
    releaseStatus: 'Locked',
    createdBy: userMap['Question Setter'],
    reviewedBy: userMap['Reviewer'],
    reviewComments: 'Syllabus aligned and peer-reviewed.',
    examDate: '2026-10-18',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const p3Content = 'EXAMINATION 2026 - CYBER901 Digital Forensics. Memory volatility analysis and kernel inspection.';
  const p3Enc = encryptContent(p3Content);
  await papersCol.insertOne({
    paperId: 'QP-2026-3099',
    title: 'Cybersecurity Incident Response & Digital Forensics',
    encryptedContent: p3Enc.encryptedContent,
    iv: p3Enc.iv,
    hash: generateHash(p3Content),
    status: 'Approved',
    releaseStatus: 'Locked',
    createdBy: userMap['Question Setter'],
    reviewedBy: userMap['Reviewer'],
    approvedBy: userMap['Examination Authority'],
    examTime: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago (ready to release)
    examDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('Seed script encountered error:', err.message);
  process.exit(1);
});
