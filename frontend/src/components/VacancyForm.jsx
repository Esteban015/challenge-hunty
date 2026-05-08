import { useState } from 'react';
import { api } from '../api/client';

const INITIAL = { name: '', area: '', location: '', description: '' };

export default function VacancyForm({ onCreated, onClose }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const vacancy = await api.createVacancy(form);
      onCreated(vacancy);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/40">
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
        <h2 className="mb-4 font-semibold text-gray-800 text-lg">New Vacancy</h2>

        {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Name</label>
            <input
              data-testid="input-vacancy-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Recruiting Area</label>
            <input
              data-testid="input-vacancy-area"
              name="area"
              value={form.area}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Location</label>
            <input
              data-testid="input-vacancy-location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Description</label>
            <textarea
              data-testid="input-vacancy-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              data-testid="btn-cancel"
              onClick={onClose}
              className="hover:bg-gray-50 px-4 py-2 border rounded-lg text-gray-700 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="btn-submit-vacancy"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 rounded-lg text-white text-sm"
            >
              {loading ? 'Creating…' : 'Create Vacancy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
