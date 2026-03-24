import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // In a real application, this payload would be validated via Zod
    // and then inserted into a Supabase 'sync_events' table.
    
    // Validate required fields roughly
    if (!payload.deviceId || !payload.sessionId || payload.totalFreedBytes === undefined) {
      return NextResponse.json({ error: 'Invalid sync payload' }, { status: 400 });
    }

    console.log('[Data Sync] Received payload from Desktop Client:');
    console.log(`- Device: ${payload.deviceName} (${payload.deviceId})`);
    console.log(`- Session: ${payload.sessionId}`);
    console.log(`- Freed: ${(payload.totalFreedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Modules:`, payload.moduleSummaries.map((m: any) => m.module).join(', '));

    return NextResponse.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[Data Sync Error]", error);
    return NextResponse.json({ error: 'Failed to process sync payload' }, { status: 500 });
  }
}
