const fs = require('fs');
const path = require('path');

const CANDIDATES_FILE = path.resolve(__dirname, '../../backend/src/data/candidates.json');

function cleanupCandidatesByPhone(phone) {
  if (!phone) return;
  try {
    const raw = fs.readFileSync(CANDIDATES_FILE, 'utf-8');
    const candidates = JSON.parse(raw);
    const digits = phone.replace(/\D/g, '');
    const filtered = candidates.filter((c) => {
      const stored = c.phone.replace(/\D/g, '');
      return !stored.endsWith(digits) && !digits.endsWith(stored);
    });
    fs.writeFileSync(CANDIDATES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    const removed = candidates.length - filtered.length;
    if (removed > 0) console.log(`[Cleanup] Removed ${removed} candidate(s) with phone ${phone}`);
  } catch (err) {
    console.warn('[Cleanup] Could not clean candidates:', err.message);
  }
}

module.exports = { cleanupCandidatesByPhone };
