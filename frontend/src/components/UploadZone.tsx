import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
  onFileChange: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Camera access denied or not available:', err);
      // Fallback to native input if camera access fails
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        // Flip horizontally if using user-facing camera (optional, but good for selfies)
        // For environment camera, usually not needed.
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
              onFileChange(file);
              stopCamera();
            }
          },
          'image/jpeg',
          0.8,
        );
      }
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Cleanup on unmount
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <motion.div
        key='actions'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className='grid md:grid-cols-2 gap-6'
      >
        {/* Upload Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className='group relative cursor-pointer'
        >
          <div className='relative h-64 bg-transparent rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 border-5 border-gray-400 dark:border-white/10 hover:border-brand-primary/50 transition-colors'>
            <div className='p-4 bg-brand-primary/10 rounded-2xl group-hover:bg-brand-primary/20 transition-colors'>
              <Upload className='w-10 h-10 text-brand-primary' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold'>Upload Image</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                Select from your gallery
              </p>
            </div>
          </div>
        </motion.div>

        {/* Camera Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startCamera}
          className='group relative cursor-pointer'
        >
          <div className='relative h-64 bg-transparent rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 border-5 border-gray-400 dark:border-white/10 hover:border-brand-accent/50 transition-colors'>
            <div className='p-4 bg-brand-accent/10 rounded-2xl group-hover:bg-brand-accent/20 transition-colors'>
              <Camera className='w-10 h-10 text-brand-accent' />
            </div>
            <div className='text-center'>
              <h3 className='text-xl font-bold'>Take Photo</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>Capture a fresh snap</p>
            </div>
          </div>
        </motion.div>

        {/* Hidden Inputs */}
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleInputChange}
          className='hidden'
          accept='image/*'
        />
        <input
          type='file'
          ref={cameraInputRef}
          onChange={handleInputChange}
          className='hidden'
          accept='image/*'
          capture='environment'
        />
      </motion.div>

      {/* Camera Overlay */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black flex flex-col items-center justify-center'
          >
            <div className='relative w-full h-full flex flex-col'>
              {/* Header Controls */}
              <div className='absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10'>
                <button
                  onClick={stopCamera}
                  className='p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>

              {/* Camera Viewfinder */}
              <div className='flex-1 relative overflow-hidden bg-black flex items-center justify-center'>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className='w-full h-full object-cover'
                />
                {/* Grid Overlay (Optional visual appeal) */}
                <div className='absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30'>
                  <div className='border-r border-b border-white/50'></div>
                  <div className='border-r border-b border-white/50'></div>
                  <div className='border-b border-white/50'></div>
                  <div className='border-r border-b border-white/50'></div>
                  <div className='border-r border-b border-white/50'></div>
                  <div className='border-b border-white/50'></div>
                  <div className='border-r border-white/50'></div>
                  <div className='border-r border-white/50'></div>
                  <div></div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className='absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center z-10'>
                <button onClick={capturePhoto} className='flex items-center justify-center'>
                  <div className='w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-95'>
                    <div className='w-16 h-16 rounded-full bg-white transition-colors hover:bg-gray-200'></div>
                  </div>
                </button>
              </div>

              <canvas ref={canvasRef} className='hidden' />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
