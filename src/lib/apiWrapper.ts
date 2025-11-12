import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/runtime';

export function withApiCheck(handler: (req: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    // Return 404 if API is disabled (static build)
    if (!config.apiEnabled) {
      return new NextResponse('API not available in static build', { status: 404 });
    }
    
    return handler(req, context);
  };
}
