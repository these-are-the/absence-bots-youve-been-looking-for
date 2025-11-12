import { NextRequest, NextResponse } from 'next/server';

export async function generateStaticParams() {
  return [];
}

export async function GET(request: NextRequest, { params }: { params: { department: string } }) {
  return NextResponse.json({ success: true, data: [] });
}
