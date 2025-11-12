import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { CreateAbsenceRequestInput } from '@/types/absence';
import { createAbsenceRequest, listAbsenceRequests } from '@/lib/db/absenceService';
import { getUserByEmail } from '@/lib/db/userService';

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get user to find manager if not provided
    let managerEmail = body.managerEmail;
    if (!managerEmail && body.userEmail) {
      const user = await getUserByEmail(body.userEmail);
      if (user && user.managerEmail) {
        managerEmail = user.managerEmail;
      }
    }

    const input: CreateAbsenceRequestInput = {
      userId: body.userId || 'anonymous',
      userEmail: body.userEmail || 'user@example.com',
      type: body.type,
      office: body.office,
      startDate: body.startDate,
      endDate: body.endDate,
      hours: body.hours,
      days: body.days,
      note: body.note,
      managerEmail,
    };

    const absence = await createAbsenceRequest(input);

    return NextResponse.json({ success: true, data: absence }, { status: 201 });
  } catch (error) {
    console.error('Error creating absence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create absence request' },
      { status: 500 }
    );
  }
}

async function handleGET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      userId: searchParams.get('userId') || undefined,
      userEmail: searchParams.get('userEmail') || undefined,
      department: searchParams.get('department') || undefined,
      managerEmail: searchParams.get('managerEmail') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('start_date') || undefined,
      endDate: searchParams.get('end_date') || undefined,
    };

    const absences = await listAbsenceRequests(filters);

    return NextResponse.json({ success: true, data: absences });
  } catch (error) {
    console.error('Error listing absences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list absence requests' },
      { status: 500 }
    );
  }
}

export const POST = withApiCheck(handlePOST);
export const GET = withApiCheck(handleGET);
