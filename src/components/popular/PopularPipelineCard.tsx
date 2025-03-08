"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface PopularPipelineCardProps {
  id: string;
  name: string;
}

export function PopularPipelineCard({ id, name }: PopularPipelineCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/popular/${id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:bg-accent transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-6 flex items-center justify-center">
        <h3 className="text-xl font-medium text-center">{name}</h3>
      </CardContent>
    </Card>
  );
}
