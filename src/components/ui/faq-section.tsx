'use client';

import React, { useEffect, useState } from 'react';

const FAQ_STYLE_ID = 'cowboys-faq-animations';

const faqs = [
    {
        question: "How does pricing work?",
        answer:
            "Every project is different, so we don't do one-size-fits-all pricing. We'll talk through what you need and put together a custom proposal that fits your goals and budget.",
        meta: 'Pricing',
    },
    {
        question: "How long does a website take?",
        answer:
            "Most websites are ready in 2\u20134 weeks. Larger projects with custom features can take a bit longer, but we keep you in the loop every step of the way.",
        meta: 'Timeline',
    },
    {
        question: "Do you work with small businesses?",
        answer:
            "Absolutely \u2014 small and local businesses are our bread and butter. Whether you're just starting out or ready to scale, we build strategies that fit where you are right now.",
        meta: 'Fit',
    },
    {
        question: "Where are you located, and do you work with businesses outside of Villa Rica?",
        answer:
            "We're based in Villa Rica, GA, but we work with clients all over the country. Most of what we do is remote-friendly, so location is never a barrier.",
        meta: 'Location',
    },
    {
        question: "What results can I expect?",
        answer:
            "That depends on the service, but we always tie our work to real metrics \u2014 more traffic, more leads, more revenue. We'll set clear goals upfront so you know exactly what we're working toward.",
        meta: 'Results',
    },
    {
        question: "How do I get started?",
        answer:
            "Just type in the box above! Wrangler will ask you a few quick questions and get you connected with our team.",
        meta: 'Next Steps',
    },
];

export function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        if (document.getElementById(FAQ_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = FAQ_STYLE_ID;
        style.innerHTML = `
      @keyframes cowboys-fade-up {
        from { opacity: 0; transform: translateY(20px); filter: blur(6px); }
        to   { opacity: 1; transform: translateY(0);    filter: blur(0);  }
      }
      .cowboys-faq-fade { opacity: 0; transform: translateY(20px); filter: blur(8px); }
      .cowboys-faq-fade--in { animation: cowboys-fade-up 700ms cubic-bezier(0.22, 0.68, 0, 1) forwards; }
      @media (prefers-reduced-motion: reduce) {
        .cowboys-faq-fade, .cowboys-faq-fade--in { animation: none; opacity: 1; transform: none; filter: none; }
      }
    `;
        document.head.appendChild(style);
        return () => { if (style.parentNode) style.remove(); };
    }, []);

    useEffect(() => {
        const id = window.setTimeout(() => setHasEntered(true), 80);
        return () => window.clearTimeout(id);
    }, []);

    const toggle = (i: number) => setActiveIndex(prev => (prev === i ? -1 : i));

    return (
        <section
            className={`cowboys-faq-fade${hasEntered ? ' cowboys-faq-fade--in' : ''}`}
            style={{
                background: 'linear-gradient(180deg, #fce8d5 0%, #f5ddd0 50%, #fce8d5 100%)',
                padding: '80px 24px 96px',
            }}
        >
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#F15F2A',
                        marginBottom: '12px',
                    }}>
                        Got Questions?
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 44px)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        color: '#1a1514',
                        margin: '0 0 14px',
                        lineHeight: 1.1,
                    }}>
                        Everything you need{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #F15F2A 0%, #EA51FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>
                            to know
                        </span>
                    </h2>
                    <p style={{
                        fontSize: 'clamp(14px, 1.6vw, 17px)',
                        color: 'rgba(26, 21, 20, 0.55)',
                        margin: 0,
                        fontWeight: 400,
                    }}>
                        Everything you need to know before we start building together.
                    </p>
                </div>

                {/* Accordion */}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqs.map((item, index) => {
                        const open = activeIndex === index;
                        return (
                            <li key={item.question}>
                                <div style={{
                                    borderRadius: '20px',
                                    background: open ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.70)',
                                    border: open
                                        ? '1px solid rgba(241, 95, 42, 0.25)'
                                        : '1px solid rgba(255,255,255,0.80)',
                                    boxShadow: open
                                        ? '0 8px 32px rgba(241, 95, 42, 0.10), 0 2px 8px rgba(0,0,0,0.06)'
                                        : '0 2px 8px rgba(0,0,0,0.04)',
                                    backdropFilter: 'blur(16px)',
                                    WebkitBackdropFilter: 'blur(16px)',
                                    transition: 'all 300ms ease',
                                    overflow: 'hidden',
                                }}>
                                    <button
                                        type="button"
                                        aria-expanded={open}
                                        onClick={() => toggle(index)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '16px',
                                            padding: '22px 24px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {/* Icon circle */}
                                        <span style={{
                                            flexShrink: 0,
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: open
                                                ? 'linear-gradient(135deg, #F15F2A, #EA51FF)'
                                                : 'rgba(26, 21, 20, 0.06)',
                                            border: open ? 'none' : '1px solid rgba(26, 21, 20, 0.10)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 300ms ease',
                                            marginTop: '2px',
                                        }}>
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                style={{
                                                    transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                                                    transition: 'transform 300ms ease',
                                                    color: open ? '#fff' : '#1a1514',
                                                }}
                                            >
                                                <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </span>

                                        {/* Question + meta */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    fontSize: 'clamp(15px, 1.6vw, 17px)',
                                                    fontWeight: 700,
                                                    color: '#1a1514',
                                                    lineHeight: 1.35,
                                                }}>
                                                    {item.question}
                                                </span>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.08em',
                                                    textTransform: 'uppercase',
                                                    color: open ? '#F15F2A' : 'rgba(26,21,20,0.40)',
                                                    border: `1px solid ${open ? 'rgba(241,95,42,0.30)' : 'rgba(26,21,20,0.12)'}`,
                                                    borderRadius: '999px',
                                                    padding: '2px 10px',
                                                    transition: 'all 300ms ease',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {item.meta}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Answer panel */}
                                    <div style={{
                                        maxHeight: open ? '300px' : '0',
                                        overflow: 'hidden',
                                        transition: 'max-height 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            padding: '0 24px 22px 80px',
                                            fontSize: 'clamp(14px, 1.4vw, 15px)',
                                            color: 'rgba(26, 21, 20, 0.65)',
                                            lineHeight: 1.7,
                                            fontWeight: 400,
                                        }}>
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {/* CTA nudge */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '44px',
                    fontSize: '15px',
                    color: 'rgba(26,21,20,0.50)',
                }}>
                    Still have questions?{' '}
                    <a
                        href="mailto:hello@creativecowboys.com"
                        style={{
                            color: '#F15F2A',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderBottom: '1px solid rgba(241,95,42,0.30)',
                        }}
                    >
                        Send us a message
                    </a>
                </p>
            </div>
        </section>
    );
}
