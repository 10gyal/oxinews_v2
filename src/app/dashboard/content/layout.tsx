import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content | OxiNews",
  description: "View your pipeline content",
};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
