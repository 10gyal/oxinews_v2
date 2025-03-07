import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription | OxiNews",
  description: "Manage your OxiNews subscription",
};

export default function SubscriptionLayout({
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
