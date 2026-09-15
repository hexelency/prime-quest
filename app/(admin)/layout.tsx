import AdminNavigation from "./components/AdminNavigation";

export default function AdminGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminNavigation>{children}</AdminNavigation>;
}
