"use client";

export default function TopBar() {
    return (
        <>
            <style>{`
                @media (max-width: 767px) {
                    .topbar-hide-mobile { display: none !important; }
                }
            `}</style>
            <div
                className="topbar-hide-mobile"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    backgroundColor: "#111111",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 24px",
                }}
            >
                {/* Address */}
                <span
                    style={{
                        fontFamily: "var(--font-body), sans-serif",
                        fontSize: "13px",
                        color: "#6a6a68",
                        letterSpacing: "0.04em",
                    }}
                >
                    Now serving Franklin, TN
                </span>

                {/* Phone — turns orange on hover */}
                <a
                    href="tel:4702437517"
                    style={{
                        fontFamily: "var(--font-body), sans-serif",
                        fontSize: "13px",
                        color: "#6a6a68",
                        letterSpacing: "0.04em",
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#F26522")
                    }
                    onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#6a6a68")
                    }
                >
                    (470) 243-7517
                </a>
            </div>
        </>
    );
}
