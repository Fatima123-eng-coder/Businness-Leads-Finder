import type { BusinessStats } from '../utils/businessUtils';

interface StatsCardsProps {
  stats: BusinessStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total Businesses</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.withPhone}</span>
        <span className="stat-label">With Phone</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.withWebsite}</span>
        <span className="stat-label">With Website</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">
          {stats.averageRating !== null ? stats.averageRating.toFixed(1) : '—'}
        </span>
        <span className="stat-label">Average Rating</span>
      </div>
    </div>
  );
}
