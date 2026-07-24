"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Position } from "@/types/position";

interface PositionFormProps {
  organizationId: string;
  currency?: string;
  position: Position | null;
  defaults?: Pick<Position, "title" | "defaultHourlyRate" | "description"> | null;
  onCancel: () => void;
  onSaved: () => void;
}

function PositionForm({
  organizationId,
  currency = "USD",
  position,
  defaults = null,
  onCancel,
  onSaved,
}: PositionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(position);

  const [title, setTitle] = useState(position?.title ?? defaults?.title ?? "");
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(
    position
      ? String(position.defaultHourlyRate)
      : defaults
        ? String(defaults.defaultHourlyRate)
        : "15"
  );
  const [description, setDescription] = useState(
    position?.description ?? defaults?.description ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(position?.title ?? defaults?.title ?? "");
    setDefaultHourlyRate(
      position
        ? String(position.defaultHourlyRate)
        : defaults
          ? String(defaults.defaultHourlyRate)
          : "15"
    );
    setDescription(position?.description ?? defaults?.description ?? "");
    setError(null);
  }, [position, defaults]);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Position title is required.");
      return;
    }

    const parsedRate = Number(defaultHourlyRate);
    if (Number.isNaN(parsedRate) || parsedRate < 0) {
      setError("Please enter a valid hourly rate.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      defaultHourlyRate: parsedRate,
      description: description.trim() || null,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/positions/${position!.id}`
          : `/api/organizations/${organizationId}/positions`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          body.message ??
          (isEditing ? "Failed to update position." : "Failed to create position.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing
          ? "Position updated successfully"
          : "Position created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update position."
        : "Failed to create position.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Boolean(title.trim()) && !Number.isNaN(Number(defaultHourlyRate));

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {error ? (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="position-title">Position title *</Label>
          <Input
            id="position-title"
            placeholder="e.g. Waiter, Cashier, Shift Supervisor"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position-hourly-rate">
            Default hourly rate ({currency}/hr) *
          </Label>
          <Input
            id="position-hourly-rate"
            type="number"
            step="0.5"
            min="0"
            placeholder="15.00"
            value={defaultHourlyRate}
            onChange={(e) => setDefaultHourlyRate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position-description">Description</Label>
          <Input
            id="position-description"
            placeholder="Optional position details or requirements"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save changes"
              : "Create position"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface PositionDrawerProps {
  organizationId: string;
  currency?: string;
  position: Position | null;
  defaults?: Pick<Position, "title" | "defaultHourlyRate" | "description"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PositionDrawer({
  organizationId,
  currency = "USD",
  position,
  defaults = null,
  open,
  onOpenChange,
}: PositionDrawerProps) {
  const isEditing = Boolean(position);

  function handleCancel() {
    onOpenChange(false);
  }

  function handleSaved() {
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {isEditing
              ? "Edit position"
              : defaults
                ? "Duplicate position"
                : "New position"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${position?.title} details.`
              : defaults
                ? "Create a copy of this position."
                : "Define a new position title and default hourly rate for this organization."}
          </DrawerDescription>
        </DrawerHeader>

        <PositionForm
          key={
            position?.id ??
            (defaults ? `duplicate-${defaults.title}` : "new")
          }
          organizationId={organizationId}
          currency={currency}
          position={position}
          defaults={defaults}
          onCancel={handleCancel}
          onSaved={handleSaved}
        />
      </DrawerContent>
    </Drawer>
  );
}
