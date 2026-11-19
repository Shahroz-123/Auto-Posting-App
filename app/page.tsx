import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/app/dashboard/page";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header />

        <Dashboard />

      </div>

    </main>
  );
}