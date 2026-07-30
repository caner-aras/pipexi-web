"use client";

import { Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { POPULAR_CURRENCIES } from "@/lib/organization-currencies";
import { formatLocalDateKey, getTodayDateKeyUtc } from "@/lib/date-format";
import type { OrganizationMemberPayment } from "@/types/organization-member-profile";

const METHOD_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "check", label: "Check" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;

interface TeamMemberPaymentsPanelProps {
  organizationId: string;
  organizationMemberId: string;
  payments: OrganizationMemberPayment[];
  defaultCurrency?: string | null;
}

interface PaymentFormState {
  amount: string;
  currency: string;
  paidAtDate: string;
  method: string;
  reference: string;
  notes: string;
  periodStart: string;
  periodEnd: string;
}

function emptyForm(defaultCurrency: string): PaymentFormState {
  return {
    amount: "",
    currency: defaultCurrency,
    paidAtDate: getTodayDateKeyUtc(),
    method: "bank_transfer",
    reference: "",
    notes: "",
    periodStart: "",
    periodEnd: "",
  };
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatPaidAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatMethod(method: string): string {
  return (
    METHOD_OPTIONS.find((item) => item.value === method)?.label ?? method
  );
}

function dateKeyToIsoStart(dateKey: string): string {
  return `${dateKey}T12:00:00.000Z`;
}

export function TeamMemberPaymentsPanel({
  organizationId,
  organizationMemberId,
  payments,
  defaultCurrency = "USD",
}: TeamMemberPaymentsPanelProps) {
  const router = useRouter();
  const currencyFallback = defaultCurrency?.trim().toUpperCase() || "USD";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<OrganizationMemberPayment | null>(null);
  const [form, setForm] = useState<PaymentFormState>(() =>
    emptyForm(currencyFallback)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [paymentToDelete, setPaymentToDelete] =
    useState<OrganizationMemberPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currencyItems = useMemo(
    () =>
      POPULAR_CURRENCIES.map((item) => ({
        value: item.code,
        label: `${item.code} · ${item.name}`,
      })),
    []
  );

  const methodItems = useMemo(
    () =>
      METHOD_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    []
  );

  function openCreate() {
    setEditingPayment(null);
    setForm(emptyForm(currencyFallback));
    setDialogOpen(true);
  }

  function openEdit(payment: OrganizationMemberPayment) {
    setEditingPayment(payment);
    setForm({
      amount: String(payment.amount),
      currency: payment.currency,
      paidAtDate: formatLocalDateKey(new Date(payment.paidAt)),
      method: payment.method,
      reference: payment.reference ?? "",
      notes: payment.notes ?? "",
      periodStart: payment.periodStart ?? "",
      periodEnd: payment.periodEnd ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    if (!form.paidAtDate || !form.method || !form.currency) {
      toast.error("Paid date, method, and currency are required.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        amount,
        currency: form.currency,
        paidAt: dateKeyToIsoStart(form.paidAtDate),
        method: form.method,
        reference: form.reference.trim() || null,
        notes: form.notes.trim() || null,
        periodStart: form.periodStart.trim() || null,
        periodEnd: form.periodEnd.trim() || null,
      };

      const url = editingPayment
        ? `/api/organizations/${organizationId}/organization-members/${organizationMemberId}/payments/${editingPayment.id}`
        : `/api/organizations/${organizationId}/organization-members/${organizationMemberId}/payments`;

      const response = await fetch(url, {
        method: editingPayment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to save payment");
        return;
      }

      toast.success(editingPayment ? "Payment updated" : "Payment added");
      setDialogOpen(false);
      setEditingPayment(null);
      router.refresh();
    } catch {
      toast.error("Failed to save payment");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!paymentToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/organization-members/${organizationMemberId}/payments/${paymentToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete payment");
        return;
      }

      toast.success("Payment deleted");
      setPaymentToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card className="rounded-sm shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="size-4 text-muted-foreground" />
              Payments
            </CardTitle>
            <CardDescription className="mt-1.5">
              Recorded payments for this organization member.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Add payment
          </Button>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payments yet"
              description="Add the first payment for this member."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paid at</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatPaidAt(payment.paidAt)}</TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{formatMethod(payment.method)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.periodStart || payment.periodEnd
                        ? `${payment.periodStart ?? "—"} → ${payment.periodEnd ?? "—"}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.reference || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(payment)}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit payment</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setPaymentToDelete(payment)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete payment</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? "Edit payment" : "Add payment"}
            </DialogTitle>
            <DialogDescription>
              Track when and how this member was paid.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                items={currencyItems}
                value={form.currency}
                onValueChange={(value) => {
                  if (value) {
                    setForm((current) => ({ ...current, currency: value }));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_CURRENCIES.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.code} · {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Paid at</Label>
              <DatePicker
                value={form.paidAtDate}
                onChange={(value) =>
                  setForm((current) => ({ ...current, paidAtDate: value }))
                }
                showIcon
                buttonClassName="w-full bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                items={methodItems}
                value={form.method}
                onValueChange={(value) => {
                  if (value) {
                    setForm((current) => ({ ...current, method: value }));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period start</Label>
              <DatePicker
                value={form.periodStart}
                onChange={(value) =>
                  setForm((current) => ({ ...current, periodStart: value }))
                }
                showIcon
                buttonClassName="w-full bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Period end</Label>
              <DatePicker
                value={form.periodEnd}
                onChange={(value) =>
                  setForm((current) => ({ ...current, periodEnd: value }))
                }
                showIcon
                buttonClassName="w-full bg-background"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="payment-reference">Reference</Label>
              <Input
                id="payment-reference"
                value={form.reference}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reference: event.target.value,
                  }))
                }
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Input
                id="payment-notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving...
                </>
              ) : editingPayment ? (
                "Save changes"
              ) : (
                "Add payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(paymentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentToDelete(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the payment record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
