"use client";

import { Loader2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationMemberProfile } from "@/types/organization-member-profile";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

interface TeamMemberProfilePanelProps {
  organizationId: string;
  organizationMemberId: string;
  profile: OrganizationMemberProfile | null;
}

export function TeamMemberProfilePanel({
  organizationId,
  organizationMemberId,
  profile,
}: TeamMemberProfilePanelProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [addressLine1, setAddressLine1] = useState(profile?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(profile?.addressLine2 ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [postalCode, setPostalCode] = useState(profile?.postalCode ?? "");
  const [country, setCountry] = useState(profile?.country ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile?.emergencyContactName ?? ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile?.emergencyContactPhone ?? ""
  );
  const [nationalId, setNationalId] = useState(profile?.nationalId ?? "");

  async function handleSave() {
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/organization-members/${organizationMemberId}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateOfBirth: dateOfBirth.trim() || null,
            gender: gender.trim() || null,
            addressLine1: addressLine1.trim() || null,
            addressLine2: addressLine2.trim() || null,
            city: city.trim() || null,
            state: state.trim() || null,
            postalCode: postalCode.trim() || null,
            country: country.trim() || null,
            emergencyContactName: emergencyContactName.trim() || null,
            emergencyContactPhone: emergencyContactPhone.trim() || null,
            nationalId: nationalId.trim() || null,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to save profile");
        return;
      }

      toast.success("Profile saved");
      router.refresh();
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-muted-foreground" />
            Personal profile
          </CardTitle>
          <CardDescription className="mt-1.5">
            Address, identity, and emergency contact details for this member.
          </CardDescription>
        </div>
        <Button size="sm" disabled={isSaving} onClick={() => void handleSave()}>
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save profile"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5 w-full max-w-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <DatePicker
              value={dateOfBirth}
              onChange={setDateOfBirth}
              showIcon
              buttonClassName="w-full bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              items={GENDER_OPTIONS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={gender || null}
              onValueChange={(value) => setGender(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nationalId">National ID</Label>
            <Input
              id="nationalId"
              value={nationalId}
              onChange={(event) => setNationalId(event.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input
              id="addressLine1"
              value={addressLine1}
              onChange={(event) => setAddressLine1(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input
              id="addressLine2"
              value={addressLine2}
              onChange={(event) => setAddressLine2(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / province</Label>
            <Input
              id="state"
              value={state}
              onChange={(event) => setState(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal code</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency contact</Label>
            <Input
              id="emergencyContactName"
              value={emergencyContactName}
              onChange={(event) => setEmergencyContactName(event.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Emergency phone</Label>
            <Input
              id="emergencyContactPhone"
              value={emergencyContactPhone}
              onChange={(event) => setEmergencyContactPhone(event.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
