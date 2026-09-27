import { useMemo, useState } from 'react';
import type { AppStatus, Business, SearchFilters, SortOption } from './types';
import {
  FIELD_MASK,
  PlacesApiError,
  searchBusinesses,
  type TextSearchRequest,
} from './services/googlePlaces';
import { getCachedSearch, setCachedSearch, pruneExpiredCache } from './utils/cache';
import { addRecentSearch, getRecentSearches } from './utils/recentSearches';
import { applyFilters, computeStats, dedupeBusinesses, sortBusinesses } from './utils/businessUtils';

import SearchForm from './components/SearchForm';
import FiltersPanel from './components/FiltersPanel';
import StatsCards from './components/StatsCards';
import ResultsTable from './components/ResultsTable';
import ExportButtons from './components/ExportButtons';
import MapView from './components/MapView';
import {
  GenericErrorState,
  LoadingState,
  MissingKeyState,
  NetworkErrorState,
  NoResultsState,
  QuotaErrorState,
} from './components/StatusStates';

const DEFAULT_FILTERS: SearchFilters = {
  minRating: 0,
  phoneRequired: false,
  websiteRequired: false,
};

const DEFAULT_SORT: SortOption = { field: 'rating', direction: 'desc' };
const PAGE_SIZE = 20;

function buildSearchRequest(keyword: string, location: string): TextSearchRequest {
  return {
    textQuery: `${keyword.trim()} in ${location.trim()}`,
    pageSize: PAGE_SIZE,
    fieldMask: FIELD_MASK,
  };
}

function App() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [rawResults, setRawResults] = useState<Business[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<{ keyword: string; location: string } | null>(null);
  const [originalSearchRequest, setOriginalSearchRequest] = useState<TextSearchRequest | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY as string | undefined;

  pruneExpiredCache();

  const runSearch = async (keyword: string, location: string) => {
    const searchRequest = buildSearchRequest(keyword, location);
    setLastQuery({ keyword, location });
    setOriginalSearchRequest(searchRequest);
    setNextPageToken(null);
    setStatus('loading');
    setErrorMessage('');

    const cached = getCachedSearch(keyword, location);
    if (cached) {
      setRawResults(cached.businesses);
      const cacheMatchesRequest = JSON.stringify(cached.searchRequest) === JSON.stringify(searchRequest);
      setNextPageToken(cacheMatchesRequest ? cached.nextPageToken : null);
      setStatus(cached.businesses.length === 0 ? 'no-results' : 'success');
      setRecentSearches(addRecentSearch(keyword, location));
      return;
    }

    try {
      const result = await searchBusinesses({ request: searchRequest });
      const deduped = dedupeBusinesses(result.businesses);

      setRawResults(deduped);
      setNextPageToken(result.nextPageToken);
      setCachedSearch(keyword, location, {
        businesses: deduped,
        nextPageToken: result.nextPageToken,
        searchRequest,
        timestamp: Date.now(),
      });
      setRecentSearches(addRecentSearch(keyword, location));
      setStatus(deduped.length === 0 ? 'no-results' : 'success');
    } catch (err) {
      if (err instanceof PlacesApiError) {
        setStatus(err.kind);
        setErrorMessage(err.message);
      } else {
        setStatus('error');
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const loadMore = async () => {
    if (!lastQuery || !originalSearchRequest || !nextPageToken || isBusy) return;
    setStatus('loading-more');
    try {
      const result = await searchBusinesses({
        request: originalSearchRequest,
        pageToken: nextPageToken,
      });
      const combined = dedupeBusinesses([...rawResults, ...result.businesses]);
      setRawResults(combined);
      setNextPageToken(result.nextPageToken);
      setCachedSearch(lastQuery.keyword, lastQuery.location, {
        businesses: combined,
        nextPageToken: result.nextPageToken,
        searchRequest: originalSearchRequest,
        timestamp: Date.now(),
      });
      setStatus('success');
    } catch (err) {
      if (err instanceof PlacesApiError) {
        setStatus(err.kind);
        setErrorMessage(err.message);
      } else {
        setStatus('error');
        setErrorMessage('An unexpected error occurred while loading more results.');
      }
    }
  };

  const filteredSorted = useMemo(() => {
    const filtered = applyFilters(rawResults, filters);
    return sortBusinesses(filtered, sort);
  }, [rawResults, filters, sort]);

  const stats = useMemo(() => computeStats(filteredSorted), [filteredSorted]);

  const hasResults = rawResults.length > 0;
  const isBusy = status === 'loading' || status === 'loading-more';

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Business Lead Finder</h1>
        <p className="subtitle">
          Search real businesses by keyword and city using Google Places API (New).
        </p>
      </header>

      <SearchForm onSearch={runSearch} isLoading={isBusy} recentSearches={recentSearches} />

      {!apiKey && status === 'idle' && <MissingKeyState />}

      {status === 'loading' && <LoadingState />}
      {status === 'missing-key' && <MissingKeyState />}
      {status === 'network-error' && (
        <NetworkErrorState
          onRetry={() => lastQuery && runSearch(lastQuery.keyword, lastQuery.location)}
        />
      )}
      {status === 'quota-error' && <QuotaErrorState />}
      {status === 'error' && <GenericErrorState message={errorMessage} />}
      {status === 'no-results' && <NoResultsState />}

      {hasResults && (status === 'success' || status === 'loading-more') && (
        <>
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            disabled={isBusy}
          />

          <StatsCards stats={stats} />

          <div className="toolbar">
            <ExportButtons businesses={filteredSorted} />
            {apiKey && <MapView businesses={filteredSorted} apiKey={apiKey} />}
          </div>

          <ResultsTable businesses={filteredSorted} />

          {nextPageToken && (
            <div className="load-more-wrapper">
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadMore}
                disabled={status === 'loading-more'}
              >
                {status === 'loading-more' ? 'Loading…' : 'Load More Results'}
              </button>
            </div>
          )}
        </>
      )}

      <footer className="app-footer">
        <p>University project · React + TypeScript + Vite · Google Places API (New)</p>
      </footer>
    </div>
  );
}

export default App;
