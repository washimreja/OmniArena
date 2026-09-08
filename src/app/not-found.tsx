import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-accent mb-4">404</h1>
        <p className="text-text-secondary mb-6">Page not found.</p>
        <Link
          href="/app"
          className="px-4 py-2 bg-accent text-white rounded-btn text-sm hover:bg-accent-hover transition-colors"
        >
          Go to OmniArena
        </Link>
      </div>
    </div>
  );
}
