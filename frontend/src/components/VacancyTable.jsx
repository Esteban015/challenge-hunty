import { useNavigate } from 'react-router-dom';

export default function VacancyTable({ vacancies, onAddCandidate }) {
  const navigate = useNavigate();

  if (vacancies.length === 0) {
    return <p className="mt-6 text-gray-500 text-sm">No vacancies yet. Create one to get started.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table data-testid="vacancies-table" className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs text-left uppercase tracking-wide">
            <th className="px-4 py-3 border-b">Name</th>
            <th className="px-4 py-3 border-b">Area</th>
            <th className="px-4 py-3 border-b">Location</th>
            <th className="px-4 py-3 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vacancies.map((v) => (
            <tr
              key={v.id}
              data-testid={`vacancy-row-${v.id}`}
              className="hover:bg-gray-50 border-b transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
              <td className="px-4 py-3 text-gray-600">{v.area}</td>
              <td className="px-4 py-3 text-gray-600">{v.location}</td>
              <td className="space-x-2 px-4 py-3 text-right">
                <button
                  data-testid={`btn-view-candidates-${v.id}`}
                  onClick={() => navigate(`/vacancies/${v.id}/candidates`)}
                  className="hover:bg-gray-100 px-3 py-1.5 border rounded-lg text-gray-700 text-xs"
                >
                  View Candidates
                </button>
                <button
                  data-testid={`btn-add-candidate-${v.id}`}
                  onClick={() => onAddCandidate(v)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white text-xs"
                >
                  Add Candidate
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
