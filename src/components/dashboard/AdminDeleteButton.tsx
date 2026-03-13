"use client";

import { useTransition } from "react";
import { deleteClientAction } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

export default function AdminDeleteButton({ slug, name }: { slug: string; name: string }) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete() {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        startTransition(async () => {
            await deleteClientAction(slug);
            router.refresh();
        });
    }

    return (
        <button
            onClick={handleDelete}
            disabled={pending}
            style={{
                fontSize: "12px",
                fontWeight: 600,
                color: pending ? "rgba(248,113,113,0.4)" : "#f87171",
                padding: "5px 12px",
                borderRadius: "7px",
                border: "1px solid rgba(248,113,113,0.2)",
                background: "rgba(248,113,113,0.06)",
                cursor: pending ? "not-allowed" : "pointer",
            }}
        >
            {pending ? "Deleting…" : "Delete"}
        </button>
    );
}
