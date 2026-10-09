// Root page — middleware rewrites this to /marketing on the root domain,
// or /app/dashboard on app.* subdomain, or /admin/dashboard on admin.* subdomain.
// This file is kept as a minimal pass-through.
export default function RootPage() {
  return null;
}
