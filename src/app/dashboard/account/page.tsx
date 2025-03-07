import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | OxiNews",
  description: "Manage your account settings",
};

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Account settings will be available soon
      </div>
    </div>
  );
}
