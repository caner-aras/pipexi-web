"use client";

import { useState } from "react";
import { NavLink as Link } from "@/components/ui/nav-link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);

    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.password }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(body.message ?? "Failed to update password.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
    } catch {
      setError("Failed to update password. Please try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="lg" priority />
        <h1 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <BrandLogo size="lg" priority />
      </div>

      <h1 className="mt-20 text-xl font-semibold tracking-tight text-foreground">
        Choose a new password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter a new password for your Pipexi account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="password" className="font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
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

        <div>
          <Label htmlFor="confirmPassword" className="font-medium">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-2 shadow-sm"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Updating...
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
