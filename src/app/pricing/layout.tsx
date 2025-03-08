import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | OxiNews",
  description: "Choose the right plan for your content needs",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
