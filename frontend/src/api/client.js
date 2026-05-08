const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getVacancies: () => request('/vacancies'),
  createVacancy: (data) => request('/vacancies', { method: 'POST', body: JSON.stringify(data) }),
  getCandidates: (vacancyId) => request(`/vacancies/${vacancyId}/candidates`),
  createCandidate: (vacancyId, data) =>
    request(`/vacancies/${vacancyId}/candidates`, { method: 'POST', body: JSON.stringify(data) }),
};
