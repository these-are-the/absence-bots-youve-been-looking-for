import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { listAbsenceRequests } from '@/lib/db/absenceService';

export async function generateStaticParams() {
  return [];
}

async function handleGET(request: NextRequest, { params }: { params: { department: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    const absences = await listAbsenceRequests({
      department: params.department,
      startDate,
      endDate,
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

export const GET = withApiCheck(handleGET);
