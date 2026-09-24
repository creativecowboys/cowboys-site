import type { Metadata } from "next";
import IntakeForm from "./intake-form";

export const metadata: Metadata = {
  title: "Your onboarding — Creative Cowboys",
  description: "Share your business details, logo, brand colors and photos so we can get started.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

// Client intake. The token in the URL is the only credential (issued from the team desk, hashed at
// rest, expiring, revocable). The page itself is static; every read and save goes through
// /api/onboarding/<token>, which re-checks the token on each request.
export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <IntakeForm token={token} />;
}
