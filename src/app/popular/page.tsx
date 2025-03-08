import { Metadata } from "next";
import { PopularPipelineList } from "@/components/popular/PopularPipelineList";

export const metadata: Metadata = {
  title: "Popular Content | OxiNews",
  description: "View popular content from OxiNews",
};

export default function PopularPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Popular Content</h1>
        <p className="text-muted-foreground mt-2">
          Explore trending content curated by OxiNews
        </p>
      </div>
      
      <PopularPipelineList />
    </div>
  );
}
