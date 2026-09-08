import { redirect } from 'next/navigation';

// Root redirects to /app for now (Phase 7: add landing page)
export default function RootPage() {
  redirect('/app');
}
