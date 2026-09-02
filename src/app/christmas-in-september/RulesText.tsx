import React from "react";

/**
 * Renders a rules paragraph, turning three inline markers into real elements:
 *   [[TODO: ...]]        -> yellow highlight (an unresolved term, see content.ts)
 *   **bold**             -> <strong>
 *   [label](/href)       -> <a>
 */
export default function RulesText({ body }: { body: string }) {
    const parts = body.split(/(\[\[TODO:[^\]]*\]\]|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

    return (
        <>
            {parts.map((part, i) => {
                const todo = part.match(/^\[\[TODO:\s*([^\]]*)\]\]$/);
                if (todo) {
                    return (
                        <mark
                            key={i}
                            className="bg-[#F5C842] text-[#0a0a0a] font-bold px-1"
                            title="Unresolved before launch"
                        >
                            TODO: {todo[1].trim()}
                        </mark>
                    );
                }

                const bold = part.match(/^\*\*([^*]+)\*\*$/);
                if (bold) return <strong key={i} className="text-[#0a0a0a]">{bold[1]}</strong>;

                const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                if (link) {
                    return (
                        <a key={i} href={link[2]} className="underline text-[#0a0a0a]">
                            {link[1]}
                        </a>
                    );
                }

                return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </>
    );
}
