"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection, SecuritySection, SubscriptionSection } from "@/components/account";
import { Loader2 } from "lucide-react";

function AccountContent() {
  const { user, status } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Set active tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "security", "subscription"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSection user={user} />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection user={user} />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
