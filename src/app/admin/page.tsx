import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Owner Dashboard | Reclaim & Restore",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex-1">
      <AdminDashboard />
    </main>
  );
}
