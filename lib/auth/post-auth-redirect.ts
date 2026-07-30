/**
 * Resolve where to send the user after login / OAuth sync.
 * New accounts with no organization continue workspace onboarding.
 */
export async function getPostAuthPath(): Promise<string> {
  try {
    const response = await fetch("/api/organizations");
    if (!response.ok) {
      return "/dashboard";
    }

    const body = (await response.json()) as { data?: unknown[] };
    if (Array.isArray(body.data) && body.data.length === 0) {
      return "/onboarding";
    }
  } catch {
    // Fall through to dashboard on network / parse errors.
  }

  return "/dashboard";
}
