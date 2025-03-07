"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleCreatePipeline}>
          <Plus className="h-4 w-4" />
          Create Pipeline
        </Button>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Welcome to your dashboard
      </div>
    </div>
  );
}
