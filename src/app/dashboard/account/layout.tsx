import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Account | OxiNews",
  description: "Manage your account settings",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
