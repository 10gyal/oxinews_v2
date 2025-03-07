import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | OxiNews",
  description: "OxiNews Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Welcome to your dashboard
      </div>
    </div>
  );
}
