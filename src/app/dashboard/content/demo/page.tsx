"use client";

import { ContentTemplateDemo } from "@/components/dashboard/ContentTemplateDemo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ContentTemplateDemoPage() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push('/dashboard/content');
  };
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content
      </Button>
      
      <ContentTemplateDemo />
    </div>
  );
}
