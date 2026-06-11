import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Owner Dashboard | Reclaim & Restore",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AdminDashboard />
      </main>
      <Footer />
    </>
  );
}
