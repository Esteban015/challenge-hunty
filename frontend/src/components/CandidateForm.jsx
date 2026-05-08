import { useState } from 'react';
import { api } from '../api/client';

const INITIAL = { name: '', lastName: '', phone: '', email: '' };

export default function CandidateForm({ vacancy, onCreated, onClose }) {
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
      const candidate = await api.createCandidate(vacancy.id, form);
      onCreated(candidate);
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
        <h2 className="mb-1 font-semibold text-gray-800 text-lg">Add Candidate</h2>
        <p className="mb-4 text-gray-500 text-sm">Vacancy: <span className="font-medium text-gray-700">{vacancy.name}</span></p>

        {error && <p className="mb-3 text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="gap-4 grid grid-cols-2">
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">First Name</label>
              <input
                data-testid="input-candidate-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Last Name</label>
              <input
                data-testid="input-candidate-lastname"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">WhatsApp Number</label>
            <input
              data-testid="input-candidate-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="5215512345678"
              required
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Email</label>
            <input
              data-testid="input-candidate-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
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
              data-testid="btn-submit-candidate"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-2 rounded-lg text-white text-sm"
            >
              {loading ? 'Adding…' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
