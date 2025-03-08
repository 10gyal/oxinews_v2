import { Metadata } from "next";

// Use a static metadata object instead of dynamic generation
export const metadata: Metadata = {
  title: 'Pipeline Content | OxiNews',
  description: 'View pipeline content',
};

export default function PipelineContentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
