import { NextRequest, NextResponse } from 'next/server';
import { getAbsenceRequest, updateAbsenceRequest, deleteAbsenceRequest } from '@/lib/db/absenceService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const absence = await getAbsenceRequest(params.id);
    
    if (!absence) {
      return NextResponse.json(
        { success: false, error: 'Absence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: absence });
  } catch (error) {
    console.error('Error getting absence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get absence request' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const update = {
      status: body.status,
      note: body.note,
    };

    const updated = await updateAbsenceRequest(params.id, update);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Absence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating absence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update absence request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteAbsenceRequest(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Absence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting absence:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete absence request' },
      { status: 500 }
    );
  }
}
