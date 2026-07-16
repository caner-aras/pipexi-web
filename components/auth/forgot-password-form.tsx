"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    try {
      // Mocking reset email action. In future, this will trigger backend endpoint.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResetEmail(values.email);
      setIsSuccess(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center">
          <BrandLogo size="lg" priority />
        </div>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <MailCheck className="size-6" />
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          Check your inbox
        </h1>

        <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
          If an account exists for <span className="font-semibold text-foreground">{resetEmail}</span>,
          we have sent a link to reset your password.
        </p>

        <div className="mt-8 w-full">
          <Link
            href="/login"
            className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow transition-colors hover:bg-primary/90"
          >
            Back to Sign in
          </Link>
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
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email address and we&apos;ll send you a link to get back into your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email" className="font-medium">
            Email address
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
          {errors.email && (
            <p className="mt-1.5 text-sm text-destructive">{errors.email.message}</p>
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
              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          You remember your password?{" "}
        </span>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Okay, {" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Go back to sign in
        </Link>
      </p>
    </>
  );
}
