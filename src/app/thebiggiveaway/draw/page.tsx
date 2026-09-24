import type { Metadata } from "next";
import DrawStage from "./DrawStage";

/**
 * Winner draw for the Christmas in September giveaway — the screen we film.
 *
 * Private tool: noindex, not linked from anywhere. Entries are loaded from a
 * CSV export of the entries Sheet and never leave the browser; the page itself
 * holds no data, so there is nothing here to protect server-side.
 */
export const metadata: Metadata = {
    title: "Giveaway Draw",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function DrawPage() {
    return <DrawStage />;
}
