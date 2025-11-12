import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { listAbsenceRequests } from '@/lib/db/absenceService';

// Required for static export
export async function generateStaticParams() {
  return []; // Return empty array for static build
}

async function handleGET(request: NextRequest, { params }: { params: { managerEmail: string } }) {
  try {
    const decodedEmail = decodeURIComponent(params.managerEmail);
    
    const absences = await listAbsenceRequests({
      managerEmail: decodedEmail,
    });

    return NextResponse.json({ success: true, data: absences });
  } catch (error) {
    console.error('Error getting manager absences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get manager absences' },
      { status: 500 }
    );
  }
}

export const GET = withApiCheck(handleGET);
