"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface ContentPipelineCardProps {
  id: string;
  name: string;
}

export function ContentPipelineCard({ id, name }: ContentPipelineCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/dashboard/content/${id}`);
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
