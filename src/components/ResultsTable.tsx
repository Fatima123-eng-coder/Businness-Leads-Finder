import type { Business } from '../types';

interface ResultsTableProps {
  businesses: Business[];
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="badge badge-muted">Unknown</span>;
  const normalized = status.toLowerCase();
  const variant =
    normalized === 'operational'
      ? 'badge-success'
      : normalized === 'closed_temporarily'
      ? 'badge-warning'
      : normalized === 'closed_permanently'
      ? 'badge-danger'
      : 'badge-muted';
  return <span className={`badge ${variant}`}>{status.replaceAll('_', ' ')}</span>;
}

export default function ResultsTable({ businesses }: ResultsTableProps) {
  return (
    <div className="table-wrapper">
      <table className="results-table">
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Phone</th>
            <th>International Phone</th>
            <th>Address</th>
            <th>Website</th>
            <th>Rating</th>
            <th>Reviews</th>
            <th>Maps Link</th>
            <th>Status</th>
            <th>Place ID</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((b) => (
            <tr key={b.placeId}>
              <td className="cell-name">{b.name}</td>
              <td>{b.phone ?? '—'}</td>
              <td>{b.internationalPhone ?? '—'}</td>
              <td className="cell-address">{b.address ?? '—'}</td>
              <td>
                {b.website ? (
                  <a href={b.website} target="_blank" rel="noreferrer">
                    Visit
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>{b.rating !== null ? `${b.rating.toFixed(1)} ★` : '—'}</td>
              <td>{b.reviewCount ?? '—'}</td>
              <td>
                {b.googleMapsUri ? (
                  <a href={b.googleMapsUri} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td>
                <StatusBadge status={b.businessStatus} />
              </td>
              <td className="cell-id" title={b.placeId}>
                {b.placeId}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
