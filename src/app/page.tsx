'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setConversionError(null);
    setConvertedFile(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setConversionError('Please select a video file');
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.mp4') && !file.name.toLowerCase().endsWith('.mkv')) {
      setConversionError('Only MP4 and MKV files are supported');
      return;
    }
    
    setIsConverting(true);
    setConversionError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }
      
      setConvertedFile(data.mp3Filename);
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionError((error as Error).message || 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };
  
  const handleDownload = () => {
    if (convertedFile) {
      window.location.href = `/api/download/${convertedFile}`;
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setConversionError(null);
    setConvertedFile(null);
    
    // Reset the file input by clearing its value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">MP4 to MP3 Converter</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".mp4,.mkv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              {file ? file.name : 'Select MP4 or MKV Video File'}
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!file || isConverting}
            className={`w-full py-2 px-4 text-white font-medium rounded-md ${
              !file || isConverting
                ? 'bg-blue-300'
                : 'bg-blue-500 hover:bg-blue-700'
            }`}
          >
            {isConverting ? 'Converting...' : 'Convert to MP3'}
          </button>
        </form>
        
        {conversionError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {conversionError}
          </div>
        )}
        
        {convertedFile && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
            <p className="mb-2">Conversion successful!</p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 bg-green-500 text-white font-medium rounded-md hover:bg-green-700"
              >
                Download MP3
              </button>
              <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Convert Another File
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Note: This tool requires FFmpeg to be installed on the server.</p>
          <p>Supports MP4 and MKV to MP3 conversion.</p>
        </div>
      </main>
    </div>
  );
}
