const STATUS_STYLES = {
  contactado: 'bg-blue-100 text-blue-800',
  conversando: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  descalificado: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }) {
  const classes = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${classes}`}>
      {status}
    </span>
  );
}
