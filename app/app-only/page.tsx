"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Smartphone, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AppOnlyPage() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Force a refresh to clear server components and middleware state
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <BrandLogo size="lg" priority className="mb-8" />
      <div className="flex max-w-md flex-col items-center space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="size-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">App Access Required</h1>
          <p className="text-muted-foreground">
            The web dashboard is currently restricted to organization owners. 
            Please download and use the Pipexi mobile application to continue.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 pt-4">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 size-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
