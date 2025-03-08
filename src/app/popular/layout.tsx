import { Layout } from "@/components/layout/Layout";
import { ReactNode } from "react";

export default function PopularLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
