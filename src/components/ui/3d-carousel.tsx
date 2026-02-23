"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
    AnimatePresence,
    motion,
    useAnimation,
    useMotionValue,
    useTransform,
} from "motion/react";

/* ── isomorphic layout effect ───────────────────────── */
export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── useMediaQuery ───────────────────────────────────── */
type UseMediaQueryOptions = {
    defaultValue?: boolean;
    initializeWithValue?: boolean;
};
const IS_SERVER = typeof window === "undefined";
export function useMediaQuery(
    query: string,
    { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {}
): boolean {
    const getMatches = (q: string): boolean =>
        IS_SERVER ? defaultValue : window.matchMedia(q).matches;

    const [matches, setMatches] = useState<boolean>(() =>
        initializeWithValue ? getMatches(query) : defaultValue
    );

    useIsomorphicLayoutEffect(() => {
        const matchMedia = window.matchMedia(query);
        setMatches(matchMedia.matches);
        const handler = () => setMatches(matchMedia.matches);
        matchMedia.addEventListener("change", handler);
        return () => matchMedia.removeEventListener("change", handler);
    }, [query]);

    return matches;
}

/* ── Animation constants ─────────────────────────────── */
const duration = 0.15;
const transition = { duration, ease: [0.32, 0.72, 0, 1] as const };
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };

/* ── Inner carousel cylinder ─────────────────────────── */
const Carousel = memo(function Carousel({
    handleClick,
    controls,
    cards,
    isCarouselActive,
}: {
    handleClick: (imgUrl: string, index: number) => void;
    controls: ReturnType<typeof useAnimation>;
    cards: string[];
    isCarouselActive: boolean;
}) {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)");
    const cylinderWidth = isScreenSizeSm ? 1100 : 1800;
    const faceCount = cards.length;
    const faceWidth = cylinderWidth / faceCount;
    const radius = cylinderWidth / (2 * Math.PI);
    const rotation = useMotionValue(0);
    const transform = useTransform(
        rotation,
        (value) => `rotate3d(0, 1, 0, ${value}deg)`
    );

    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                perspective: "1000px",
                transformStyle: "preserve-3d",
                willChange: "transform",
            }}
        >
            <motion.div
                drag={isCarouselActive ? "x" : false}
                style={{
                    transform,
                    rotateY: rotation,
                    width: cylinderWidth,
                    transformStyle: "preserve-3d",
                    position: "relative",
                    display: "flex",
                    height: "100%",
                    originX: "50%",
                    cursor: "grab",
                    justifyContent: "center",
                }}
                onDrag={(_, info) =>
                    isCarouselActive &&
                    rotation.set(rotation.get() + info.offset.x * 0.05)
                }
                onDragEnd={(_, info) =>
                    isCarouselActive &&
                    controls.start({
                        rotateY: rotation.get() + info.velocity.x * 0.05,
                        transition: { type: "spring", stiffness: 100, damping: 30, mass: 0.1 },
                    })
                }
                animate={controls}
            >
                {cards.map((imgUrl, i) => (
                    <motion.div
                        key={`key-${imgUrl}-${i}`}
                        style={{
                            position: "absolute",
                            width: `${faceWidth}px`,
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            originX: "50%",
                            borderRadius: "16px",
                            padding: "8px",
                            transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
                        }}
                        onClick={() => handleClick(imgUrl, i)}
                    >
                        <motion.img
                            src={imgUrl}
                            alt={`portfolio-${i}`}
                            layoutId={`img-${imgUrl}`}
                            style={{
                                pointerEvents: "none",
                                width: "100%",
                                borderRadius: "14px",
                                objectFit: "cover",
                                aspectRatio: "1 / 1",
                                display: "block",
                            }}
                            initial={{ filter: "blur(4px)" }}
                            animate={{ filter: "blur(0px)" }}
                            transition={transition}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
});

/* ── Public export ───────────────────────────────────── */
export interface ThreeDPhotoCarouselProps {
    images?: string[];
}

const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&h=600&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=600&fit=crop&auto=format",
];

export function ThreeDPhotoCarousel({ images }: ThreeDPhotoCarouselProps) {
    const cards = useMemo(() => images ?? DEFAULT_IMAGES, [images]);
    const [activeImg, setActiveImg] = useState<string | null>(null);
    const [isCarouselActive, setIsCarouselActive] = useState(true);
    const controls = useAnimation();

    const handleClick = (imgUrl: string) => {
        setActiveImg(imgUrl);
        setIsCarouselActive(false);
        controls.stop();
    };

    const handleClose = () => {
        setActiveImg(null);
        setIsCarouselActive(true);
    };

    return (
        <motion.div layout style={{ position: "relative" }}>
            <AnimatePresence mode="sync">
                {activeImg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={handleClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.80)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 50,
                            margin: "20px",
                            borderRadius: "24px",
                            cursor: "zoom-out",
                            willChange: "opacity",
                        }}
                        transition={transitionOverlay}
                    >
                        <motion.img
                            layoutId={`img-${activeImg}`}
                            src={activeImg}
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                borderRadius: "16px",
                                boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
                                willChange: "transform",
                            }}
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ position: "relative", height: "500px", width: "100%", overflow: "hidden" }}>
                <Carousel
                    handleClick={handleClick}
                    controls={controls}
                    cards={cards}
                    isCarouselActive={isCarouselActive}
                />
            </div>
        </motion.div>
    );
}
