import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Pipeline | OxiNews",
  description: "Create a new content pipeline",
};

export default function CreatePipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
