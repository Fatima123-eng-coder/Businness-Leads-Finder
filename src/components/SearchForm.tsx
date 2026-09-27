import { useState, type FormEvent } from 'react';
import type { RecentSearch } from '../types';

interface SearchFormProps {
  onSearch: (keyword: string, location: string) => void;
  isLoading: boolean;
  recentSearches: RecentSearch[];
}

export default function SearchForm({ onSearch, isLoading, recentSearches }: SearchFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) return;
    onSearch(keyword.trim(), location.trim());
  };

  const handleRecentClick = (search: RecentSearch) => {
    setKeyword(search.keyword);
    setLocation(search.location);
    onSearch(search.keyword, search.location);
  };

  return (
    <div className="search-card">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="keyword">Business Keyword</label>
          <input
            id="keyword"
            type="text"
            placeholder="e.g. Bakery, Restaurant, Pharmacy"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="location">City / Area</label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Lahore, Islamabad, Karachi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Searching…' : 'Find Businesses'}
        </button>
      </form>

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <span className="recent-label">Recent:</span>
          {recentSearches.map((s, i) => (
            <button
              key={`${s.keyword}-${s.location}-${i}`}
              type="button"
              className="chip"
              onClick={() => handleRecentClick(s)}
              disabled={isLoading}
            >
              {s.keyword} · {s.location}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
