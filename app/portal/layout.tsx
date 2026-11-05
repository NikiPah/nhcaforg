import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";

export const metadata: Metadata = {
  title: "Patient Portal — In Development | NHCAF",
  description: "NHCAF patient portal development. Real assistance applications and document uploads are not open.",
  alternates: { canonical: "/portal" },
  robots: { index: false, follow: false },
};

export default function PatientPortalLayout({ children }: { children: ReactNode }) {
  return <PlatformLayout>{children}</PlatformLayout>;
}
