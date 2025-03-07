import { Metadata } from "next";
import { ContentPipelineList } from "@/components/dashboard/ContentPipelineList";

export const metadata: Metadata = {
  title: "Content | OxiNews",
  description: "View your pipeline content",
};

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a pipeline to view its content
        </p>
      </div>
      
      <ContentPipelineList />
    </div>
  );
}
