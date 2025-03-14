import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OnboardingProvider } from "@/components/providers/OnboardingProvider";

export const metadata: Metadata = {
  title: "Dashboard | OxiNews",
  description: "OxiNews Dashboard",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </OnboardingProvider>
  );
}
