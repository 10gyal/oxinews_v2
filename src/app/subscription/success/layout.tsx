import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Success | OxiNews",
  description: "Thank you for subscribing to OxiNews Pro!",
};

export default function SubscriptionSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
