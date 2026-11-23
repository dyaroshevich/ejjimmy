/**
 * Setup LINE Rich Menu via API
 * POST /api/setup-rich-menu
 */

import { NextResponse } from 'next/server';
import { setupRichMenu } from '@/lib/line-rich-menu';
import { isAdminAuthorized } from '@/lib/admin-auth';
import path from 'path';

export async function POST() {
  try {
    if (!(await isAdminAuthorized())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imagePath = path.join(process.cwd(), 'public/assets/line-rich-menu.png');

    const menuId = await setupRichMenu(imagePath);

    return NextResponse.json({
      status: 'success',
      richMenuId: menuId
    });
  } catch (error: any) {
    console.error('[ERROR] Rich Menu Setup Failed:', error);
    return NextResponse.json({
      status: 'error',
      error: process.env.NODE_ENV === 'production' ? 'Setup failed' : error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Rich menu setup endpoint',
    instructions: 'POST to this endpoint to activate rich menu'
  });
}