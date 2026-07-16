import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col justify-center px-4 py-10 lg:px-6">
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to homepage</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
