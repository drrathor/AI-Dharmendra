'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SharePage() {
  const searchParams = useSearchParams();
  const [ad, setAd] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const adParam = searchParams.get('ad');
    const imageParam = searchParams.get('image');
    
    if (adParam) setAd(decodeURIComponent(adParam));
    if (imageParam) setImage(decodeURIComponent(imageParam));
  }, [searchParams]);

  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shared-ad-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Shared Ad
          </h1>

          {image && (
            <div className="relative">
              <img
                src={image}
                alt="Shared ad visual"
                className="w-full rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="text-sm">{ad}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ⬇️ Download Image
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 