'use client';

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';

// --- Component Interfaces ---
export interface Testimonial {
    id: string | number;
    initials: string;
    name: string;
    role: string;
    quote: string;
    tags: { text: string; type: 'featured' | 'default' }[];
    stats: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; text: string }[];
    avatarGradient: string;
}

export interface TestimonialStackProps {
    testimonials: Testimonial[];
    visibleBehind?: number;
}

// --- The Component ---
export const TestimonialStack = ({ testimonials, visibleBehind = 2 }: TestimonialStackProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const dragStartRef = useRef(0);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const totalCards = testimonials.length;

    const navigate = useCallback(
        (newIndex: number) => {
            setActiveIndex((newIndex + totalCards) % totalCards);
        },
        [totalCards]
    );

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
        if (index !== activeIndex) return;
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        dragStartRef.current = clientX;
        cardRefs.current[activeIndex]?.classList.add('is-dragging');
    };

    const handleDragMove = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            setDragOffset(clientX - dragStartRef.current);
        },
        [isDragging]
    );

    const handleDragEnd = useCallback(() => {
        if (!isDragging) return;
        cardRefs.current[activeIndex]?.classList.remove('is-dragging');
        if (Math.abs(dragOffset) > 50) {
            navigate(activeIndex + (dragOffset < 0 ? 1 : -1));
        }
        setIsDragging(false);
        setDragOffset(0);
    }, [isDragging, dragOffset, activeIndex, navigate]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    if (!testimonials?.length) return null;

    return (
        <section className="testimonials-stack relative pb-10">
            {testimonials.map((testimonial, index) => {
                const displayOrder = (index - activeIndex + totalCards) % totalCards;

                const style: CSSProperties = {};
                if (displayOrder === 0) {
                    style.transform = `translateX(${dragOffset}px)`;
                    style.opacity = 1;
                    style.zIndex = totalCards;
                    style.cursor = isDragging ? 'grabbing' : 'grab';
                } else if (displayOrder <= visibleBehind) {
                    const scale = 1 - 0.05 * displayOrder;
                    const translateY = -2 * displayOrder;
                    style.transform = `scale(${scale}) translateY(${translateY}rem)`;
                    style.opacity = 1 - 0.2 * displayOrder;
                    style.zIndex = totalCards - displayOrder;
                    style.cursor = 'default';
                } else {
                    style.transform = 'scale(0)';
                    style.opacity = 0;
                    style.zIndex = 0;
                }

                const tagClasses = (type: 'featured' | 'default') =>
                    type === 'featured'
                        ? 'tag-featured'
                        : 'tag-default';

                return (
                    <div
                        ref={(el) => { cardRefs.current[index] = el; }}
                        key={testimonial.id}
                        className="testimonial-card"
                        style={style}
                        onMouseDown={(e) => handleDragStart(e, index)}
                        onTouchStart={(e) => handleDragStart(e, index)}
                    >
                        <div className="p-6 md:p-8">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm tracking-wide"
                                        style={{ background: testimonial.avatarGradient }}
                                    >
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <h3 className="testimonial-name">{testimonial.name}</h3>
                                        <p className="testimonial-role">{testimonial.role}</p>
                                    </div>
                                </div>
                                {/* Quote mark */}
                                <svg
                                    className="testimonial-quote-mark"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M9.333 21.333C7.493 21.333 6 19.84 6 18V14.667C6 10.985 8.985 8 12.667 8v2.667C10.826 10.667 9.333 12.16 9.333 14v.667H12v6.666H9.333zm13.334 0C20.827 21.333 19.333 19.84 19.333 18V14.667C19.333 10.985 22.318 8 26 8v2.667c-1.84 0-3.333 1.493-3.333 3.333v.667H25.333v6.666H22.667z"
                                        fill="currentColor"
                                        opacity="0.25"
                                    />
                                </svg>
                            </div>

                            {/* Quote */}
                            <blockquote className="testimonial-quote">
                                "{testimonial.quote}"
                            </blockquote>

                            {/* Footer */}
                            <div className="testimonial-footer">
                                <div className="flex flex-wrap gap-2">
                                    {testimonial.tags.map((tag, i) => (
                                        <span key={i} className={`tag ${tagClasses(tag.type)}`}>
                                            {tag.text}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 testimonial-stats">
                                    {testimonial.stats.map((stat, i) => {
                                        const IconComponent = stat.icon;
                                        return (
                                            <span key={i} className="flex items-center gap-1">
                                                <IconComponent className="w-3.5 h-3.5" />
                                                {stat.text}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Pagination dots */}
            <div className="pagination flex gap-2 justify-center absolute bottom-0 left-0 right-0">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        aria-label={`Go to testimonial ${index + 1}`}
                        onClick={() => navigate(index)}
                        className={`pagination-dot${activeIndex === index ? ' active' : ''}`}
                    />
                ))}
            </div>
        </section>
    );
};
