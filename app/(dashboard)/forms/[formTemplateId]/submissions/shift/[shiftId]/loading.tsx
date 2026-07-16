import { Skeleton } from "@/components/ui/skeleton";

export default function ShiftFormSubmissionLoading() {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-4 rounded-sm border border-border/50 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
