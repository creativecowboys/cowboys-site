'use client';

import React, { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
    const [status, setStatus] = useState<FormState>('idle');
    const [form, setForm] = useState({ name: '', email: '', company: '', message: '', service: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate submit — replace with real endpoint or form service
        await new Promise(r => setTimeout(r, 1200));
        setStatus('success');
    };

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

    if (status === 'success') {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(241,95,42,0.30)',
                borderRadius: '24px',
                padding: '64px 40px',
                textAlign: 'center',
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F15F2A, #EA51FF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>
                    Message Sent!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.50)', fontSize: '15px', margin: 0, lineHeight: 1.6 }}>
                    We&rsquo;ll be in touch within one business day. Talk soon, partner.
                </p>
            </div>
        );
    }

    return (
        <>
            <style>{`
        .contact-input:focus {
          border-color: rgba(241,95,42,0.60) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .contact-input::placeholder { color: rgba(255,255,255,0.20); }
        .contact-select option { background: #1a1210; color: #fff; }
        .contact-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(241,95,42,0.35);
        }
        .contact-submit:active:not(:disabled) { transform: translateY(0); }
        .contact-submit:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

            <form
                onSubmit={handleSubmit}
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '40px',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                }}
            >
                {/* Row: Name + Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                    <div>
                        <label style={labelStyle} htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Jake Rivera"
                            value={form.name}
                            onChange={handleChange}
                            className="contact-input"
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle} htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="jake@company.com"
                            value={form.email}
                            onChange={handleChange}
                            className="contact-input"
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Company */}
                <div>
                    <label style={labelStyle} htmlFor="company">Company / Business Name</label>
                    <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Lone Star HVAC"
                        value={form.company}
                        onChange={handleChange}
                        className="contact-input"
                        style={inputStyle}
                    />
                </div>

                {/* Service */}
                <div>
                    <label style={labelStyle} htmlFor="service">What do you need?</label>
                    <select
                        id="service"
                        name="service"
                        value={form.service}
                        onChange={handleChange}
                        className="contact-input contact-select"
                        style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                        <option value="">Select a service...</option>
                        <option value="web-design">Web Design</option>
                        <option value="branding">Branding & Identity</option>
                        <option value="digital-marketing">Digital Marketing</option>
                        <option value="seo">SEO</option>
                        <option value="full-package">Full Package</option>
                        <option value="other">Something Else</option>
                    </select>
                </div>

                {/* Message */}
                <div>
                    <label style={labelStyle} htmlFor="message">Tell us about your project</label>
                    <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Give us the quick rundown — what you do, what you're trying to fix or build, and any details that help."
                        value={form.message}
                        onChange={handleChange}
                        className="contact-input"
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="contact-submit"
                    style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '15px',
                        fontWeight: 700,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        transition: 'transform 250ms ease, box-shadow 250ms ease, opacity 250ms ease',
                        letterSpacing: '0.02em',
                    }}
                >
                    {status === 'loading' ? 'Sending...' : 'Send Message \u2192'}
                </button>

                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
                    We typically respond within one business day.
                </p>
            </form>

            <style>{`
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </>
    );
}
