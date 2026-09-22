"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopBar() {
    const pathname = usePathname();
    // Internal pages (call desk, admin panel + its login) don't get the marketing promo bar —
    // it's position:fixed and sits on top of their own headers.
    if (pathname === "/leads" || pathname.startsWith("/leads/") || pathname === "/admin" || pathname.startsWith("/admin/")) return null;
    return (
        <>
            <style>{`
                @media (max-width: 767px) {
                    .topbar-hide-mobile { display: none !important; }
                }
            `}</style>
            <div
                className="topbar-hide-mobile px-6 md:px-12"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    backgroundColor: "#fdb913",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "2px solid #1a1a1a",
                }}
            >
                <div
                    className="w-full flex justify-between items-center"
                    style={{ width: "100%" }}
                >
                    {/* Giveaway promo (swap back to the Franklin line after Sept 25) */}
                    <Link
                        href="/thebiggiveaway"
                        prefetch={false}
                        style={{
                            fontFamily: "var(--font-body), sans-serif",
                            fontSize: "12px",
                            color: "#1a1a1a",
                            fontWeight: "bold",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.color = "#e94e33")
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.color = "#1a1a1a")
                        }
                    >
                        🎁 CHRISTMAS IN SEPTEMBER: WIN A $44,000 MARKETING PACKAGE — ENTER BY SEPT 24 →
                    </Link>

                    {/* Phone — turns red-orange on hover */}
                    <a
                        href="tel:4702437517"
                        style={{
                            fontFamily: "var(--font-body), sans-serif",
                            fontSize: "12px",
                            color: "#1a1a1a",
                            fontWeight: "bold",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            transition: "color 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.color = "#e94e33")
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLAnchorElement).style.color = "#1a1a1a")
                        }
                    >
                        (470) 243-7517
                    </a>
                </div>
            </div>
        </>
    );
}
