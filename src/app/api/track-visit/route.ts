import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get IP from headers (works on Vercel / most hosts)
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'Unknown';

        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        if (!webhookUrl) {
            console.warn('GOOGLE_SHEETS_WEBHOOK_URL is not set.');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
                proposal: body.proposal,
                ip,
                userAgent: body.userAgent ?? 'Unknown',
                referrer: body.referrer || 'Direct',
            }),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track visit error:', error);
        return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
    }
}
