"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 space-x-4">
        <Button onClick={() => router.push("/")}>Go Home</Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
