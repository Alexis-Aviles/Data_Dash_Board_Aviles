import { useState, useCallback } from "react";

interface Props {
  accent: string;
  initials: string;
  name: string;
  role: string;
  initialEmail: string;
  initialPhone: string;
  extraSummary?: React.ReactNode;
}

// ── Shared button styles ──────────────────────────────────────────────────────

function AccentBtn({
  accent,
  onClick,
  disabled,
  loading,
  children,
  fullWidth = false,
}: {
  accent: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const bg = isDisabled
    ? `${accent}15`
    : pressed
    ? `${accent}40`
    : hovered
    ? `${accent}30`
    : `${accent}18`;
  const border = isDisabled ? `${accent}25` : pressed ? `${accent}80` : `${accent}44`;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => { setHovered(false); setPressed(false); }}
      style={{
        backgroundColor: bg,
        color: isDisabled ? `${accent}55` : accent,
        border: `1px solid ${border}`,
        transform: pressed && !isDisabled ? "scale(0.97)" : "scale(1)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        outline: "none",
      }}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 focus-visible:ring-2 ${fullWidth ? "w-full justify-center" : ""}`}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
      )}
      {children}
    </button>
  );
}

function GhostBtn({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => { setHovered(false); setPressed(false); }}
      style={{
        border: "1px solid var(--g-bd2)",
        color: hovered ? "var(--g-tx)" : "var(--g-tx2)",
        backgroundColor: hovered ? "var(--g-s2)" : "transparent",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        outline: "none",
      }}
      className="px-4 py-2 rounded-xl text-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-1"
    >
      {children}
    </button>
  );
}

function EditBtn({
  accent,
  onClick,
  label = "Edit",
}: {
  accent: string;
  onClick: () => void;
  label?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        color: hovered ? accent : "var(--g-tx2)",
        backgroundColor: hovered ? `${accent}12` : "transparent",
        border: `1px solid ${hovered ? `${accent}44` : "var(--g-bd)"}`,
        transform: pressed ? "scale(0.95)" : "scale(1)",
        outline: "none",
      }}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:ring-2 shrink-0"
    >
      {label}
    </button>
  );
}

// ── Focusable input ───────────────────────────────────────────────────────────

function SettingsInput({
  type = "text",
  value,
  onChange,
  placeholder,
  accent,
  maxLength,
  className = "",
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  accent: string;
  maxLength?: number;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        backgroundColor: "var(--g-s2)",
        borderColor: focused ? `${accent}88` : "var(--g-bd)",
        color: "var(--g-tx)",
        outline: "none",
        boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
      }}
      className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all duration-150 ${className}`}
    />
  );
}

// ── Password field with show/hide ─────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  accent,
  show,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accent: string;
  show: boolean;
  onToggleShow: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [eyeHovered, setEyeHovered] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            backgroundColor: "var(--g-s2)",
            borderColor: focused ? `${accent}88` : "var(--g-bd)",
            color: "var(--g-tx)",
            outline: "none",
            boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
          }}
          className="w-full border rounded-xl px-4 py-2.5 pr-11 text-sm transition-all duration-150"
        />
        <button
          type="button"
          onClick={onToggleShow}
          onMouseEnter={() => setEyeHovered(true)}
          onMouseLeave={() => setEyeHovered(false)}
          title={show ? "Hide password" : "Show password"}
          style={{ color: eyeHovered ? "var(--g-tx)" : "var(--g-tx2)", outline: "none" }}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:ring-1 rounded"
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Inline success / error banners ────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "#22c55e18", color: "#22c55e", border: "1px solid #22c55e30" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "#ef444418", color: "#ef4444", border: "1px solid #ef444430" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      {message}
    </div>
  );
}

// ── Section row: compact display + Edit button ────────────────────────────────

function FieldRow({
  label,
  value,
  verified,
  accent,
  onEdit,
}: {
  label: string;
  value: string;
  verified: boolean;
  accent: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium mb-0.5" style={{ color: "var(--g-tx2)" }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color: "var(--g-tx)" }}>{value}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {verified && (
          <span className="text-xs text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">Verified</span>
        )}
        <EditBtn accent={accent} onClick={onEdit} />
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function AccountSettingsPanel({ accent, initials, name, role, initialEmail, initialPhone, extraSummary }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  // Which form is open: null | "email" | "phone" | "password"
  const [openSection, setOpenSection] = useState<null | "email" | "phone" | "password">(null);

  // Email form
  const [emailNew, setEmailNew] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Phone form
  const [phoneNew, setPhoneNew] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"input" | "code">("input");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Password form
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNext, setPwNext] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNext, setShowPwNext] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  function openForm(section: "email" | "phone" | "password") {
    setOpenSection(section);
    setEmailError(""); setEmailSuccess(false); setEmailNew(""); setEmailConfirm("");
    setPhoneError(""); setPhoneSuccess(false); setPhoneNew(""); setPhoneCode(""); setPhoneStep("input");
    setPwError(""); setPwSuccess(false); setPwCurrent(""); setPwNext(""); setPwConfirm("");
    setShowPwCurrent(false); setShowPwNext(false); setShowPwConfirm(false);
  }

  function closeForm() {
    setOpenSection(null);
    setEmailError(""); setEmailSuccess(false);
    setPhoneError(""); setPhoneSuccess(false); setPhoneStep("input");
    setPwError(""); setPwSuccess(false);
  }

  const saveEmail = useCallback(() => {
    setEmailError("");
    if (!emailNew.includes("@")) return setEmailError("Enter a valid email address.");
    if (emailNew !== emailConfirm) return setEmailError("Email addresses do not match.");
    setEmailLoading(true);
    setTimeout(() => {
      setEmail(emailNew);
      setEmailLoading(false);
      setEmailSuccess(true);
      setEmailNew(""); setEmailConfirm("");
      setTimeout(closeForm, 2500);
    }, 1200);
  }, [emailNew, emailConfirm]);

  const sendCode = useCallback(() => {
    setPhoneError("");
    if (!/^\+?[\d\s\-()\\.]{7,}$/.test(phoneNew)) return setPhoneError("Enter a valid phone number.");
    setPhoneLoading(true);
    setTimeout(() => { setPhoneLoading(false); setPhoneStep("code"); }, 900);
  }, [phoneNew]);

  const verifyPhone = useCallback(() => {
    setPhoneError("");
    if (phoneCode !== "123456") return setPhoneError("Incorrect code. Try 123456 for demo.");
    setPhoneLoading(true);
    setTimeout(() => {
      setPhone(phoneNew);
      setPhoneLoading(false);
      setPhoneSuccess(true);
      setPhoneNew(""); setPhoneCode(""); setPhoneStep("input");
      setTimeout(closeForm, 2500);
    }, 1000);
  }, [phoneCode, phoneNew]);

  const pwReqs = [
    { label: "At least 8 characters", met: pwNext.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pwNext) },
    { label: "One number", met: /[0-9]/.test(pwNext) },
  ];

  const savePassword = useCallback(() => {
    setPwError("");
    if (!pwCurrent) return setPwError("Enter your current password.");
    if (!pwReqs.every((r) => r.met)) return setPwError("Password does not meet requirements.");
    if (pwNext !== pwConfirm) return setPwError("New passwords do not match.");
    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwSuccess(true);
      setPwCurrent(""); setPwNext(""); setPwConfirm("");
      setTimeout(closeForm, 2500);
    }, 1200);
  }, [pwCurrent, pwNext, pwConfirm, pwReqs]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile summary */}
      <div className="border rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2"
          style={{ backgroundColor: `${accent}15`, borderColor: `${accent}40` }}>
          <span className="text-lg font-bold" style={{ color: accent }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold" style={{ color: "var(--g-tx)" }}>{name}</h3>
          <p className="text-xs" style={{ color: "var(--g-tx2)" }}>{role}</p>
          <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full border"
            style={{ color: accent, backgroundColor: `${accent}15`, borderColor: `${accent}30` }}>
            Verified ✓
          </span>
        </div>
        {extraSummary}
      </div>

      {/* Contact Information */}
      <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--g-bd)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Contact Information</p>
        </div>

        {/* Email section */}
        <div className="p-5 border-b" style={{ borderColor: "var(--g-bd)" }}>
          {openSection !== "email" ? (
            <FieldRow label="Email address" value={email} verified accent={accent} onEdit={() => openForm("email")} />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Update Email Address</p>
                <button onClick={closeForm} style={{ color: "var(--g-tx3)", outline: "none" }}
                  className="text-xs hover:opacity-60 transition-opacity focus-visible:ring-1 rounded px-1">✕ Cancel</button>
              </div>
              <SettingsInput type="email" value={emailNew} onChange={setEmailNew} placeholder="New email address" accent={accent} />
              <SettingsInput type="email" value={emailConfirm} onChange={setEmailConfirm} placeholder="Confirm new email address" accent={accent} />
              {emailError && <ErrorBanner message={emailError} />}
              {emailSuccess && <SuccessBanner message="Email updated. A verification link has been sent to your new address." />}
              <p className="text-xs" style={{ color: "var(--g-tx3)" }}>A verification link will be sent before the change takes effect.</p>
              <div className="flex gap-2 pt-1">
                <AccentBtn accent={accent} onClick={saveEmail} disabled={!emailNew || !emailConfirm} loading={emailLoading}>
                  {emailLoading ? "Saving…" : "Save Changes"}
                </AccentBtn>
                <GhostBtn onClick={closeForm}>Cancel</GhostBtn>
              </div>
            </div>
          )}
        </div>

        {/* Phone section */}
        <div className="p-5">
          {openSection !== "phone" ? (
            <FieldRow label="Phone number" value={phone} verified accent={accent} onEdit={() => openForm("phone")} />
          ) : phoneStep === "input" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Update Phone Number</p>
                <button onClick={closeForm} style={{ color: "var(--g-tx3)", outline: "none" }}
                  className="text-xs hover:opacity-60 transition-opacity focus-visible:ring-1 rounded px-1">✕ Cancel</button>
              </div>
              <SettingsInput type="tel" value={phoneNew} onChange={setPhoneNew} placeholder="New phone number (e.g. +31 6 1234 5678)" accent={accent} />
              {phoneError && <ErrorBanner message={phoneError} />}
              {phoneSuccess && <SuccessBanner message="Phone number updated successfully." />}
              <div className="flex gap-2 pt-1">
                <AccentBtn accent={accent} onClick={sendCode} disabled={!phoneNew} loading={phoneLoading}>
                  {phoneLoading ? "Sending…" : "Send Verification Code"}
                </AccentBtn>
                <GhostBtn onClick={closeForm}>Cancel</GhostBtn>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => setPhoneStep("input")} style={{ color: "var(--g-tx2)", outline: "none" }}
                  className="text-xs hover:opacity-70 focus-visible:ring-1 rounded">← Back</button>
                <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Enter Verification Code</p>
              </div>
              <p className="text-xs" style={{ color: "var(--g-tx3)" }}>
                A 6-digit code was sent to <strong style={{ color: "var(--g-tx)" }}>{phoneNew}</strong>.{" "}
                (Demo: use <code style={{ color: accent }}>123456</code>)
              </p>
              <SettingsInput type="text" value={phoneCode} onChange={setPhoneCode} placeholder="6-digit code" accent={accent} maxLength={6} className="font-mono tracking-widest" />
              {phoneError && <ErrorBanner message={phoneError} />}
              {phoneSuccess && <SuccessBanner message="Phone number verified and updated." />}
              <div className="flex gap-2 pt-1">
                <AccentBtn accent={accent} onClick={verifyPhone} disabled={phoneCode.length < 6} loading={phoneLoading}>
                  {phoneLoading ? "Verifying…" : "Verify & Save"}
                </AccentBtn>
                <GhostBtn onClick={() => { setPhoneStep("input"); setPhoneCode(""); setPhoneError(""); }}>Back</GhostBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--g-bd)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Security</p>
        </div>
        <div className="p-5">
          {openSection !== "password" ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: "var(--g-tx2)" }}>Password</p>
                <p className="text-sm" style={{ color: "var(--g-tx)" }}>••••••••••••</p>
              </div>
              <EditBtn accent={accent} onClick={() => openForm("password")} label="Change Password" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Change Password</p>
                <button onClick={closeForm} style={{ color: "var(--g-tx3)", outline: "none" }}
                  className="text-xs hover:opacity-60 transition-opacity focus-visible:ring-1 rounded px-1">✕ Cancel</button>
              </div>
              <PasswordField label="Current password" value={pwCurrent} onChange={setPwCurrent}
                placeholder="Enter current password" accent={accent} show={showPwCurrent} onToggleShow={() => setShowPwCurrent((s) => !s)} />
              <PasswordField label="New password" value={pwNext} onChange={setPwNext}
                placeholder="Enter new password" accent={accent} show={showPwNext} onToggleShow={() => setShowPwNext((s) => !s)} />
              <PasswordField label="Confirm new password" value={pwConfirm} onChange={setPwConfirm}
                placeholder="Re-enter new password" accent={accent} show={showPwConfirm} onToggleShow={() => setShowPwConfirm((s) => !s)} />
              {pwNext && (
                <div className="space-y-1 pt-1 pb-1">
                  {pwReqs.map((r) => (
                    <p key={r.label} className="text-xs flex items-center gap-1.5 transition-colors duration-200"
                      style={{ color: r.met ? "#22c55e" : "var(--g-tx3)" }}>
                      <span className="text-[10px]">{r.met ? "✓" : "○"}</span> {r.label}
                    </p>
                  ))}
                </div>
              )}
              {pwError && <ErrorBanner message={pwError} />}
              {pwSuccess && <SuccessBanner message="Password changed successfully." />}
              <div className="flex gap-2 pt-1">
                <AccentBtn accent={accent} onClick={savePassword} disabled={!pwCurrent || !pwNext || !pwConfirm} loading={pwLoading}>
                  {pwLoading ? "Saving…" : "Save Changes"}
                </AccentBtn>
                <GhostBtn onClick={closeForm}>Cancel</GhostBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
