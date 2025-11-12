import { NextRequest, NextResponse } from 'next/server';
import { listAbsenceRequests } from '@/lib/db/absenceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { department: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const status = searchParams.get('status') || undefined;

    const absences = await listAbsenceRequests({
      department: params.department,
      startDate,
      endDate,
      status,
    });

    return NextResponse.json({ success: true, data: absences });
  } catch (error) {
    console.error('Error getting department absences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get department absences' },
      { status: 500 }
    );
  }
}
