"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/components/layout/organization-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatLocalDateKey } from "@/lib/date-format";
import type { ShiftReportDataResponse, ShiftReportItem, ShiftReportEntry, ShiftReportSummary } from "@/types/reports";
import type { OrganizationMember } from "@/types/member";

import { getCurrencySymbol } from "@/lib/organization-currencies";

interface ShiftReportContentProps {
  members: OrganizationMember[];
}

export function ShiftReportContent({ members }: ShiftReportContentProps) {
  const { selectedOrganizationId: organizationId } = useOrganization();

  const [fromDate, setFromDate] = useState<string>(formatLocalDateKey(new Date()));
  const [toDate, setToDate] = useState<string>(formatLocalDateKey(new Date()));
  const [includeSummary, setIncludeSummary] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [report, setReport] = useState<ShiftReportDataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const buildQueryParams = () => {
    const searchParams = new URLSearchParams();
    searchParams.append("fromDate", fromDate);
    searchParams.append("toDate", toDate);
    if (includeSummary) {
      searchParams.append("includeSummary", "true");
    }
    selectedMemberIds.forEach(id => {
      searchParams.append("memberId", id);
    });
    return searchParams.toString();
  };

  const handleGenerate = async () => {
    if (!organizationId || !fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }
    setIsFetching(true);
    setError(null);
    setHasGenerated(true);

    try {
      const res = await fetch(`/api/organizations/${organizationId}/reports/shifts?${buildQueryParams()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to load report data");
      }
      const data = await res.json();
      setReport(data.data as ShiftReportDataResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!organizationId || !fromDate || !toDate) return;

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/reports/shifts/pdf?${buildQueryParams()}`);

      if (!res.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ShiftReport_${format(new Date(), "yyyyMMdd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to download PDF");
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleDraftMember = (id: string) => {
    setDraftMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setDraftMemberIds(members.map((m) => m.id));
  };

  const handleClearAll = () => {
    setDraftMemberIds([]);
  };

  const handleApplyMembers = () => {
    setSelectedMemberIds(draftMemberIds);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDraftMemberIds(selectedMemberIds);
    setSearchQuery("");
    setIsDialogOpen(true);
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
    const email = (member.user.email || "").toLowerCase();
    const jobTitle = (member.jobTitle || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query) || jobTitle.includes(query);
  });

  const currencySymbol = report ? getCurrencySymbol(report.currency) : "";

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Shift Report</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>
            Select a date range and filters to generate the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="space-y-2 flex-1 max-w-[200px]">
              <Label>From Date</Label>
              <DatePicker value={fromDate} onChange={setFromDate} showIcon />
            </div>

            <div className="space-y-2 flex-1 max-w-[200px]">
              <Label>To Date</Label>
              <DatePicker value={toDate} onChange={setToDate} showIcon />
            </div>

            <div className="space-y-2 flex-1 max-w-[250px]">
              <Label>Filter Members</Label>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (open) handleOpenDialog();
                else setIsDialogOpen(false);
              }}>
                <DialogTrigger render={
                  <Button variant="outline" className="w-full justify-between font-normal">
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      {selectedMemberIds.length === 0
                        ? "All Members"
                        : `${selectedMemberIds.length} Selected`}
                    </span>
                  </Button>
                } />
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Team Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Search members by name, email, or job title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex gap-2 text-xs">
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClearAll}>
                        Clear All
                      </Button>
                    </div>
                    <div className="border rounded-md max-h-[300px] overflow-y-auto divide-y divide-border/30">
                      {filteredMembers.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-4">
                          No members found.
                        </div>
                      ) : (
                        filteredMembers.map((member) => {
                          const isChecked = draftMemberIds.includes(member.id);
                          return (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => toggleDraftMember(member.id)}
                              className={cn(
                                "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                                isChecked && "bg-muted/60"
                              )}
                            >
                              <Checkbox
                                checked={isChecked}
                                className="pointer-events-none mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {member.user.firstName} {member.user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {member.user.email}
                                </p>
                                {member.jobTitle && (
                                  <p className="text-xs text-primary font-medium mt-0.5">
                                    {member.jobTitle}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApplyMembers}>
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleGenerate} disabled={isFetching}>
                {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>

              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={!report || isFetching || isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSummary"
              checked={includeSummary}
              onCheckedChange={(checked: boolean) => setIncludeSummary(checked)}
            />
            <Label htmlFor="includeSummary" className="cursor-pointer font-normal">
              Include Daily Totals Summary
            </Label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">
              Error loading report: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {hasGenerated && report && (
        <div className="space-y-6">
          <div>
            <div>
              <div className="text-lg font-medium mt-5">Detailed Shifts</div>
            </div>
            <div>
              {report.shifts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No shifts found in this period.
                </div>
              ) : (
                <div className="space-y-8 mt-5">
                  {report.shifts.map((shift: ShiftReportItem) => (
                    <div key={shift.shiftId} className="border rounded-md overflow-hidden">
                      <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
                        <div className="font-semibold text-base">{shift.employeeName}</div>
                        <div className="text-sm font-medium">
                          {format(new Date(shift.scheduledStartAt), "dd MMM yyyy")}
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-card border-b grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Scheduled Time</p>
                          <p className="font-medium">
                            {format(new Date(shift.scheduledStartAt), "HH:mm")} - {format(new Date(shift.scheduledEndAt), "HH:mm")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Sched. Hrs</p>
                          <p className="font-medium">{shift.scheduledHours.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Actual Hrs</p>
                          <p className="font-medium">{shift.actualHours.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Earnings</p>
                          <p className="font-medium">{currencySymbol}{shift.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {shift.entries.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead>Action</TableHead>
                              <TableHead>Time In</TableHead>
                              <TableHead>Time Out</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shift.entries.map((entry: ShiftReportEntry, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <span>
                                    {entry.action}
                                  </span>
                                </TableCell>
                                <TableCell>{entry.in ? format(new Date(entry.in), "HH:mm") : "-"}</TableCell>
                                <TableCell>{entry.out ? format(new Date(entry.out), "HH:mm") : "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {shift.entries.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground italic">
                          No time entries recorded for this shift.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {includeSummary && report.summary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Totals Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Sched. Hrs</TableHead>
                      <TableHead className="text-right">Actual Hrs</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.summary.map((day: ShiftReportSummary) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">
                          {format(new Date(day.date), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">{day.scheduledHours.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{day.actualHours.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {currencySymbol}{day.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Grand Totals row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Grand Total</TableCell>
                      <TableCell className="text-right">
                        {report.summary.reduce((acc: number, curr: ShiftReportSummary) => acc + curr.scheduledHours, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.summary.reduce((acc: number, curr: ShiftReportSummary) => acc + curr.actualHours, 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencySymbol}{report.summary.reduce((acc: number, curr: ShiftReportSummary) => acc + curr.earnings, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
