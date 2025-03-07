import { Metadata } from "next";
import { supabase } from "@/lib/supabase";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch pipeline name
  try {
    const { data } = await supabase
      .from('pipeline_configs')
      .select('pipeline_name')
      .eq('id', params.id)
      .single();
    
    const pipelineName = data?.pipeline_name || 'Pipeline Content';
    
    return {
      title: `${pipelineName} | OxiNews`,
      description: `View content for ${pipelineName}`,
    };
  } catch {
    return {
      title: 'Pipeline Content | OxiNews',
      description: 'View pipeline content',
    };
  }
}

export default function PipelineContentLayout({ children }: Props) {
  return <>{children}</>;
}
