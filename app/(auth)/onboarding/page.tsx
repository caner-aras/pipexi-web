import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { getOrganizations } from "@/lib/server/services/organization.service";

export default async function OnboardingPage() {
  try {
    const organizations = await getOrganizations();
    if (organizations.length > 0) {
      redirect("/dashboard");
    }
  } catch {
    // Continue with onboarding when org list cannot be loaded.
  }

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <OnboardingWizard initialStep="company" />
    </div>
  );
}
