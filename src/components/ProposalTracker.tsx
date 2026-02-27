'use client';

import { useEffect } from 'react';

interface ProposalTrackerProps {
    proposalName: string;
}

/**
 * Invisible component that fires a single tracking event when a proposal
 * page is first loaded. Data is logged to the Creative Cowboys Google Sheet.
 */
export default function ProposalTracker({ proposalName }: ProposalTrackerProps) {
    useEffect(() => {
        fetch('/api/track-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposal: proposalName,
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'Direct',
            }),
        }).catch(() => {
            // Silently fail — tracking should never break the page
        });
    }, [proposalName]);

    return null;
}
