"use client";

export default function TopBar() {
    return (
        <div
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
                    fontSize: "12px",
                    color: "#cccccc",
                    letterSpacing: "0.04em",
                }}
            >
                222 West Montgomery St. Villa Rica, GA 30180
            </span>

            {/* Phone — turns orange on hover */}
            <a
                href="tel:4702437517"
                style={{
                    fontSize: "12px",
                    color: "#cccccc",
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                    transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "#F15F2A")
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "#cccccc")
                }
            >
                (470) 243-7517
            </a>
        </div>
    );
}
