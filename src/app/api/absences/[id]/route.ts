import { NextRequest, NextResponse } from 'next/server';
import { withApiCheck } from '@/lib/apiWrapper';
import { getAbsenceRequest, updateAbsenceRequest, deleteAbsenceRequest } from '@/lib/db/absenceService';

async function handleGET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const absence = await getAbsenceRequest(params.id);
    if (!absence) {
      return NextResponse.json({ success: false, error: 'Absence not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: absence });
  } catch (error) {
    console.error('Error getting absence:', error);
    return NextResponse.json({ success: false, error: 'Failed to get absence' }, { status: 500 });
  }
}

async function handlePATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json();
    const absence = await updateAbsenceRequest(params.id, updates);
    if (!absence) {
      return NextResponse.json({ success: false, error: 'Absence not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: absence });
  } catch (error) {
    console.error('Error updating absence:', error);
    return NextResponse.json({ success: false, error: 'Failed to update absence' }, { status: 500 });
  }
}

async function handleDELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await deleteAbsenceRequest(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Absence not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting absence:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete absence' }, { status: 500 });
  }
}

export const GET = withApiCheck(handleGET);
export const PATCH = withApiCheck(handlePATCH);
export const DELETE = withApiCheck(handleDELETE);
