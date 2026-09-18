"use client";

import { useEffect } from "react";

/**
 * Expand/collapse behaviour for the circled "i" buttons.
 *
 * One delegated listener rather than state on every row: the panels are plain
 * markup rendered by the server component, and the original build drove them
 * through aria-expanded / aria-controls / [hidden], which is already keyboard
 * accessible. Reproducing that verbatim keeps the a11y contract intact and
 * avoids turning the whole 300-line proposal into a client component.
 */
export default function InfoToggles() {
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>(".info");
            if (!btn) return;
            const id = btn.getAttribute("aria-controls");
            const panel = id ? document.getElementById(id) : null;
            if (!panel) return;
            const open = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", String(!open));
            panel.hidden = open;
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    return null;
}
