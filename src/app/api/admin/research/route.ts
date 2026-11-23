import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isAdminAuthorized } from '@/lib/admin-auth';
const pdf = require('pdf-parse');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'other';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 1. Duplicate Check via MD5
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    const { data: existingDoc } = await supabaseAdmin
      .from('research_documents')
      .select('id, title')
      .eq('file_hash', fileHash)
      .maybeSingle();

    if (existingDoc) {
      return NextResponse.json({ 
        success: true, 
        message: 'File already exists', 
        document: existingDoc,
        isDuplicate: true 
      });
    }

    // 2. Upload to Storage
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('research')
      .upload(fileName, buffer, {
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // 3. Extract Text Content (Basic)
    let content = '';
    if (file.type === 'application/pdf') {
      const pdfData = await pdf(buffer);
      content = pdfData.text;
    } else {
      content = new TextDecoder().decode(buffer);
    }

    // 4. Save Metadata to DB
    const { data: docData, error: dbError } = await supabaseAdmin
      .from('research_documents')
      .insert({
        title: file.name,
        file_path: uploadData.path,
        file_type: file.type,
        category: type,
        file_hash: fileHash,
        content: content, // Store full content for indexing later
        content_preview: content.substring(0, 10000), 
        metadata: {
          size: file.size,
          lastModified: file.lastModified,
          extractedChars: content.length
        }
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, document: docData }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Research upload error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('research_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Research GET error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
