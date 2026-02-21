'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
    useEffect(() => {
        // Force the browser to start at the very top on every page load/refresh
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    return null;
}
