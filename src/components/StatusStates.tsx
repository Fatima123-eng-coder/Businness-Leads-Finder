interface StatusMessageProps {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'error';
}

function StatusMessage({ title, message, variant = 'info' }: StatusMessageProps) {
  return (
    <div className={`status-message status-${variant}`}>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="status-message status-loading">
      <div className="spinner" aria-label="Loading" />
      <p>Searching Google Places…</p>
    </div>
  );
}

export function NoResultsState() {
  return (
    <StatusMessage
      title="No businesses found"
      message="Try a different keyword or a broader city/area (e.g. remove neighborhood-level detail)."
      variant="info"
    />
  );
}

export function MissingKeyState() {
  return (
    <StatusMessage
      title="Google Maps API key missing"
      message="Add VITE_GOOGLE_MAPS_PLATFORM_KEY to a .env file at the project root (copy .env.example) and restart the dev server."
      variant="warning"
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="status-message status-error">
      <h3>Network error</h3>
      <p>Could not reach Google Places API. Check your internet connection.</p>
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export function QuotaErrorState() {
  return (
    <StatusMessage
      title="Daily quota exceeded"
      message="The Google Maps Demo Key has hit its request limit for now. Please try again later, or use a personal API key."
      variant="warning"
    />
  );
}

export function GenericErrorState({ message }: { message: string }) {
  return <StatusMessage title="Something went wrong" message={message} variant="error" />;
}
