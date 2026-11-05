import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";

export const metadata: Metadata = {
  title: "Patient Portal — In Development | NHCAF",
  description: "The NHCAF patient portal is not operational. No accounts, applications, or uploads are available.",
  alternates: { canonical: "/portal" },
  robots: { index: false, follow: false },
};

export default function PatientPortalLayout({ children }: { children: ReactNode }) {
  return <PlatformLayout>{children}</PlatformLayout>;
}
