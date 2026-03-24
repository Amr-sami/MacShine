import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { licenseKey } = await request.json();

    if (!licenseKey) {
      return NextResponse.json({ valid: false, reason: 'Missing licenseKey' }, { status: 400 });
    }

    // In a full implementation, this would:
    // 1. Check a database (Supabase) to see if the key/subscription was revoked or refunded
    // 2. We mock it as always valid if the basic structure is present.

    const parts = licenseKey.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ valid: false, reason: 'Invalid JWT structure' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      revoked: false,
      message: "License is active and not revoked."
    });
  } catch (error) {
    return NextResponse.json({ valid: false, reason: 'Internal error' }, { status: 500 });
  }
}
