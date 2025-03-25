import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

// Create uploads and output directories if they don't exist
const UPLOADS_DIR = join(process.cwd(), 'uploads');
const OUTPUT_DIR = join(process.cwd(), 'output');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    // Check if a file was provided
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check if the file is an MP4 or MKV
    if (!file.name.toLowerCase().endsWith('.mp4') && !file.name.toLowerCase().endsWith('.mkv')) {
      return NextResponse.json({ error: 'Only MP4 and MKV files are supported' }, { status: 400 });
    }
    
    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const inputPath = join(UPLOADS_DIR, filename);
    
    // Convert the file to buffer and save it
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);
    
    // Generate output filename
    const outputFilename = filename.replace(/\.(mp4|mkv)$/i, '.mp3');
    const mp3Path = join(OUTPUT_DIR, outputFilename);
    
    try {
      // Execute ffmpeg command to convert the video to audio
      execSync(`ffmpeg -i "${inputPath}" -q:a 0 -map a "${mp3Path}" -y`);
      
      // Return the path to the converted file
      return NextResponse.json({ 
        success: true, 
        mp3Filename: outputFilename
      });
    } catch (error) {
      console.error('FFmpeg conversion error:', error);
      return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 