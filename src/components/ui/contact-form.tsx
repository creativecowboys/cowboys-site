'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

const SELECT_ARROW =
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export default function ContactForm() {
    const [status, setStatus] = useState<FormState>('idle');
    const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '', service: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, source: 'Contact Page' }),
            });
            if (!res.ok) throw new Error('Send failed');
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    const labelCls =
        "block font-anton text-[10px] tracking-[1.5px] text-[#0a0a0a] uppercase mb-1.5";
    const inputCls =
        "w-full border-[2.5px] border-[#0a0a0a] bg-[#F2EBDA] p-3 font-inter text-sm text-[#0a0a0a] outline-none focus:bg-white transition-colors placeholder:text-[#0a0a0a]/40";

    if (status === 'success') {
        return (
            <div className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-8 md:p-10 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-[#008f4c] border-[3px] border-[#0a0a0a] flex items-center justify-center shadow-[3px_3px_0px_#1a1a1a]">
                    <Check size={26} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="font-anton text-3xl md:text-4xl uppercase text-[#0a0a0a] leading-none">Message Sent!</h3>
                <p className="font-inter text-sm text-[#0a0a0a]/70 max-w-xs leading-relaxed">
                    We&rsquo;ll be in touch within one business day. Talk soon, partner.
                </p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-8 md:p-10 text-center flex flex-col items-center gap-4">
                <h3 className="font-anton text-3xl md:text-4xl uppercase text-[#B5330E] leading-none">Something Went Wrong</h3>
                <p className="font-inter text-sm text-[#0a0a0a]/70 max-w-xs leading-relaxed">
                    Your message couldn&rsquo;t be sent. Please try again, or email us directly at{' '}
                    <a href="mailto:howdy@creativecowboys.co" className="font-bold text-[#B5330E] underline">howdy@creativecowboys.co</a>.
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-1 border-[3px] border-[#0a0a0a] bg-[#B5330E] text-[#F2EBDA] font-bold uppercase tracking-wider text-xs px-6 py-3 shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border-4 border-[#0a0a0a] shadow-[6px_6px_0px_#1a1a1a] p-6 md:p-8 flex flex-col gap-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls} htmlFor="name">Name *</label>
                    <input id="name" name="name" type="text" required placeholder="Jake Rivera"
                        value={form.name} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="email">Email *</label>
                    <input id="email" name="email" type="email" required placeholder="jake@company.com"
                        value={form.email} onChange={handleChange} className={inputCls} />
                </div>
            </div>

            {/* Phone + Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls} htmlFor="phone">Phone (optional)</label>
                    <input id="phone" name="phone" type="tel" placeholder="(555) 555-5555"
                        value={form.phone} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                    <label className={labelCls} htmlFor="company">Company / Business</label>
                    <input id="company" name="company" type="text" placeholder="Lone Star HVAC"
                        value={form.company} onChange={handleChange} className={inputCls} />
                </div>
            </div>

            {/* Service */}
            <div>
                <label className={labelCls} htmlFor="service">What do you need?</label>
                <select id="service" name="service" value={form.service} onChange={handleChange}
                    className={`${inputCls} cursor-pointer appearance-none bg-no-repeat`}
                    style={{ backgroundImage: SELECT_ARROW, backgroundPosition: 'right 12px center', backgroundSize: '18px' }}>
                    <option value="">Select a service...</option>
                    <option value="web-design">Web Design</option>
                    <option value="branding">Branding &amp; Identity</option>
                    <option value="digital-marketing">Digital Marketing</option>
                    <option value="seo">SEO</option>
                    <option value="full-package">Full Package</option>
                    <option value="other">Something Else</option>
                </select>
            </div>

            {/* Message */}
            <div>
                <label className={labelCls} htmlFor="message">Tell us about your project</label>
                <textarea id="message" name="message" required rows={5}
                    placeholder="Give us the quick rundown — what you do, what you're trying to fix or build, and any details that help."
                    value={form.message} onChange={handleChange}
                    className={`${inputCls} resize-y min-h-[120px]`} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={status === 'loading'}
                className="w-full border-[3px] border-[#0a0a0a] bg-[#B5330E] text-[#F2EBDA] font-bold uppercase tracking-wider text-sm px-8 py-4 shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
                {status === 'loading' ? 'Sending…' : <>Send Message <ArrowUpRight size={18} /></>}
            </button>

            <p className="font-inter text-[11px] text-[#0a0a0a]/50 text-center">
                We typically respond within one business day.
            </p>
        </form>
    );
}
