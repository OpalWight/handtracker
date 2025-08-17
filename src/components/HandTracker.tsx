import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HandTrackingSystem } from '../core/HandTrackingSystem';
import { CameraManager } from '../utils/cameraUtils';
import { HandTrackingResult, HandTrackingConfig } from '../types/handTracking';

interface HandTrackerProps {
  config?: Partial<HandTrackingConfig>;
  onHandsDetected?: (result: HandTrackingResult) => void;
  showVideo?: boolean;
  showLandmarks?: boolean;
}

const DEFAULT_CONFIG: HandTrackingConfig = {
  modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
};

export const HandTracker: React.FC<HandTrackerProps> = ({
  config = {},
  onHandsDetected,
  showVideo = true,
  showLandmarks = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handsData, setHandsData] = useState<HandTrackingResult | null>(null);
  
  const handTrackingSystemRef = useRef<HandTrackingSystem>();
  const cameraManagerRef = useRef<CameraManager>();

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    let mounted = true;

    const initializeSystem = async () => {
      try {
        setError(null);
        
        // Initialize hand tracking system
        handTrackingSystemRef.current = new HandTrackingSystem(mergedConfig);
        await handTrackingSystemRef.current.initialize();
        
        // Initialize camera
        cameraManagerRef.current = new CameraManager();
        await cameraManagerRef.current.requestCameraAccess({
          width: 1280,
          height: 720,
          frameRate: 30
        });

        if (videoRef.current && mounted) {
          await cameraManagerRef.current.attachToVideo(videoRef.current);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize hand tracking');
        }
      }
    };

    initializeSystem();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (handTrackingSystemRef.current) {
        handTrackingSystemRef.current.dispose();
      }
      if (cameraManagerRef.current) {
        cameraManagerRef.current.stop();
      }
    };
  }, []);

  const drawLandmarks = useCallback((result: HandTrackingResult) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !showLandmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw landmarks for each hand
    result.hands.forEach((hand) => {
      const color = hand.handedness === 'Left' ? '#FF0000' : '#0000FF';
      
      // Draw landmarks
      hand.landmarks.forEach((landmark, index) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Label key landmarks
        if (index === 0 || index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
          ctx.fillStyle = 'white';
          ctx.font = '12px Arial';
          ctx.fillText(index.toString(), x + 8, y + 4);
        }
      });

      // Draw connections between landmarks
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      connections.forEach(([start, end]) => {
        const startPoint = hand.landmarks[start];
        const endPoint = hand.landmarks[end];
        
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
        ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
        ctx.stroke();
      });
    });
  }, [showLandmarks]);

  const processFrame = useCallback(() => {
    if (!handTrackingSystemRef.current || !videoRef.current || !isInitialized) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const timestamp = performance.now();
    const result = handTrackingSystemRef.current.processFrame(videoRef.current, timestamp);
    
    if (result) {
      setHandsData(result);
      drawLandmarks(result);
      
      if (onHandsDetected) {
        onHandsDetected(result);
      }
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isInitialized, onHandsDetected, drawLandmarks]);

  const startTracking = useCallback(() => {
    if (isInitialized && !isTracking) {
      setIsTracking(true);
      processFrame();
    }
  }, [isInitialized, isTracking, processFrame]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      startTracking();
    }
  }, [isInitialized, startTracking]);

  if (error) {
    return (
      <div className="hand-tracker-error" style={{ color: 'red', padding: '20px' }}>
        <h3>Error: {error}</h3>
        <p>Please check your camera permissions and try again.</p>
      </div>
    );
  }

  return (
    <div className="hand-tracker">
      <div className="video-container" style={{ position: 'relative', display: 'inline-block' }}>
        {showVideo && (
          <video
            ref={videoRef}
            style={{
              width: '640px',
              height: '480px',
              transform: 'scaleX(-1)', // Mirror the video
              border: '1px solid #ccc'
            }}
            playsInline
            muted
          />
        )}
        
        {showLandmarks && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '640px',
              height: '480px',
              transform: 'scaleX(-1)', // Mirror to match video
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div className="tracking-info" style={{ marginTop: '10px' }}>
        <p>Status: {isInitialized ? (isTracking ? 'Tracking' : 'Ready') : 'Initializing...'}</p>
        {handsData && (
          <div>
            <p>Frame Rate: {handsData.frameRate.toFixed(1)} FPS</p>
            <p>Hands Detected: {handsData.hands.length}</p>
            {handsData.hands.map((hand, index) => (
              <p key={index}>
                {hand.handedness} Hand - Confidence: {(hand.confidence * 100).toFixed(1)}%
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="controls" style={{ marginTop: '10px' }}>
        <button onClick={startTracking} disabled={!isInitialized || isTracking}>
          Start Tracking
        </button>
        <button onClick={stopTracking} disabled={!isTracking} style={{ marginLeft: '10px' }}>
          Stop Tracking
        </button>
      </div>
    </div>
  );
};