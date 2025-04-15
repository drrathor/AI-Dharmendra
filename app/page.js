'use client';

import { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { BrandForm } from '@/components/BrandForm';
import { AdPreview } from '@/components/AdPreview';
import { UploadArea } from '@/components/UploadArea';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [referenceAd, setReferenceAd] = useState('');
  const [brandStyle, setBrandStyle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState(null);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('social');
  const [generateVariations, setGenerateVariations] = useState(false);
  const [variationCount, setVariationCount] = useState(3);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle localStorage after mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openaiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySaved(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openaiApiKey', apiKey);
      setIsApiKeySaved(true);
      setError('');
    } else {
      setError('Please enter a valid API key');
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('openaiApiKey');
    setApiKey('');
    setIsApiKeySaved(false);
  };

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const formats = [
    { value: 'social', label: 'Social Media' },
    { value: 'banner', label: 'Banner Ad' },
    { value: 'email', label: 'Email Marketing' },
  ];

  const generateAd = async () => {
    if (!apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    setLoading(true);
    setGeneratedAd(null);
    setError('');
    setSelectedVariation(0);

    try {
      const formData = new FormData();
      formData.append('referenceAd', referenceAd);
      formData.append('brandStyle', brandStyle);
      formData.append('format', format);
      formData.append('variations', generateVariations);
      formData.append('variationCount', variationCount);
      formData.append('apiKey', apiKey);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/generateAd', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedAd(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl) => {
    if (!imageUrl) {
      console.error('No image URL found for download');
      return;
    }
  
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-ad-${format}-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCroppedImg = async (imageSrc, crop) => {
    try {
      const createImage = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = (error) => reject(new Error('Failed to load image: ' + error.message));
        });
      };

      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas size to match the cropped area
      canvas.width = crop.width;
      canvas.height = crop.height;

      // Draw the cropped portion of the image
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty'));
              return;
            }
            const url = URL.createObjectURL(blob);
            resolve(url);
          },
          'image/png',
          0.95 // Quality setting
        );
      });
    } catch (error) {
      console.error('Error in getCroppedImg:', error);
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] bg-gradient-to-br from-pink-200/20 to-indigo-200/20 rounded-full blur-2xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Main Title */}
        <div className="heading-container mb-5">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-center heading-animation text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center gap-4 mb-4"
          >
            <span className="emoji-float">🎯</span>
            <span className="ai-icon relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366f1"/>
                      <stop offset="0.5" stopColor="#a855f7"/>
                      <stop offset="1" stopColor="#ec4899"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </span>
            <span>Ad Generator</span>
          </motion.h1>
  
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 1
                  }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 text-white"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <path d="M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </motion.svg>
                </motion.div>
                <div>
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  >
                    Create Your Ad
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-gray-500"
                  >
                    Generate engaging ads with AI
                  </motion.p>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.6
                }}
                className="relative"
              >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-ping opacity-75" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <motion.span
                    animate={{
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="text-xl"
                  >
                    ✨
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>

            {/* API Key Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                {!isApiKeySaved ? (
                  <>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setIsApiKeySaved(false);
                        }}
                        placeholder="Enter your OpenAI API key"
                        className="w-full p-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showApiKey ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={handleSaveApiKey}
                        className="px-6 py-2 text-white rounded-xl transition-all bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Save API Key
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">✓</span>
                        <span className="text-gray-700">API Key Saved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setApiKey('');
                            setIsApiKeySaved(false);
                          }}
                          className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          Change Key
                        </button>
                        <button
                          onClick={handleRemoveApiKey}
                          className="text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          Remove Key
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Your API key is securely stored in your browser's local storage.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Paste your reference ad text here..."
                value={referenceAd}
                onChange={(e) => setReferenceAd(e.target.value)}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <BrandForm value={brandStyle} onChange={setBrandStyle} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <UploadArea onFileSelect={setImageFile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700">
                Ad Format
              </label>
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center justify-between"
                >
                  <span className="text-gray-700">
                    {formats.find(f => f.value === format)?.label}
                  </span>
                  <motion.div
                    animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                      {formats.map((f) => (
                        <motion.button
                          key={f.value}
                          whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFormat(f.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            format === f.value
                              ? 'bg-purple-100 text-purple-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              format === f.value ? 'bg-purple-500' : 'bg-gray-300'
                            }`} />
                            <span>{f.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-4"
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={generateVariations}
                  onChange={(e) => setGenerateVariations(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Generate Variations</span>
              </label>
              {generateVariations && (
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={variationCount}
                  onChange={(e) => setVariationCount(parseInt(e.target.value))}
                  className="w-20 p-2 border border-gray-300 rounded-lg"
                />
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateAd}
              disabled={loading || !referenceAd || !brandStyle}
              className="w-full py-4 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg"
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Generating Ad...
                </motion.span>
              ) : (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🚀 Generate Ad
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Output Section */}
          {generatedAd && (
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Generated Ad
              </h2>
              
              {generateVariations ? (
                <div className="space-y-4">
                  <div className="flex space-x-2 overflow-x-auto pb-4">
                    {Array.from({ length: variationCount }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariation(index)}
                        className={`px-4 py-2 rounded-lg ${
                          selectedVariation === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        Variation {index + 1}
                      </button>
                    ))}
                  </div>

                  <AdPreview
                    ad={generatedAd.result[selectedVariation].text}
                    image={generatedAd.result[selectedVariation].image}
                    format={format}
                    onEdit={(newText) => {
                      setGeneratedAd(prev => ({
                        ...prev,
                        result: prev.result.map((r, i) => 
                          i === selectedVariation ? { ...r, text: newText } : r
                        )
                      }));
                    }}
                    isLoading={loading}
                  />
                </div>
              ) : (
                <AdPreview
                  ad={generatedAd.result.text}
                  image={generatedAd.result.image}
                  format={format}
                  onEdit={(newText) => {
                    setGeneratedAd(prev => ({
                      ...prev,
                      result: { ...prev.result, text: newText }
                    }));
                  }}
                  isLoading={loading}
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(generateVariations ? generatedAd.result[selectedVariation].image : generatedAd.result.image)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ⬇️ Download Image
                </button>
                <button
                  onClick={() => window.open(generateVariations ? generatedAd.result[selectedVariation].image : generatedAd.result.image, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  🔗 Share
                </button>
                <button
                  onClick={() => setCropModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  ✂️ Crop/Resize
                </button>
              </div>
            </div>
          )}

          {loading && !generatedAd && (
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold">Generating Your Ad</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-square bg-gray-100 rounded-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700 font-medium">Creating your ad...</p>
                        <div className="text-gray-500 text-sm space-y-1">
                          <p>• Analyzing brand style</p>
                          <p>• Creating visual elements</p>
                          <p>• Optimizing for {format} format</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Tips for Better Ads</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">1</span>
                      </div>
                      <p className="text-gray-600">Use clear, action-oriented language in your CTAs</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">2</span>
                      </div>
                      <p className="text-gray-600">Keep your message concise and focused</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">3</span>
                      </div>
                      <p className="text-gray-600">Highlight unique selling points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {cropModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90vw] h-[80vh] relative flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Crop & Resize Image</h2>
                <button
                  onClick={() => setCropModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 relative">
                <Cropper
                  image={generateVariations ? generatedAd.result[selectedVariation].image : generatedAd.result.image}
                  crop={crop}
                  zoom={zoom}
                  aspect={format === 'social' ? 1 : format === 'banner' ? 2 : 4/3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                  cropShape="rect"
                  showGrid={true}
                  style={{
                    containerStyle: {
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setZoom(prev => Math.max(prev - 0.1, 1))}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-sm">Zoom: {Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Reset
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const croppedImage = await getCroppedImg(
                          generateVariations ? generatedAd.result[selectedVariation].image : generatedAd.result.image,
                          croppedAreaPixels
                        );
                        if (generateVariations) {
                          setGeneratedAd(prev => ({
                            ...prev,
                            result: prev.result.map((r, i) => 
                              i === selectedVariation ? { ...r, image: croppedImage } : r
                            )
                          }));
                        } else {
                          setGeneratedAd(prev => ({
                            ...prev,
                            result: { ...prev.result, image: croppedImage }
                          }));
                        }
                        setCropModalOpen(false);
                      } catch (error) {
                        console.error('Error cropping image:', error);
                        alert('Failed to crop image. Please try again.');
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}