import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { listAbsenceRequests } from '@/lib/db/absenceService';

export async function generateStaticParams() {
  return [];
}

async function handleGET(request: NextRequest, { params }: { params: { email: string } }) {
  try {
    const decodedEmail = decodeURIComponent(params.email);
    
    const absences = await listAbsenceRequests({
      userEmail: decodedEmail,
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

export const GET = withApiCheck(handleGET);
