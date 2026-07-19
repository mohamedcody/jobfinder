import { Metadata } from "next";
import { ImmersiveHero } from "@/components/landing/immersive-hero";

export const metadata: Metadata = {
  title: "JobFinder PRO | Advanced AI Job Matching",
  description: "Stop searching. Start matching. JobFinder PRO uses AI to analyze your skills and find the perfect tech roles before they hit the open market.",
};

export default function Home() {
  return <ImmersiveHero />;
}
