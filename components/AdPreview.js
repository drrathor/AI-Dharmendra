import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceholderContent } from './PlaceholderContent';

export const AdPreview = ({ ad, image, format, onEdit, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(ad);
  const [showControls, setShowControls] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  const formatStyles = {
    social: {
      container: 'w-full max-w-7xl mx-auto px-4',
      wrapper: 'relative aspect-square overflow-hidden rounded-xl shadow-lg',
      image: 'w-full h-full object-cover',
      text: 'absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-white transform transition-all duration-300'
    },
    banner: {
      container: 'w-full max-w-7xl mx-auto px-4',
      wrapper: 'relative aspect-[2/1] overflow-hidden rounded-xl shadow-lg',
      image: 'w-full h-full object-cover',
      text: 'absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-white transform transition-all duration-300'
    },
    email: {
      container: 'w-full max-w-2xl mx-auto px-4',
      wrapper: 'relative overflow-hidden rounded-xl shadow-lg',
      image: 'w-full h-full object-cover',
      text: 'p-6 bg-gradient-to-b from-black/90 to-black/95 text-white transform transition-all duration-300'
    }
  };

  const handleSave = () => {
    onEdit(editedText);
    setIsEditing(false);
  };

  const handleDownload = async () => {
    try {
      // First try to download directly
      const link = document.createElement('a');
      link.href = image;
      link.download = `ad-${format}-${new Date().getTime()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // If direct download fails, try fetching the image
      try {
        const response = await fetch(image, {
          mode: 'cors',
          headers: {
            'Accept': 'image/*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-${format}-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (fetchError) {
        console.warn('Fetch download failed:', fetchError);
        // If both methods fail, open the image in a new tab
        window.open(image, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      // Show error message to user
      alert('Unable to download the image. Opening in a new tab instead.');
      window.open(image, '_blank');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Generated Ad',
            text: ad,
            url: image
          });
        } catch (shareError) {
          // Check if the error is due to user cancellation
          if (shareError.name === 'AbortError') {
            // User cancelled the share, no need to show error
            return;
          }
          // For other share errors, fall back to the URL method
          throw shareError;
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `${window.location.origin}/share?ad=${encodeURIComponent(ad)}&image=${encodeURIComponent(image)}`;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.warn('Share error:', error);
      // Provide multiple fallback options
      const fallbackUrl = `${window.location.origin}/share?ad=${encodeURIComponent(ad)}&image=${encodeURIComponent(image)}`;
      
      // Try to copy the share URL to clipboard
      try {
        await navigator.clipboard.writeText(fallbackUrl);
        alert('Share URL copied to clipboard! You can paste it anywhere to share.');
      } catch (clipboardError) {
        console.warn('Clipboard error:', clipboardError);
        // If clipboard fails, just open the share page
        window.open(fallbackUrl, '_blank');
      }
    }
  };

  const LoadingAnimation = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl"
    >
      <div className="text-center space-y-4">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-white font-medium">Generating your ad...</p>
          <div className="text-white/80 text-sm space-y-1">
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >• Analyzing brand style</motion.p>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >• Creating visual elements</motion.p>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >• Optimizing for {format} format</motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const LoadingTips = () => (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-white p-6 rounded-xl shadow-lg space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800">Tips for Better Ads</h3>
      <div className="space-y-3">
        {[
          "Use clear, action-oriented language in your CTAs",
          "Keep your message concise and focused",
          "Highlight unique selling points"
        ].map((tip, index) => (
          <motion.div 
            key={index}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="flex items-start space-x-3"
          >
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">{index + 1}</span>
            </div>
            <p className="text-gray-600">{tip}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const TruncatedText = ({ text }) => {
    const lines = text.split('\n').slice(0, 4);
    const remainingLines = text.split('\n').slice(4);
    const hasMoreLines = remainingLines.length > 0;

    return (
      <div className="space-y-2">
        <div className={`text-sm leading-relaxed ${!isTextExpanded && 'line-clamp-4'}`}>
          {isTextExpanded ? text : lines.join('\n')}
        </div>
        {hasMoreLines && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTextExpanded(!isTextExpanded)}
            className="text-xs text-white/80 hover:text-white cursor-pointer backdrop-blur-sm px-2 py-1 rounded-md bg-white/10"
          >
            {isTextExpanded ? 'Show Less' : 'Read More'}
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          className={formatStyles[format].container}
          whileHover={{ scale: 1.0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div 
            className={`${formatStyles[format].wrapper} group cursor-pointer`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {image ? (
              <>
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  src={image}
                  alt="Generated ad visual"
                  className={formatStyles[format].image}
                />
                <motion.div 
                  className={`${formatStyles[format].text} group-hover:opacity-100 ${!showControls && 'opacity-0'}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: showControls ? 1 : 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {isEditing ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-3"
                    >
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full p-3 bg-black/30 backdrop-blur-sm rounded-lg border border-white/30 text-white cursor-text focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 text-sm"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: 'rgb(22 163 74)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer backdrop-blur-sm text-sm"
                        >
                          Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, backgroundColor: 'rgb(75 85 99)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer backdrop-blur-sm text-sm"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {showControls && (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          className="space-y-3"
                        >
                          <TruncatedText text={ad} />
                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/20">
                            <motion.button
                              whileHover={{ scale: 1.1, color: 'rgb(255 255 255)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-white/90 hover:text-white cursor-pointer backdrop-blur-sm flex items-center gap-1"
                            >
                              <span className="text-lg">✏️</span> Edit
                            </motion.button>
                            <span className="text-white/30">•</span>
                            <motion.button
                              whileHover={{ scale: 1.1, color: 'rgb(255 255 255)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleDownload}
                              className="text-sm text-white/90 hover:text-white cursor-pointer backdrop-blur-sm flex items-center gap-1"
                            >
                              <span className="text-lg">⬇️</span> Download
                            </motion.button>
                            <span className="text-white/30">•</span>
                            <motion.button
                              whileHover={{ scale: 1.1, color: 'rgb(255 255 255)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={handleShare}
                              className="text-sm text-white/90 hover:text-white cursor-pointer backdrop-blur-sm flex items-center gap-1"
                            >
                              <span className="text-lg">🔗</span> Share
                            </motion.button>
                            <span className="text-white/30">•</span>
                            <motion.a
                              whileHover={{ scale: 1.1, color: 'rgb(255 255 255)' }}
                              whileTap={{ scale: 0.9 }}
                              href={image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white/90 hover:text-white cursor-pointer backdrop-blur-sm flex items-center gap-1"
                            >
                              <span className="text-lg">🔍</span> View Full
                            </motion.a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100">
                {isLoading ? <LoadingAnimation /> : <PlaceholderContent format={format} />}
              </div>
            )}
          </div>
        </motion.div>
        
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4">
            <LoadingTips />
          </div>
        )}
      </div>
    </div>
  );
};
  