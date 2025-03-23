import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Security check to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }
    
    const outputDir = join(process.cwd(), 'output');
    const filePath = join(outputDir, filename);
    
    // Check if the file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the file
    const fileContent = await readFile(filePath);
    
    // Create a response with the file content
    const response = new NextResponse(fileContent);
    
    // Set appropriate headers
    response.headers.set('Content-Type', 'audio/mpeg');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 