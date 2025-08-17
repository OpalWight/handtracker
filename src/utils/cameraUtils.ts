export interface CameraConfig {
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async requestCameraAccess(config: CameraConfig = {}): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: config.width || 1280 },
        height: { ideal: config.height || 720 },
        frameRate: { ideal: config.frameRate || 30 },
        facingMode: config.facingMode || 'user'
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Fallback to lower resolution
      const fallbackConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        }
      };

      try {
        this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        return this.stream;
      } catch (fallbackError) {
        console.error('Fallback camera access failed:', fallbackError);
        throw new Error('Unable to access camera. Please check your camera permissions.');
      }
    }
  }

  attachToVideo(videoElement: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('No camera stream available'));
        return;
      }

      this.videoElement = videoElement;
      videoElement.srcObject = this.stream;
      
      videoElement.onloadedmetadata = () => {
        videoElement.play()
          .then(() => resolve())
          .catch(reject);
      };

      videoElement.onerror = () => {
        reject(new Error('Failed to load video stream'));
      };
    });
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }
}