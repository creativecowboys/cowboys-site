"use client";

import { useTransition, useState } from "react";

interface ClientFormProps {
    action: (formData: FormData) => Promise<void>;
    submitLabel: string;
    isEdit?: boolean;
    defaultValues?: {
        name?: string;
        businessName?: string;
        slug?: string;
        services?: string[];
        brightLocalCampaignId?: number | null;
        brightLocalLrtId?: number | null;
        seoUrl?: string;
        adsUrl?: string;
    };
}

// ─── Field Component ──────────────────────────────────────────────────────────

function Field({
    label,
    name,
    type = "text",
    placeholder,
    defaultValue,
    required,
    hint,
    readOnly,
}: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    defaultValue?: string | number;
    required?: boolean;
    hint?: string;
    readOnly?: boolean;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "6px",
                }}
            >
                {label} {required && <span style={{ color: "#f87171" }}>*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                defaultValue={defaultValue ?? ""}
                required={required}
                readOnly={readOnly}
                style={{
                    width: "100%",
                    background: readOnly ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    fontSize: "14px",
                    color: readOnly ? "rgba(255,255,255,0.4)" : "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: readOnly ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                    if (!readOnly) e.target.style.borderColor = "rgba(42,156,241,0.5)";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.10)";
                }}
            />
            {hint && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "5px 0 0 2px" }}>
                    {hint}
                </p>
            )}
        </div>
    );
}

// ─── Section Title ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "22px 24px",
            }}
        >
            <p
                style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.3)",
                    margin: "0 0 18px",
                }}
            >
                {title}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {children}
            </div>
        </div>
    );
}

// ─── Checkbox ────────────────────────────────────────────────────────────────

function ServiceCheckbox({
    name,
    label,
    description,
    checked,
    color,
}: {
    name: string;
    label: string;
    description: string;
    checked?: boolean;
    color: string;
}) {
    const [isChecked, setIsChecked] = useState(checked ?? false);
    return (
        <label
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                padding: "12px 14px",
                borderRadius: "10px",
                border: `1px solid ${isChecked ? `${color}30` : "rgba(255,255,255,0.07)"}`,
                background: isChecked ? `${color}08` : "rgba(255,255,255,0.02)",
                transition: "all 150ms ease",
            }}
        >
            <input
                type="checkbox"
                name={name}
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                style={{ marginTop: "2px", accentColor: color, width: "15px", height: "15px", flexShrink: 0 }}
            />
            <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: isChecked ? "#fff" : "rgba(255,255,255,0.5)", margin: "0 0 2px" }}>
                    {label}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    {description}
                </p>
            </div>
        </label>
    );
}

// ─── Main Form ─────────────────────────────────────────────────────────────────

export default function ClientForm({ action, submitLabel, isEdit, defaultValues }: ClientFormProps) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await action(formData);
            } catch (err: any) {
                setError(err?.message ?? "Something went wrong.");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "680px" }}>

            {/* Client Details */}
            <Section title="Client Details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <Field
                        label="First Name"
                        name="name"
                        placeholder="John"
                        defaultValue={defaultValues?.name}
                        required
                        hint="Used in the dashboard greeting"
                    />
                    <Field
                        label="Business Name"
                        name="businessName"
                        placeholder="Acme Roofing"
                        defaultValue={defaultValues?.businessName}
                        required
                    />
                </div>

                <Field
                    label="Username (slug)"
                    name="slug"
                    placeholder="acme-roofing"
                    defaultValue={defaultValues?.slug}
                    required={!isEdit}
                    readOnly={isEdit}
                    hint={isEdit ? "Username cannot be changed after creation" : "URL-safe: letters, numbers, hyphens. e.g. acme-roofing → /clients/acme-roofing"}
                />
            </Section>

            {/* Password */}
            <Section title="Password">
                <Field
                    label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                    name="password"
                    type="password"
                    placeholder={isEdit ? "••••••••" : "Set a strong password"}
                    required={!isEdit}
                    hint="Minimum recommended: 12 characters"
                />
            </Section>

            {/* Services */}
            <Section title="Active Services">
                <ServiceCheckbox
                    name="service_seo"
                    label="SEO"
                    description="Keyword rankings, organic traffic, search visibility"
                    checked={defaultValues?.services?.includes("seo")}
                    color="#22c55e"
                />
                <ServiceCheckbox
                    name="service_ads"
                    label="Social Advertising"
                    description="Ad spend, impressions, click-through rates, conversions"
                    checked={defaultValues?.services?.includes("ads")}
                    color="#f59e0b"
                />
            </Section>

            {/* BrightLocal */}
            <Section title="BrightLocal (SEO Data)">
                <Field
                    label="Local Pack Report ID (GPW)"
                    name="brightLocalCampaignId"
                    type="number"
                    placeholder="739274"
                    defaultValue={defaultValues?.brightLocalCampaignId ?? ""}
                    hint="GPW/Local Pack report_id — from api/v4/gpw. Drives the Google Local Pack section."
                />
                <Field
                    label="Rank Tracker Report ID (LRT)"
                    name="brightLocalLrtId"
                    type="number"
                    placeholder="1705240"
                    defaultValue={defaultValues?.brightLocalLrtId ?? ""}
                    hint="Organic Rank Tracker report_id — from api.brightlocal.com/manage/v1/lrt/reports?location_id={id}. Drives the Organic Rank Tracker section."
                />
            </Section>

            {/* Report URLs */}
            <Section title="Looker Studio Report URLs (optional)">
                <Field
                    label="SEO Report Embed URL"
                    name="seoUrl"
                    placeholder="https://lookerstudio.google.com/embed/reporting/..."
                    defaultValue={defaultValues?.seoUrl}
                    hint="Used as fallback if BrightLocal is not connected"
                />
                <Field
                    label="Social Ads Report Embed URL"
                    name="adsUrl"
                    placeholder="https://lookerstudio.google.com/embed/reporting/..."
                    defaultValue={defaultValues?.adsUrl}
                />
            </Section>

            {/* Error */}
            {error && (
                <div
                    style={{
                        background: "rgba(239,68,68,0.09)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "10px",
                        padding: "11px 14px",
                        fontSize: "13px",
                        color: "#fca5a5",
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* Submit */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                    type="submit"
                    disabled={pending}
                    style={{
                        padding: "12px 28px",
                        borderRadius: "10px",
                        border: "none",
                        background: pending ? "rgba(42,156,241,0.3)" : "linear-gradient(135deg, #2A9CF1 0%, #92A6DB 100%)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: pending ? "not-allowed" : "pointer",
                        boxShadow: pending ? "none" : "0 4px 20px rgba(42,156,241,0.25)",
                    }}
                >
                    {pending ? "Saving…" : submitLabel}
                </button>
                <a
                    href="/admin"
                    style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
                >
                    Cancel
                </a>
            </div>
        </form>
    );
}
