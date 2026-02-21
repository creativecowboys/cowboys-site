"use client";

import {
    IoHomeOutline,
    IoBriefcaseOutline,
    IoPeopleOutline,
    IoMailOutline,
    IoChatbubbleOutline,
} from "react-icons/io5";
import type { IconType } from "react-icons";

interface NavItem {
    name: string;
    icon: IconType;
    gradientFrom: string;
    gradientTo: string;
    href?: string;
}

const navItems: NavItem[] = [
    {
        name: "Home",
        icon: IoHomeOutline,
        gradientFrom: "#F15F2A",
        gradientTo: "#DBC792",
        href: "/",
    },
    {
        name: "Services",
        icon: IoBriefcaseOutline,
        gradientFrom: "#2A9CF1",
        gradientTo: "#92A6DB",
        href: "/#services",
    },
    {
        name: "About",
        icon: IoPeopleOutline,
        gradientFrom: "#F15F2A",
        gradientTo: "#EA51FF",
    },
    {
        name: "Contact",
        icon: IoMailOutline,
        gradientFrom: "#2A9CF1",
        gradientTo: "#56CCF2",
    },
    {
        name: "Let's Talk",
        icon: IoChatbubbleOutline,
        gradientFrom: "#F15F2A",
        gradientTo: "#FF5E62",
    },
];

export default function FloatingNav() {
    return (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 shadow-2xl">
                {navItems.map((item) => {
                    const content = (
                        <>
                            {/* Gradient background */}
                            <div
                                className="nav-bg"
                                style={{
                                    background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                                }}
                            />
                            {/* Glow effect */}
                            <div
                                className="nav-glow"
                                style={{
                                    background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                                }}
                            />
                            {/* Icon */}
                            <span className="nav-icon">
                                <item.icon size={24} />
                            </span>
                            {/* Label */}
                            <span className="nav-label">{item.name}</span>
                        </>
                    );

                    if (item.href) {
                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className="nav-item"
                                aria-label={item.name}
                                style={{ textDecoration: "none" }}
                            >
                                {content}
                            </a>
                        );
                    }
                    return (
                        <button key={item.name} className="nav-item" aria-label={item.name}>
                            {content}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
