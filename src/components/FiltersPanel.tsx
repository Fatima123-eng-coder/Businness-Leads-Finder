import type { SearchFilters, SortOption } from '../types';

interface FiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  disabled: boolean;
}

const RATING_OPTIONS = [0, 1, 2, 3, 4, 4.5];

export default function FiltersPanel({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  disabled,
}: FiltersPanelProps) {
  return (
    <div className="filters-panel">
      <div className="filter-group">
        <label htmlFor="min-rating">Minimum Rating</label>
        <select
          id="min-rating"
          value={filters.minRating}
          disabled={disabled}
          onChange={(e) =>
            onFiltersChange({ ...filters, minRating: Number(e.target.value) })
          }
        >
          {RATING_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === 0 ? 'Any' : `${r}+ ★`}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.phoneRequired}
            disabled={disabled}
            onChange={(e) =>
              onFiltersChange({ ...filters, phoneRequired: e.target.checked })
            }
          />
          Phone Required
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.websiteRequired}
            disabled={disabled}
            onChange={(e) =>
              onFiltersChange({ ...filters, websiteRequired: e.target.checked })
            }
          />
          Website Required
        </label>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-field">Sort By</label>
        <select
          id="sort-field"
          value={sort.field}
          disabled={disabled}
          onChange={(e) =>
            onSortChange({ ...sort, field: e.target.value as SortOption['field'] })
          }
        >
          <option value="name">Business Name</option>
          <option value="rating">Rating</option>
          <option value="reviewCount">Review Count</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-direction">Direction</label>
        <select
          id="sort-direction"
          value={sort.direction}
          disabled={disabled}
          onChange={(e) =>
            onSortChange({ ...sort, direction: e.target.value as SortOption['direction'] })
          }
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
}
