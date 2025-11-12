import { NextRequest, NextResponse } from 'next/server';
import { listAbsenceRequests } from '@/lib/db/absenceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const status = searchParams.get('status') || undefined;

    const decodedEmail = decodeURIComponent(params.email);

    const absences = await listAbsenceRequests({
      userEmail: decodedEmail,
      startDate,
      endDate,
      status,
    });

    return NextResponse.json({ success: true, data: absences });
  } catch (error) {
    console.error('Error getting user absences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user absences' },
      { status: 500 }
    );
  }
}
