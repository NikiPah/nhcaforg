import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";

export const metadata: Metadata = {
  title: "Staff Portal — Not Operational | NHCAF",
  description: "NHCAF staff access is not available. This page contains no dashboard or patient records.",
  alternates: { canonical: "/staff" },
  robots: { index: false, follow: false },
};

// Informational shell only. Future data access requires server-side authorization
// at every read and mutation; this layout is not an authorization boundary.
export default function StaffPortalLayout({ children }: { children: ReactNode }) {
  return <PlatformLayout>{children}</PlatformLayout>;
}
