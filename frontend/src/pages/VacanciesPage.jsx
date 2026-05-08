import { useState, useEffect } from 'react';
import VacancyTable from '../components/VacancyTable';
import VacancyForm from '../components/VacancyForm';
import CandidateForm from '../components/CandidateForm';
import { api } from '../api/client';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  async function loadVacancies() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getVacancies();
      setVacancies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVacancies();
  }, []);

  function handleVacancyCreated(vacancy) {
    setVacancies((prev) => [...prev, vacancy]);
  }

  function handleCandidateCreated() {
    // Candidate added — no refresh needed (no polling)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-6xl">
          <h1 className="font-bold text-gray-800 text-xl">Talent Acquisition Platform</h1>
          <button
            data-testid="btn-create-vacancy"
            onClick={() => setShowVacancyForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white text-sm"
          >
            + New Vacancy
          </button>
        </div>
      </header>

      <main className="mx-auto px-6 py-8 max-w-6xl">
        <h2 className="font-semibold text-gray-700 text-lg">Job Positions</h2>

        {loading && <p className="mt-4 text-gray-500 text-sm">Loading…</p>}
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

        {!loading && !error && (
          <VacancyTable
            vacancies={vacancies}
            onAddCandidate={(v) => setSelectedVacancy(v)}
          />
        )}
      </main>

      {showVacancyForm && (
        <VacancyForm
          onCreated={handleVacancyCreated}
          onClose={() => setShowVacancyForm(false)}
        />
      )}

      {selectedVacancy && (
        <CandidateForm
          vacancy={selectedVacancy}
          onCreated={handleCandidateCreated}
          onClose={() => setSelectedVacancy(null)}
        />
      )}
    </div>
  );
}
