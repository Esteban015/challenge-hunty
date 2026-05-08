import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../data/candidates.json');

async function readCandidates() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeCandidates(candidates) {
  await fs.writeFile(DATA_FILE, JSON.stringify(candidates, null, 2), 'utf-8');
}

export async function getCandidatesByVacancy(vacancyId) {
  const candidates = await readCandidates();
  return candidates.filter((c) => c.vacancyId === vacancyId);
}

export async function getCandidateByPhone(phone) {
  const candidates = await readCandidates();
  const digits = phone.replace(/\D/g, '');
  // Exact match first; fallback to suffix match (handles country-code differences)
  return (
    candidates.find((c) => c.phone === phone) ||
    candidates.find((c) => {
      const stored = c.phone.replace(/\D/g, '');
      return stored.endsWith(digits) || digits.endsWith(stored);
    }) ||
    null
  );
}

export async function createCandidate({ vacancyId, name, lastName, phone, email }) {
  const candidates = await readCandidates();
  const candidate = {
    id: `c-${uuidv4().slice(0, 8)}`,
    vacancyId,
    name,
    lastName,
    phone,
    email,
    status: 'contactado',
    conversationStage: 'awaiting_acceptance',
    createdAt: new Date().toISOString(),
  };
  candidates.push(candidate);
  await writeCandidates(candidates);
  return candidate;
}

export async function updateCandidate(id, updates) {
  const candidates = await readCandidates();
  const index = candidates.findIndex((c) => c.id === id);
  if (index === -1) return null;
  candidates[index] = { ...candidates[index], ...updates };
  await writeCandidates(candidates);
  return candidates[index];
}
