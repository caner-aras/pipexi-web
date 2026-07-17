import { AlertTriangle } from "lucide-react";

interface HealthCheckResponse {
  status: string;
  checks?: Array<{
    name: string;
    status: string;
    description?: string | null;
  }>;
}

export async function HealthBanner() {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) return null;

  const healthUrl = backendUrl.replace(/\/api\/v1\/?$/, "") + "/health";
  let isHealthy = true;

  try {
    const res = await fetch(healthUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    // Even if status is 503 (which is not ok), we can parse the JSON to check if postgres is healthy
    const data = (await res.json()) as HealthCheckResponse;
    const postgresCheck = data?.checks?.find((c) => c.name === "postgres");
    if (!postgresCheck || postgresCheck.status !== "Healthy") {
      isHealthy = false;
    }
  } catch (error) {
    isHealthy = false;
  }

  if (isHealthy) return null;

  return (
    <>
      <style>{`
        header.fixed {
          top: 40px !important;
        }
        body {
          margin-top: 40px !important;
        }
      `}</style>
      <div className="fixed top-0 left-0 right-0 z-[9999] flex h-10 w-full items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 px-4 text-center text-xs font-semibold text-white shadow-md transition-all duration-300 md:text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-150 animate-bounce" />
        <span>
          We are experiencing technical issues and are currently investigating. Some features may be temporarily unavailable.
        </span>
      </div>
    </>
  );
}
