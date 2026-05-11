require('dotenv').config();

const { setWorldConstructor, World } = require('@cucumber/cucumber');

class AppWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.page = null;
    this.vacancyId = null;
    this.candidateId = null;
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.apiUrl = process.env.API_URL || 'http://localhost:3000/api';
    this.serverPhone = process.env.SERVER_PHONE || '';
    this.candidatePhone = process.env.CANDIDATE_PHONE || '';
  }

  async apiGet(path) {
    const res = await fetch(`${this.apiUrl}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async apiPost(path, body) {
    const res = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`POST ${path} failed: ${res.status} — ${err.error || 'Unknown error'}`);
    }
    return res.json();
  }

  async pollCandidateStatus(expectedStatus, maxWaitMs = 30000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const candidates = await this.apiGet(`/vacancies/${this.vacancyId}/candidates`);
      const candidate = candidates.find((c) => c.id === this.candidateId);
      if (candidate?.status === expectedStatus) return candidate;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(`Candidate status did not reach "${expectedStatus}" within ${maxWaitMs}ms`);
  }
}

setWorldConstructor(AppWorld);
