import { OnboardingWizard } from "@/components/auth/onboarding-wizard";

export default function RegisterPage() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <OnboardingWizard initialStep="account" />
    </div>
  );
}
