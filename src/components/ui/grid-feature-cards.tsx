import { cn } from "@/lib/utils";
import React from "react";

type FeatureType = {
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
    step: string;
};

type FeatureCardProps = React.ComponentProps<"div"> & {
    feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
    const p = genRandomPattern();

    return (
        <div className={cn("relative overflow-hidden p-8", className)} {...props}>
            {/* Grid pattern overlay */}
            <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-black/[0.01] [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
                    <GridPattern
                        width={20}
                        height={20}
                        x="-12"
                        y="4"
                        squares={p}
                        className="absolute inset-0 h-full w-full fill-black/5 stroke-black/15 mix-blend-multiply"
                    />
                </div>
            </div>

            {/* Step number watermark */}
            <p
                style={{
                    fontSize: "48px",
                    fontWeight: 900,
                    color: "rgba(26,21,20,0.07)",
                    lineHeight: 1,
                    marginBottom: "16px",
                    fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
            >
                {feature.step}
            </p>

            {/* Icon */}
            <feature.icon
                className="size-6 mb-4"
                style={{ color: "#F15F2A" }}
                strokeWidth={1.5}
                aria-hidden
            />

            {/* Title */}
            <h3
                style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1a1514",
                    marginBottom: "8px",
                    fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
            >
                {feature.title}
            </h3>

            {/* Description */}
            <p
                style={{
                    fontSize: "13px",
                    lineHeight: 1.75,
                    color: "rgba(26,21,20,0.50)",
                    margin: 0,
                    fontFamily: "var(--font-geist-sans, sans-serif)",
                }}
            >
                {feature.description}
            </p>
        </div>
    );
}

function GridPattern({
    width,
    height,
    x,
    y,
    squares,
    ...props
}: React.ComponentProps<"svg"> & {
    width: number;
    height: number;
    x: string;
    y: string;
    squares?: number[][];
}) {
    const patternId = React.useId();

    return (
        <svg aria-hidden="true" {...props}>
            <defs>
                <pattern
                    id={patternId}
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                    x={x}
                    y={y}
                >
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([sx, sy], index) => (
                        <rect
                            strokeWidth="0"
                            key={index}
                            width={width + 1}
                            height={height + 1}
                            x={sx * width}
                            y={sy * height}
                        />
                    ))}
                </svg>
            )}
        </svg>
    );
}

function genRandomPattern(length?: number): number[][] {
    length = length ?? 5;
    return Array.from({ length }, () => [
        Math.floor(Math.random() * 4) + 7,
        Math.floor(Math.random() * 6) + 1,
    ]);
}
