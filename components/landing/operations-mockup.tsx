import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface OperationsMockupProps {
  className?: string;
  rosterTitle?: string;
  rosterStatus?: string;
  shifts?: { name: string; time: string; role: string; bgClass: string; textClass: string; borderClass: string }[];
  geofenceTitle?: string;
  geofenceStatus?: string;
  locationName?: string;
}

export function OperationsMockup({
  className,
  rosterTitle = "Weekly Shifts",
  rosterStatus = "Active",
  shifts = [
    { name: "Sarah Connor", time: "09:00 - 17:00", role: "Manager", bgClass: "bg-orange-50", textClass: "text-orange-700", borderClass: "border-orange-100" },
    { name: "John Doe", time: "10:00 - 18:30", role: "Sales", bgClass: "bg-emerald-50", textClass: "text-emerald-700", borderClass: "border-emerald-100" },
    { name: "Alex Mercer", time: "12:00 - 20:00", role: "Security", bgClass: "bg-zinc-50", textClass: "text-zinc-700", borderClass: "border-zinc-200" }
  ],
  geofenceTitle = "GPS Geofence Check",
  geofenceStatus = "Verified",
  locationName = "North London Store"
}: OperationsMockupProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-white rounded-[3rem] border border-zinc-200 shadow-xl overflow-hidden flex flex-col p-8 gap-6 text-left",
        className
      )}
    >
      {/* Schedule Mockup Header */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">{rosterTitle}</h4>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
          {rosterStatus}
        </span>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-3 gap-3">
        {shifts.map((shift, i) => (
          <div key={i} className={cn("rounded-xl p-3 space-y-1 border", shift.bgClass, shift.borderClass)}>
            <div className={cn("text-xs font-black tracking-wide uppercase opacity-75", shift.textClass)}>
              {shift.role}
            </div>
            <div className="text-[13px] font-extrabold text-zinc-950 truncate">{shift.name}</div>
            <div className="text-[10px] font-bold text-zinc-500">{shift.time}</div>
          </div>
        ))}
      </div>

      {/* Geofence Clock-in Verification card */}
      <div className="flex-1 bg-zinc-50 rounded-2xl border border-zinc-100 p-5 space-y-4">
        <div className="flex items-center gap-4 border-b border-zinc-200/60 pb-3">
          <div className="size-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e86a3d] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#e86a3d]" />
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-black text-zinc-400 uppercase tracking-wider">{geofenceTitle}</div>
            <div className="text-sm font-extrabold text-zinc-900">{locationName}</div>
          </div>
          <span className="ml-auto text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
            {geofenceStatus}
          </span>
        </div>
        <p className="text-xs font-semibold leading-relaxed text-zinc-550">
          Staff member clocked in successfully. Device location verified within 15 meters of store perimeter boundary.
        </p>
      </div>
    </div>
  );
}
