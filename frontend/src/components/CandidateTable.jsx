import StatusBadge from './StatusBadge';

export default function CandidateTable({ candidates }) {
  if (candidates.length === 0) {
    return <p className="mt-6 text-gray-500 text-sm">No candidates yet for this vacancy.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table data-testid="candidates-table" className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs text-left uppercase tracking-wide">
            <th className="px-4 py-3 border-b">Name</th>
            <th className="px-4 py-3 border-b">Email</th>
            <th className="px-4 py-3 border-b">WhatsApp</th>
            <th className="px-4 py-3 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr
              key={c.id}
              data-testid={`candidate-row-${c.id}`}
              className="hover:bg-gray-50 border-b transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-800">
                {c.name} {c.lastName}
              </td>
              <td className="px-4 py-3 text-gray-600">{c.email}</td>
              <td className="px-4 py-3 text-gray-600">{c.phone}</td>
              <td className="px-4 py-3">
                <span data-testid={`candidate-status-${c.id}`}>
                  <StatusBadge status={c.status} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
