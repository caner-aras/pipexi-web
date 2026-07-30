"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NavLink as Link } from "@/components/ui/nav-link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Square, CheckSquare } from "lucide-react";
import { useForm } from "react-hook-form";

import { BrandLogo } from "@/components/layout/brand-logo";
import { TimezonePicker } from "@/components/organizations/timezone-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { POPULAR_CURRENCIES } from "@/lib/organization-currencies";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/auth";
import type { OrganizationRole } from "@/types/role";
import type { Team } from "@/types/team";

type WizardStep = "account" | "company" | "location" | "member" | "done";

const STEP_ORDER: WizardStep[] = [
  "account",
  "company",
  "location",
  "member",
  "done",
];

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
    </svg>
  );
}

function StepProgress({
  step,
  includeAccount,
}: {
  step: WizardStep;
  includeAccount: boolean;
}) {
  const steps = includeAccount
    ? STEP_ORDER.filter((item) => item !== "done")
    : STEP_ORDER.filter((item) => item !== "account" && item !== "done");
  const activeIndex = Math.max(
    0,
    steps.findIndex((item) => item === step)
  );
  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className="mt-8 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {activeIndex + 1} of {steps.length}
        </span>
        <span className="capitalize">{step === "member" ? "Team member" : step}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

async function selectOrganization(organizationId: string) {
  await fetch("/api/organizations/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });
}

interface OnboardingWizardProps {
  initialStep?: Extract<WizardStep, "account" | "company">;
}

export function OnboardingWizard({
  initialStep = "account",
}: OnboardingWizardProps) {
  const router = useRouter();
  const includeAccount = initialStep === "account";
  const [step, setStep] = useState<WizardStep>(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const showLogout = !includeAccount || step !== "account";

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<OrganizationRole[]>([]);

  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [timezone, setTimezone] = useState<string | null>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [currency, setCurrency] = useState("USD");

  const [addLocation, setAddLocation] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  const [addMember, setAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberLastName, setMemberLastName] = useState("");
  const [memberJobTitle, setMemberJobTitle] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRoleId, setMemberRoleId] = useState<string | null>(null);
  const [memberTeamId, setMemberTeamId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isRegistering },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const currencyItems = useMemo(
    () =>
      POPULAR_CURRENCIES.map((item) => ({
        value: item.code,
        label: `${item.code} · ${item.name}`,
      })),
    []
  );

  const roleItems = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles]
  );

  const teamItems = useMemo(
    () =>
      teams.map((team) => ({
        value: team.id,
        label: team.name,
      })),
    [teams]
  );

  useEffect(() => {
    if (roles.length === 0) {
      return;
    }

    const preferred =
      roles.find((role) => role.name.toLowerCase() !== "owner") ?? roles[0];
    setMemberRoleId((current) => current ?? preferred.id);
  }, [roles]);

  useEffect(() => {
    if (teams.length === 0) {
      return;
    }

    setMemberTeamId((current) => current ?? teams[0].id);
  }, [teams]);

  async function loadOrgContext(organizationId: string) {
    const [teamsRes, rolesRes] = await Promise.all([
      fetch(`/api/organizations/${organizationId}/teams`),
      fetch(`/api/organizations/${organizationId}/roles`),
    ]);

    const teamsBody = (await teamsRes.json()) as {
      data?: Team[];
      message?: string;
    };
    const rolesBody = (await rolesRes.json()) as {
      data?: OrganizationRole[];
      message?: string;
    };

    if (teamsRes.ok && Array.isArray(teamsBody.data)) {
      setTeams(teamsBody.data);
    }

    if (rolesRes.ok && Array.isArray(rolesBody.data)) {
      setRoles(rolesBody.data);
    }
  }

  function handleCompanyNameChange(value: string) {
    setCompanyName(value);
    if (!isSlugManual) {
      setCompanySlug(slugify(value));
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = "/api/auth/google/login";
  };

  async function onRegister(values: RegisterFormValues) {
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        message?: string;
        accessTokenSet?: boolean;
      };

      if (!response.ok) {
        setError(data.message ?? "Registration failed. Please try again.");
        return;
      }

      setStep("company");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  async function onCreateCompany() {
    if (!companyName.trim() || !companySlug.trim() || !timezone) {
      setError("Company name, slug, and timezone are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName.trim(),
          slug: companySlug.trim(),
          timezone,
          currency,
        }),
      });

      const body = (await response.json()) as {
        data?: Organization;
        message?: string;
      };

      if (!response.ok || !body.data) {
        setError(body.message ?? "Failed to create company.");
        return;
      }

      setOrganization(body.data);
      await selectOrganization(body.data.id);
      await loadOrgContext(body.data.id);

      if (!locationName.trim()) {
        setLocationName("Main branch");
      }

      setStep("location");
    } catch {
      setError("Failed to create company.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onCreateLocation() {
    if (!organization) {
      setError("Create your company first.");
      return;
    }

    if (!addLocation) {
      setStep("member");
      return;
    }

    if (!locationName.trim() || !locationAddress.trim() || !timezone) {
      setError("Location name, address, and timezone are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/locations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: locationName.trim(),
            address: locationAddress.trim(),
            latitude: 0,
            longitude: 0,
            geofenceRadiusMeters: 200,
            timezone,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(body.message ?? "Failed to create location.");
        return;
      }

      setStep("member");
    } catch {
      setError("Failed to create location.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onAddMember() {
    if (!organization) {
      setError("Create your company first.");
      return;
    }

    if (!addMember) {
      setStep("done");
      return;
    }

    if (
      !memberEmail.trim() ||
      !memberFirstName.trim() ||
      !memberLastName.trim() ||
      !memberJobTitle.trim() ||
      !memberRoleId ||
      !memberTeamId
    ) {
      setError("Please fill in the member details or skip this step.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/teams/${memberTeamId}/members/onboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: memberEmail.trim(),
            firstName: memberFirstName.trim(),
            lastName: memberLastName.trim(),
            roleId: memberRoleId,
            jobTitle: memberJobTitle.trim(),
            phone: memberPhone.trim() ? memberPhone.trim() : null,
            avatarUrl: null,
            authProviderId: null,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(body.message ?? "Failed to add team member.");
        return;
      }

      setStep("done");
    } catch {
      setError("Failed to add team member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setError(null);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setError("Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center">
          <BrandLogo size="lg" priority />
        </div>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-6" />
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          You&apos;re all set
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your workspace is ready. You can manage teams, shifts, and members from
          the dashboard.
        </p>

        <div className="mt-8 w-full space-y-3">
          <Button type="button" className="w-full" onClick={goToDashboard}>
            Go to dashboard
          </Button>
          {showLogout ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="animate-spin" />
                  Logging out...
                </>
              ) : (
                "Log out"
              )}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <BrandLogo size="lg" priority />
      </div>

      <StepProgress step={step} includeAccount={includeAccount} />

      {step === "account" ? (
        <>
          <h1 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
            Create your workspace account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-8 grid gap-2 sm:grid-cols-1">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-border/50 bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              <GoogleIcon className="size-4 shrink-0" aria-hidden />
              Sign up with Google
            </button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName" className="font-medium">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="mt-2 shadow-sm"
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="lastName" className="font-medium">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="mt-2 shadow-sm"
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="mt-1.5 text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                autoComplete="email"
                className="mt-2 shadow-sm"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1.5 text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="password" className="font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                className="mt-2 shadow-sm"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-1.5 text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="mt-2 w-full" disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </>
      ) : null}

      {step === "company" ? (
        <div className="mt-8 space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Create your company
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This sets up your workspace. You&apos;ll be the organization owner.
            </p>
          </div>

          <div>
            <Label htmlFor="companyName" className="font-medium">
              Company name
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(event) => handleCompanyNameChange(event.target.value)}
              placeholder="Acme Inc."
              className="mt-2 shadow-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="companySlug" className="font-medium">
              Workspace slug
            </Label>
            <Input
              id="companySlug"
              value={companySlug}
              onChange={(event) => {
                setCompanySlug(slugify(event.target.value));
                setIsSlugManual(event.target.value.trim().length > 0);
              }}
              placeholder="acme-inc"
              className="mt-2 shadow-sm font-mono text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label className="font-medium">Timezone</Label>
            <div className="mt-2">
              <TimezonePicker
                value={timezone}
                onValueChange={setTimezone}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label className="font-medium">Currency</Label>
            <Select
              items={currencyItems}
              value={currency}
              onValueChange={(value) => {
                if (value) {
                  setCurrency(value);
                }
              }}
            >
              <SelectTrigger className="mt-2 w-full shadow-sm" disabled={isSubmitting}>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_CURRENCIES.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.code} · {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => void onCreateCompany()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Creating company...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      ) : null}

      {step === "location" ? (
        <div className="mt-8 space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Add a location
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional — you can add branches later from the dashboard.
            </p>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-3 text-left shadow-sm transition-colors hover:bg-muted/40"
            onClick={() => setAddLocation((value) => !value)}
            disabled={isSubmitting}
          >
            {addLocation ? (
              <CheckSquare className="size-5 shrink-0 text-foreground" />
            ) : (
              <Square className="size-5 shrink-0 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                Add a branch / location now
              </p>
              <p className="text-xs text-muted-foreground">
                Recommended for shift scheduling and geofencing.
              </p>
            </div>
          </button>

          {addLocation ? (
            <>
              <div>
                <Label htmlFor="locationName" className="font-medium">
                  Location name
                </Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder="Main branch"
                  className="mt-2 shadow-sm"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="locationAddress" className="font-medium">
                  Address
                </Label>
                <Input
                  id="locationAddress"
                  value={locationAddress}
                  onChange={(event) => setLocationAddress(event.target.value)}
                  placeholder="123 Main St"
                  className="mt-2 shadow-sm"
                  disabled={isSubmitting}
                />
              </div>
            </>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => void onCreateLocation()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : addLocation ? (
              "Continue"
            ) : (
              "Skip for now"
            )}
          </Button>
        </div>
      ) : null}

      {step === "member" ? (
        <div className="mt-8 space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Invite your first teammate?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional — onboard someone to your team, or skip and do it later.
            </p>
          </div>

          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border border-border/50 bg-background px-3 py-3 text-left shadow-sm transition-colors hover:bg-muted/40"
            )}
            onClick={() => setAddMember((value) => !value)}
            disabled={isSubmitting}
          >
            {addMember ? (
              <CheckSquare className="size-5 shrink-0 text-foreground" />
            ) : (
              <Square className="size-5 shrink-0 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                Add a team member now
              </p>
              <p className="text-xs text-muted-foreground">
                They&apos;ll join your Owners team by default.
              </p>
            </div>
          </button>

          {addMember ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="memberFirstName" className="font-medium">
                    First name
                  </Label>
                  <Input
                    id="memberFirstName"
                    value={memberFirstName}
                    onChange={(event) => setMemberFirstName(event.target.value)}
                    className="mt-2 shadow-sm"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="memberLastName" className="font-medium">
                    Last name
                  </Label>
                  <Input
                    id="memberLastName"
                    value={memberLastName}
                    onChange={(event) => setMemberLastName(event.target.value)}
                    className="mt-2 shadow-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="memberEmail" className="font-medium">
                  Email
                </Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={memberEmail}
                  onChange={(event) => setMemberEmail(event.target.value)}
                  placeholder="teammate@company.com"
                  className="mt-2 shadow-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="memberJobTitle" className="font-medium">
                  Job title
                </Label>
                <Input
                  id="memberJobTitle"
                  value={memberJobTitle}
                  onChange={(event) => setMemberJobTitle(event.target.value)}
                  placeholder="Field Staff"
                  className="mt-2 shadow-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="memberPhone" className="font-medium">
                  Phone (optional)
                </Label>
                <Input
                  id="memberPhone"
                  value={memberPhone}
                  onChange={(event) => setMemberPhone(event.target.value)}
                  className="mt-2 shadow-sm"
                  disabled={isSubmitting}
                />
              </div>

              {teams.length > 1 ? (
                <div>
                  <Label className="font-medium">Team</Label>
                  <Select
                    items={teamItems}
                    value={memberTeamId}
                    onValueChange={(value) => {
                      if (value) {
                        setMemberTeamId(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      className="mt-2 w-full shadow-sm"
                      disabled={isSubmitting}
                    >
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {roles.length > 0 ? (
                <div>
                  <Label className="font-medium">Role</Label>
                  <Select
                    items={roleItems}
                    value={memberRoleId}
                    onValueChange={(value) => {
                      if (value) {
                        setMemberRoleId(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      className="mt-2 w-full shadow-sm"
                      disabled={isSubmitting}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => void onAddMember()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving...
              </>
            ) : addMember ? (
              "Finish setup"
            ) : (
              "Skip for now"
            )}
          </Button>
        </div>
      ) : null}

      {showLogout ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need to switch accounts?{" "}
          <button
            type="button"
            className="font-medium text-foreground hover:underline disabled:opacity-50"
            disabled={isLoggingOut || isSubmitting}
            onClick={() => void handleLogout()}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </p>
      ) : null}
    </>
  );
}
