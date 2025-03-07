import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Pipeline | OxiNews",
  description: "Edit your content pipeline",
};

export default function EditPipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
