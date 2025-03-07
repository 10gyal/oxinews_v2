import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content | OxiNews",
  description: "Manage your content",
};

export default function ContentPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Content</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Content management will be available soon
      </div>
    </div>
  );
}
