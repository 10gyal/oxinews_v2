"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOnboarding } from "../providers/OnboardingProvider";
import { ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingOverlay() {
  const { isOnboarding, completeOnboarding } = useOnboarding();
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleCreatePipeline = async () => {
    setOpen(false);
    router.push("/dashboard/create-pipeline");
  };

  const handleSkip = async () => {
    await completeOnboarding();
    setOpen(false);
  };

  if (!isOnboarding) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to OxiNews!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Let&apos;s get you started with your first content pipeline.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">What is a Pipeline?</h3>
            <p className="text-sm text-muted-foreground">
              A pipeline is how you collect and organize content from various sources.
              Create a pipeline to start receiving personalized content tailored to your interests.
            </p>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Create your first pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to set up your first content source
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="sm:mr-auto">
            Skip for now
          </Button>
          <Button onClick={handleCreatePipeline}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
