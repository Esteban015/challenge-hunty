import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CandidateTable from '../components/CandidateTable';
import CandidateForm from '../components/CandidateForm';
import { api } from '../api/client';

export default function CandidatesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [vacanciesData, candidatesData] = await Promise.all([
        api.getVacancies(),
        api.getCandidates(id),
      ]);
      const found = vacanciesData.find((v) => v.id === id);
      setVacancy(found || null);
      setCandidates(candidatesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  function handleCandidateCreated(candidate) {
    setCandidates((prev) => [...prev, candidate]);
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center mx-auto px-6 py-4 max-w-6xl">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <button
              onClick={() => navigate('/')}
              className="hover:text-blue-600 transition-colors"
            >
              Job Positions
            </button>
            <span>/</span>
            <span className="font-medium text-gray-800">
              {vacancy ? vacancy.name : id}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              data-testid="btn-refresh-candidates"
              onClick={loadData}
              className="hover:bg-gray-50 px-3 py-2 border rounded-lg text-gray-700 text-sm"
            >
              Refresh
            </button>
            <button
              data-testid={`btn-add-candidate-${id}`}
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white text-sm"
            >
              + Add Candidate
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-6 py-8 max-w-6xl">
        <h2 className="font-semibold text-gray-700 text-lg">Candidates</h2>

        {loading && <p className="mt-4 text-gray-500 text-sm">Loading…</p>}
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

        {!loading && !error && <CandidateTable candidates={candidates} />}
      </main>

      {showForm && vacancy && (
        <CandidateForm
          vacancy={vacancy}
          onCreated={handleCandidateCreated}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
