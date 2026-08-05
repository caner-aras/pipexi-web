"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Listen for auth state changes (Supabase extracts hash tokens from the URL automatically)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // This event fires if the user clicks a recovery/invite link
          console.log("Password recovery session established.");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(values: UpdatePasswordFormValues) {
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);
      // Sign out to prevent them from lingering in a web session (as they are not an owner)
      await supabase.auth.signOut();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        <BrandLogo size="lg" priority />
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="size-16 text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Password Set Successfully!
          </h1>
          <p className="text-muted-foreground">
            Your account is now ready. The web dashboard is reserved for organization owners.
            Please download the Pipexi app from the App Store or Google Play to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <BrandLogo size="lg" priority />
      </div>

      <h1 className="mt-20 text-xl font-semibold tracking-tight text-foreground">
        Set your password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome! Please choose a secure password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="password" className="font-medium">
            New Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            className="mt-2 shadow-sm"
            aria-invalid={!!errors.password}
            disabled={isSubmitting}
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="font-medium">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="mt-2 shadow-sm"
            aria-invalid={!!errors.confirmPassword}
            disabled={isSubmitting}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Updating...
            </>
          ) : (
            "Set Password"
          )}
        </Button>
      </form>
    </>
  );
}
