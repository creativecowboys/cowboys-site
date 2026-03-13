'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MessageSquareText, Phone, Star } from 'lucide-react';
import { Footer7 } from '@/components/ui/footer-7';
import FloatingNav from '@/components/FloatingNav';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const ORANGE = '#F15F2A';
const TEAL = '#56CCF2';
const DARK = '#0D0D0F';
const CARD = '#15181e';

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 250ms ease, background 250ms ease',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '8px',
};

export default function AIDemoPageClient() {
    const [status, setStatus] = useState<FormState>('idle');
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        business: '',
        industry: '',
        message: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        // TODO: replace with real endpoint (GoHighLevel, Calendly webhook, etc.)
        await new Promise((r) => setTimeout(r, 1200));
        setStatus('success');
    };

    return (
        <>
            <style>{`
        .demo-input:focus {
          border-color: rgba(86,204,242,0.60) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .demo-input::placeholder { color: rgba(255,255,255,0.20); }
        .demo-select option { background: #15181e; color: #fff; }
        .demo-submit {
          background: ${TEAL};
          transition: background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
        }
        .demo-submit:hover:not(:disabled) {
          background: #3db8dc;
          transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(86,204,242,0.30);
        }
        .demo-submit:active:not(:disabled) { transform: translateY(0); }
        .demo-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) {
          .demo-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
        }
        @media (max-width: 480px) {
          .form-row-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <main
                style={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${DARK} 0%, #0d1118 50%, ${DARK} 100%)`,
                    paddingTop: '36px',
                    position: 'relative',
                    overflow: 'hidden',
                    fontFamily: 'var(--font-geist-sans, sans-serif)',
                }}
            >
                {/* Grid texture */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'linear-gradient(rgba(86,204,242,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(86,204,242,0.03) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                        pointerEvents: 'none',
                    }}
                />
                {/* Glow orbs */}
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-5%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(86,204,242,0.10) 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }}
                />
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '-5%',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(241,95,42,0.10) 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '60px 24px 100px',
                    }}
                >
                    {/* Logo */}
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '64px' }}>
                        <Image
                            src="/Main%20logo%202.png"
                            alt="Creative Cowboys Media"
                            width={160}
                            height={42}
                            priority
                            style={{ width: '160px', height: 'auto' }}
                        />
                    </Link>

                    <div className="demo-grid">
                        {/* ── Left: Info Panel ── */}
                        <div>
                            <p
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: TEAL,
                                    marginBottom: '16px',
                                }}
                            >
                                Free AI Demo
                            </p>
                            <h1
                                style={{
                                    fontSize: 'clamp(32px, 4.5vw, 54px)',
                                    fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    lineHeight: 1.06,
                                    color: '#ffffff',
                                    margin: '0 0 24px',
                                }}
                            >
                                Let&rsquo;s show you AI{' '}
                                <span
                                    style={{
                                        background: `linear-gradient(135deg, ${TEAL} 0%, ${ORANGE} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    built for your business.
                                </span>
                            </h1>
                            <p
                                style={{
                                    fontSize: '16px',
                                    color: 'rgba(255,255,255,0.50)',
                                    lineHeight: 1.75,
                                    marginBottom: '48px',
                                    maxWidth: '420px',
                                }}
                            >
                                Fill out the form and we&rsquo;ll set up a free 15-minute demo — live, on a
                                real example from your industry. No pitch deck. No fluff. Just a working
                                AI assistant doing its thing.
                            </p>

                            {/* What to expect */}
                            <div
                                style={{
                                    background: CARD,
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '20px',
                                    padding: '28px',
                                    marginBottom: '32px',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        letterSpacing: '0.10em',
                                        textTransform: 'uppercase',
                                        color: 'rgba(255,255,255,0.35)',
                                        marginBottom: '18px',
                                    }}
                                >
                                    What happens in the demo
                                </p>
                                {[
                                    { icon: Clock, color: TEAL, text: '15 minutes — no pressure, no commitment' },
                                    { icon: MessageSquareText, color: ORANGE, text: 'Live AI Chat demo built around your industry' },
                                    { icon: Phone, color: '#EA51FF', text: 'Hear the AI Voice Assistant in action' },
                                    { icon: ArrowRight, color: '#2ED573', text: 'Custom recommendation for your business' },
                                ].map(({ icon: Icon, color, text }) => (
                                    <div
                                        key={text}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'center',
                                            marginBottom: '14px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '8px',
                                                background: `${color}18`,
                                                border: `1px solid ${color}40`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={16} color={color} />
                                        </div>
                                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.5 }}>
                                            {text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Trust badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} color="#F7B731" fill="#F7B731" />
                                    ))}
                                </div>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.40)', fontWeight: 500 }}>
                                    5.0 — 19 Google Reviews &nbsp;·&nbsp; West Georgia&rsquo;s AI team
                                </span>
                            </div>
                        </div>

                        {/* ── Right: Form ── */}
                        {status === 'success' ? (
                            <div
                                style={{
                                    background: CARD,
                                    border: '1px solid rgba(86,204,242,0.25)',
                                    borderRadius: '24px',
                                    padding: '64px 40px',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${TEAL}, ${ORANGE})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                    }}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>
                                    You&rsquo;re on the list!
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 24px', maxWidth: '340px', marginInline: 'auto' }}>
                                    We&rsquo;ll reach out within one business day to confirm your demo time. Keep an eye on your inbox — this is going to be a good one.
                                </p>
                                <Link
                                    href="/ai"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '14px',
                                        color: TEAL,
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                    }}
                                >
                                    ← Back to the AI page
                                </Link>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                style={{
                                    background: CARD,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '24px',
                                    padding: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '22px',
                                }}
                            >
                                <div>
                                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                                        Book your free 15-minute demo
                                    </p>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                                        We&rsquo;ll follow up within one business day to schedule.
                                    </p>
                                </div>

                                {/* Name + Phone */}
                                <div className="form-row-2">
                                    <div>
                                        <label style={labelStyle} htmlFor="name">Your Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            placeholder="Jake Rivera"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="demo-input"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle} htmlFor="phone">Phone Number</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="(470) 555-0100"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="demo-input"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label style={labelStyle} htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="jake@yourbusiness.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="demo-input"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Business name */}
                                <div>
                                    <label style={labelStyle} htmlFor="business">Business Name</label>
                                    <input
                                        id="business"
                                        name="business"
                                        type="text"
                                        required
                                        placeholder="Lone Star Roofing"
                                        value={form.business}
                                        onChange={handleChange}
                                        className="demo-input"
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Industry */}
                                <div>
                                    <label style={labelStyle} htmlFor="industry">What type of business are you?</label>
                                    <select
                                        id="industry"
                                        name="industry"
                                        required
                                        value={form.industry}
                                        onChange={handleChange}
                                        className="demo-input demo-select"
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        <option value="">Select your industry...</option>
                                        <option value="law">Law Office / Legal Services</option>
                                        <option value="roofing">Roofing / Contractor / Trades</option>
                                        <option value="medical">Medical / Dental Practice</option>
                                        <option value="insurance">Insurance Agency</option>
                                        <option value="restaurant">Restaurant / Catering</option>
                                        <option value="event-venue">Event Venue</option>
                                        <option value="church-school">Church / School</option>
                                        <option value="other">Other Small Business</option>
                                    </select>
                                </div>

                                {/* Message */}
                                <div>
                                    <label style={labelStyle} htmlFor="message">
                                        Anything we should know before the demo? <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(optional)</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        placeholder="Tell us what's not working right now — missed calls, after-hours leads, whatever's costing you. We'll tailor the demo around your situation."
                                        value={form.message}
                                        onChange={handleChange}
                                        className="demo-input"
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: '110px' }}
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="demo-submit"
                                    style={{
                                        padding: '16px 32px',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#ffffff',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        fontFamily: 'inherit',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {status === 'loading' ? 'Sending your request...' : <>Book My Free Demo <ArrowRight size={16} /></>}
                                </button>

                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
                                    No contracts. No commitment. We&rsquo;ll reach out within one business day.
                                </p>
                            </form>
                        )}
                    </div>
                </div>

                <FloatingNav />
            </main>

            <Footer7 />
        </>
    );
}
