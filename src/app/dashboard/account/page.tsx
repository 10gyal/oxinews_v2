"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { SubscriptionSection } from "@/components/account/SubscriptionSection";
import { PreferencesSection } from "@/components/account/PreferencesSection";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading) {
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
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesSection user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
