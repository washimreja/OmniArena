export const metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Settings</h1>
      <p className="text-sm text-text-secondary mb-8">
        Account and preference management coming in Phase 7.
      </p>
      <div className="card-surface p-6">
        <p className="text-sm text-text-muted">
          ✦ Authentication and settings will be implemented in Phase 7 (Supabase Auth).
        </p>
      </div>
    </div>
  );
}
