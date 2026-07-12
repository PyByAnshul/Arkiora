export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Login page is a full-screen split layout — render children directly
  return <>{children}</>;
}
