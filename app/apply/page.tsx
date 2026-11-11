import type { Metadata } from "next";
import { AssistanceInquiry } from "@/components/assistance/AssistanceInquiry";
import "./assistance.css";

export const metadata: Metadata = { title: "Apply for Assistance | NHCAF", description: "Send an assistance inquiry to North Houston Cancer Assistance Foundation. No account or document upload is needed to start.", alternates: { canonical: "/apply" }, robots: { index: false, follow: false } };
export default function ApplyPage() { return <AssistanceInquiry />; }
