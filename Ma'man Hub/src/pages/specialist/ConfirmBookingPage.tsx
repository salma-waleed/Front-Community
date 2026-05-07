// pages/ConfirmBookingPage.tsx
// Step 2 of 2 — pay for the reserved slot.
// Fetches appointment data directly so countdown and price always work.

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Building, Smartphone, Wallet, Tag, ArrowLeft,
  CheckCircle2, Plus, Loader2, Lock, ChevronDown, ChevronUp,
  Shield, RotateCcw, Video, Clock, CalendarDays, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { userService, PaymentMethod } from "@/services/userService";
import { appointmentService } from "@/services/appointmentService";
import { cn } from "@/lib/utils";

// ─── Payment method helpers ───────────────────────────────────────────────────

enum PaymentMethodType {
  CARD = "card",
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  [PaymentMethodType.CARD]: <CreditCard className="h-4 w-4" />,
  [PaymentMethodType.VODAFONE_CASH]: <Smartphone className="h-4 w-4" />,
  [PaymentMethodType.INSTAPAY]: <Wallet className="h-4 w-4" />,
  [PaymentMethodType.FAWRY]: <CreditCard className="h-4 w-4" />,
  [PaymentMethodType.BANK_ACCOUNT]: <Building className="h-4 w-4" />,
};

const METHOD_LABEL: Record<string, string> = {
  [PaymentMethodType.CARD]: "Credit / Debit Card",
  [PaymentMethodType.VODAFONE_CASH]: "Vodafone Cash",
  [PaymentMethodType.INSTAPAY]: "Instapay",
  [PaymentMethodType.FAWRY]: "Fawry",
  [PaymentMethodType.BANK_ACCOUNT]: "Bank Account",
};

const blankForm = {
  cardNumber: "", cardholderName: "", expiryMonth: "", expiryYear: "", cvv: "",
  vodafoneNumber: "", instapayId: "", fawryNumber: "",
  accountHolderName: "", bankName: "", accountNumber: "", iban: "",
};

// ─── Hold countdown hook ──────────────────────────────────────────────────────

function useHoldCountdown(holdExpiresAtUtc?: string) {
  const getSecondsLeft = () => {
    if (!holdExpiresAtUtc) return 30 * 60;
    const diff = new Date(holdExpiresAtUtc).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  // Re-initialize when holdExpiresAtUtc becomes available (after fetch)
  useEffect(() => {
    setSecondsLeft(getSecondsLeft());
  }, [holdExpiresAtUtc]);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(getSecondsLeft()), 1000);
    return () => clearInterval(t);
  }, [holdExpiresAtUtc]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const expired = secondsLeft <= 0;
  const urgent = secondsLeft < 120;

  return { display: `${mm}:${ss}`, expired, urgent };
}

// ─── Location state interface ─────────────────────────────────────────────────

interface LocationState {
  specialistName?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  hourlyRate?: number;
  holdExpiresAtUtc?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfirmBookingPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState | undefined;

  // Always fetch the appointment — gives us fresh holdExpiresAtUtc and hourlyRate
  const { data: appointment, isLoading: loadingAppointment } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => appointmentService.getById(appointmentId!),
    enabled: !!appointmentId,
    refetchInterval: 10_000,
  });

  // Prefer fetched data (always fresh) over navigation state
  const specialistName   = appointment?.specialistName   ?? state?.specialistName   ?? "";
  const appointmentDate  = appointment?.appointmentDate  ?? state?.appointmentDate  ?? "";
  const startTime        = appointment?.startTime        ?? state?.startTime        ?? "";
  const endTime          = appointment?.endTime          ?? state?.endTime          ?? "";
  const title            = appointment?.title            ?? state?.title            ?? "";
  const hourlyRate       = appointment?.hourlyRate       ?? state?.hourlyRate;
  const holdExpiresAtUtc = appointment?.holdExpiresAtUtc ?? state?.holdExpiresAtUtc;

  const { display: holdTimer, expired: holdExpired, urgent } = useHoldCountdown(holdExpiresAtUtc);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newType, setNewType] = useState<PaymentMethodType>(PaymentMethodType.CARD);
  const [newForm, setNewForm] = useState(blankForm);
  const [savingMethod, setSavingMethod] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getPaymentMethods();
        setMethods(data);
        const def = data.find((m) => m.isDefault) ?? data[0];
        if (def) setSelectedMethodId(def.id);
      } catch {
        setMethods([]);
      } finally {
        setLoadingMethods(false);
      }
    })();
  }, []);

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? null;

  const handleSaveNewMethod = async () => {
    let payload: any = { type: newType };
    if (newType === PaymentMethodType.CARD) {
      if (!newForm.cardNumber || !newForm.cardholderName || !newForm.expiryMonth || !newForm.expiryYear || !newForm.cvv) {
        toast({ title: "Missing card fields", variant: "destructive" }); return;
      }
      payload = { ...payload, cardNumber: newForm.cardNumber.replace(/\s/g, ""), cardholderName: newForm.cardholderName, expiryMonth: +newForm.expiryMonth, expiryYear: +newForm.expiryYear, cvv: newForm.cvv };
    } else if (newType === PaymentMethodType.VODAFONE_CASH) {
      if (!newForm.vodafoneNumber) { toast({ title: "Enter Vodafone Cash number", variant: "destructive" }); return; }
      payload.phoneNumber = newForm.vodafoneNumber;
    } else if (newType === PaymentMethodType.INSTAPAY) {
      if (!newForm.instapayId) { toast({ title: "Enter Instapay ID", variant: "destructive" }); return; }
      payload.instapayId = newForm.instapayId;
    } else if (newType === PaymentMethodType.FAWRY) {
      if (!newForm.fawryNumber) { toast({ title: "Enter Fawry number", variant: "destructive" }); return; }
      payload.referenceNumber = newForm.fawryNumber;
    } else if (newType === PaymentMethodType.BANK_ACCOUNT) {
      if (!newForm.accountHolderName || !newForm.bankName || !newForm.accountNumber) {
        toast({ title: "Missing bank details", variant: "destructive" }); return;
      }
      payload = { ...payload, accountHolderName: newForm.accountHolderName, bankName: newForm.bankName, accountNumber: newForm.accountNumber, iban: newForm.iban };
    }
    try {
      setSavingMethod(true);
      const saved = await userService.addPaymentMethod(payload);
      setMethods((prev) => [...prev, saved]);
      setSelectedMethodId(saved.id);
      setAddingNew(false);
      setNewForm(blankForm);
      toast({ title: "Payment method saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to save.", variant: "destructive" });
    } finally {
      setSavingMethod(false);
    }
  };

  const handlePay = async () => {
    if (!selectedMethodId) {
      toast({ title: "Select a payment method", variant: "destructive" }); return;
    }
    if (holdExpired) {
      toast({ title: "Hold expired", description: "Please book a new slot.", variant: "destructive" }); return;
    }
    setPaying(true);
    try {
      const result = await appointmentService.confirmAndPay(appointmentId!, {
        paymentMethodId: selectedMethodId,
        couponCode: couponApplied ?? undefined,
      });
      setMeetLink(result.googleMeetLink);
    } catch (e: any) {
      toast({
        title: "Payment failed",
        description: e.response?.data?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaying(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (meetLink) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-lg py-16 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Session Confirmed!</h1>
          <p className="text-muted-foreground">
            Your session with <strong>{specialistName}</strong> on{" "}
            <strong>{appointmentDate}</strong> at <strong>{startTime}</strong> is confirmed.
          </p>
          <Card className="text-left">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Google Meet link
              </p>
              <a href={meetLink} target="_blank" rel="noopener noreferrer"
                className="block text-sm text-primary underline break-all">
                {meetLink}
              </a>
              <p className="text-xs text-muted-foreground">
                A calendar invite with this link has been emailed to you and the specialist.
              </p>
            </CardContent>
          </Card>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate("/specialists")}>Browse More</Button>
            <Button onClick={() => navigate("/bookings")}>View My Bookings</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loadingAppointment && !state) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">1</span>
            Choose a slot
          </span>
          <span className="h-px flex-1 bg-border" />
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
            Confirm &amp; pay
          </span>
        </div>

        {/* Hold timer banner */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
          holdExpired
            ? "border-destructive/40 bg-destructive/5 text-destructive"
            : urgent
            ? "border-amber-400/40 bg-amber-50 text-amber-800"
            : "border-primary/20 bg-primary/5 text-primary"
        )}>
          {holdExpired ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
          {holdExpired
            ? "Your hold has expired. Please go back and book a new slot."
            : <>Slot reserved — <strong>{holdTimer}</strong> remaining to complete payment.</>}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Payment ──────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            <section className="border rounded-xl overflow-hidden bg-card">
              <div className="px-5 py-4 border-b flex items-center gap-2 bg-muted/40">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Payment Method</h2>
              </div>

              <div className="p-5 space-y-4">
                {loadingMethods && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {!loadingMethods && selectedMethod && !addingNew && (
                  <motion.div key={selectedMethod.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">{METHOD_ICON[selectedMethod.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{METHOD_LABEL[selectedMethod.type]}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedMethod.displayInfo}</p>
                    </div>
                    {selectedMethod.isDefault && <Badge variant="secondary" className="text-[10px] shrink-0">Default</Badge>}
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  </motion.div>
                )}

                {!loadingMethods && methods.length === 0 && !addingNew && (
                  <p className="text-sm text-muted-foreground text-center py-4">No saved payment methods. Add one below.</p>
                )}

                {!loadingMethods && methods.length > 1 && !addingNew && (
                  <button className="w-full text-left text-sm text-primary hover:underline flex items-center gap-1"
                    onClick={() => setShowMethodPicker((v) => !v)}>
                    {showMethodPicker ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {showMethodPicker ? "Hide" : "Change"} payment method
                  </button>
                )}

                <AnimatePresence>
                  {showMethodPicker && !addingNew && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 pt-1">
                        {methods.map((m) => (
                          <button key={m.id} onClick={() => { setSelectedMethodId(m.id); setShowMethodPicker(false); }}
                            className={cn("w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                              m.id === selectedMethodId ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40")}>
                            <div className="rounded-md bg-muted p-1.5 text-muted-foreground">{METHOD_ICON[m.type]}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{METHOD_LABEL[m.type]}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.displayInfo}</p>
                            </div>
                            {m.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                            {m.id === selectedMethodId && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!addingNew ? (
                  <Button variant="outline" size="sm" className="w-full gap-2"
                    onClick={() => { setAddingNew(true); setShowMethodPicker(false); }}>
                    <Plus className="h-4 w-4" /> Add new payment method
                  </Button>
                ) : (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">New Payment Method</p>
                        <button className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => { setAddingNew(false); setNewForm(blankForm); }}>Cancel</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {Object.values(PaymentMethodType).map((t) => (
                          <button key={t} onClick={() => setNewType(t)}
                            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                              newType === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40")}>
                            {METHOD_ICON[t]}<span className="truncate">{METHOD_LABEL[t].split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                      {newType === PaymentMethodType.CARD && (
                        <div className="space-y-3">
                          <div className="space-y-1.5"><Label className="text-xs">Cardholder Name *</Label>
                            <Input placeholder="John Doe" value={newForm.cardholderName} onChange={(e) => setNewForm({ ...newForm, cardholderName: e.target.value })} /></div>
                          <div className="space-y-1.5"><Label className="text-xs">Card Number *</Label>
                            <Input placeholder="1234 5678 9012 3456" maxLength={19} value={newForm.cardNumber}
                              onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setNewForm({ ...newForm, cardNumber: v.match(/.{1,4}/g)?.join(" ") || v }); }} /></div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5"><Label className="text-xs">Month *</Label><Input placeholder="MM" maxLength={2} value={newForm.expiryMonth} onChange={(e) => setNewForm({ ...newForm, expiryMonth: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label className="text-xs">Year *</Label><Input placeholder="YYYY" maxLength={4} value={newForm.expiryYear} onChange={(e) => setNewForm({ ...newForm, expiryYear: e.target.value })} /></div>
                            <div className="space-y-1.5"><Label className="text-xs">CVV *</Label><Input type="password" placeholder="•••" maxLength={4} value={newForm.cvv} onChange={(e) => setNewForm({ ...newForm, cvv: e.target.value })} /></div>
                          </div>
                        </div>
                      )}
                      {newType === PaymentMethodType.VODAFONE_CASH && (
                        <div className="space-y-1.5"><Label className="text-xs">Vodafone Cash Number *</Label>
                          <Input placeholder="01XXXXXXXXX" value={newForm.vodafoneNumber} onChange={(e) => setNewForm({ ...newForm, vodafoneNumber: e.target.value })} /></div>
                      )}
                      {newType === PaymentMethodType.INSTAPAY && (
                        <div className="space-y-1.5"><Label className="text-xs">Instapay ID *</Label>
                          <Input placeholder="Phone or email" value={newForm.instapayId} onChange={(e) => setNewForm({ ...newForm, instapayId: e.target.value })} /></div>
                      )}
                      {newType === PaymentMethodType.FAWRY && (
                        <div className="space-y-1.5"><Label className="text-xs">Fawry Reference *</Label>
                          <Input placeholder="Fawry number" value={newForm.fawryNumber} onChange={(e) => setNewForm({ ...newForm, fawryNumber: e.target.value })} /></div>
                      )}
                      {newType === PaymentMethodType.BANK_ACCOUNT && (
                        <div className="space-y-3">
                          <div className="space-y-1.5"><Label className="text-xs">Account Holder *</Label><Input placeholder="John Doe" value={newForm.accountHolderName} onChange={(e) => setNewForm({ ...newForm, accountHolderName: e.target.value })} /></div>
                          <div className="space-y-1.5"><Label className="text-xs">Bank Name *</Label><Input placeholder="National Bank of Egypt" value={newForm.bankName} onChange={(e) => setNewForm({ ...newForm, bankName: e.target.value })} /></div>
                          <div className="space-y-1.5"><Label className="text-xs">Account Number *</Label><Input placeholder="XXXXXXXXXXXX" value={newForm.accountNumber} onChange={(e) => setNewForm({ ...newForm, accountNumber: e.target.value })} /></div>
                          <div className="space-y-1.5"><Label className="text-xs">IBAN (optional)</Label><Input placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX" value={newForm.iban} onChange={(e) => setNewForm({ ...newForm, iban: e.target.value })} /></div>
                        </div>
                      )}
                      <Button className="w-full" onClick={handleSaveNewMethod} disabled={savingMethod}>
                        {savingMethod && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save &amp; Use This Method
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </section>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure Payment</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> Refund if cancelled 30+ min early</div>
            </div>
          </div>

          {/* ── Right: Order summary ───────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl bg-card p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-lg">Session Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Date</span>
                  <span className="font-medium">{appointmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</span>
                  <span className="font-medium">{startTime} – {endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialist</span>
                  <span className="font-medium">{specialistName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session</span>
                  <span className="font-medium text-right max-w-[160px] truncate">{title}</span>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                {couponApplied && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({couponApplied})</span><span>Applied</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>{hourlyRate != null ? `$${Number(hourlyRate).toFixed(2)}` : "—"}</span>
                </div>
              </div>

              {!couponApplied ? (
                <div>
                  <button className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    onClick={() => setCouponOpen((v) => !v)}>
                    <Tag className="h-3.5 w-3.5" />
                    {couponOpen ? "Hide coupon field" : "Have a coupon code?"}
                  </button>
                  <AnimatePresence>
                    {couponOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex gap-2 mt-2">
                          <Input placeholder="Enter code" value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && setCouponApplied(couponInput.trim())}
                            className="text-sm h-9" />
                          <Button size="sm" className="shrink-0"
                            onClick={() => { if (couponInput.trim()) { setCouponApplied(couponInput.trim()); setCouponOpen(false); } }}>
                            Apply
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1.5">
                    🎉 <span className="font-mono">{couponApplied}</span> applied
                  </span>
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setCouponApplied(null)}>Remove</button>
                </div>
              )}

              <Button className="w-full h-12 text-base font-semibold" onClick={handlePay}
                disabled={paying || (!selectedMethodId && !addingNew) || holdExpired}>
                {paying
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                  : holdExpired
                  ? "Hold expired"
                  : <><Lock className="mr-2 h-4 w-4" /> Pay {hourlyRate != null ? `$${Number(hourlyRate).toFixed(2)}` : "—"}</>
                }
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                By completing this purchase you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}