import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { HandData, HandTrackingResult, HandTrackingConfig } from '../types/handTracking';

export class HandTrackingSystem {
  private handLandmarker: HandLandmarker | null = null;
  private isInitialized = false;
  private onHandsDetectedCallback?: (hands: HandTrackingResult) => void;
  private frameCount = 0;
  private lastFrameRateUpdate = 0;
  private currentFrameRate = 0;

  constructor(private config: HandTrackingConfig) {}

  async initialize(): Promise<void> {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelAssetPath,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: this.config.numHands,
        minHandDetectionConfidence: this.config.minHandDetectionConfidence,
        minHandPresenceConfidence: this.config.minHandPresenceConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize HandTrackingSystem:', error);
      throw error;
    }
  }

  processFrame(videoElement: HTMLVideoElement, timestamp: number): HandTrackingResult | null {
    if (!this.isInitialized || !this.handLandmarker) {
      return null;
    }

    try {
      const results = this.handLandmarker.detectForVideo(videoElement, timestamp);
      
      // Calculate frame rate
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFrameRateUpdate > 1000) {
        this.currentFrameRate = this.frameCount;
        this.frameCount = 0;
        this.lastFrameRateUpdate = now;
      }

      const hands: HandData[] = [];

      if (results.landmarks && results.handedness) {
        for (let i = 0; i < results.landmarks.length; i++) {
          const landmarks = results.landmarks[i];
          const worldLandmarks = results.worldLandmarks?.[i] || landmarks;
          const handedness = results.handedness[i];

          hands.push({
            handedness: handedness[0].categoryName as "Left" | "Right",
            landmarks: landmarks.map(landmark => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility
            })),
            worldLandmarks: worldLandmarks.map(landmark => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility
            })),
            timestamp,
            confidence: handedness[0].score
          });
        }
      }

      const result: HandTrackingResult = {
        timestamp,
        frameRate: this.currentFrameRate,
        hands
      };

      if (this.onHandsDetectedCallback) {
        this.onHandsDetectedCallback(result);
      }

      return result;
    } catch (error) {
      console.error('Error processing frame:', error);
      return null;
    }
  }

  onHandsDetected(callback: (hands: HandTrackingResult) => void): void {
    this.onHandsDetectedCallback = callback;
  }

  isReady(): boolean {
    return this.isInitialized && this.handLandmarker !== null;
  }

  dispose(): void {
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
    this.isInitialized = false;
  }
}