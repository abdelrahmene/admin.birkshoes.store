import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Export endpoint not implemented yet' }, { status: 501 });
}
