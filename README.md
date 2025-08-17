# Hand Tracking System MVP

A real-time hand and finger tracking system built with MediaPipe, React, and TypeScript.

## Features

- **Real-time Hand Detection**: Detects up to 2 hands simultaneously
- **21-Point Landmark Tracking**: Tracks all finger joints and palm landmarks
- **Handedness Identification**: Distinguishes between left and right hands
- **Visual Feedback**: Overlays landmarks and connections on live video
- **Data Export**: Export tracking data as JSON
- **High Performance**: Runs at 30 FPS on modern devices

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5174`

4. **Allow camera access** when prompted

## Usage

- The application will automatically start tracking hands when initialized
- **Red landmarks** = Left hand
- **Blue landmarks** = Right hand
- Key landmarks are numbered (0=wrist, 4=thumb tip, 8=index tip, etc.)
- Use the controls to toggle data output and export functionality

## System Requirements

- **Browser**: Chrome 88+, Firefox 85+, Safari 14+
- **Camera**: 720p webcam recommended
- **Hardware**: Modern CPU with integrated graphics
- **Internet**: Required for MediaPipe model download (16MB)

## Technical Architecture

- **Frontend**: React 18 + TypeScript
- **Computer Vision**: MediaPipe Hands v0.10.3
- **Build Tool**: Vite 4
- **Real-time Processing**: 30 FPS video processing pipeline

## Landmark Mapping

The system tracks 21 landmarks per hand:

```
0: WRIST
1-4: THUMB (CMC, MCP, IP, TIP)
5-8: INDEX_FINGER (MCP, PIP, DIP, TIP)
9-12: MIDDLE_FINGER (MCP, PIP, DIP, TIP)
13-16: RING_FINGER (MCP, PIP, DIP, TIP)
17-20: PINKY (MCP, PIP, DIP, TIP)
```

## Data Output Format

```json
{
  "timestamp": 1694523600000,
  "frameRate": 29.7,
  "hands": [
    {
      "handedness": "Left",
      "confidence": 0.987,
      "landmarks": [
        {
          "x": 0.521,
          "y": 0.634,
          "z": -0.012,
          "visibility": 0.956
        }
        // ... 20 more landmarks
      ]
    }
  ]
}
```

## Performance Optimization

- GPU acceleration via WebGL
- Automatic resolution fallback
- Efficient canvas rendering
- Memory usage optimization

## Troubleshooting

- **Camera not working**: Check browser permissions
- **Low performance**: Try closing other applications
- **Model loading fails**: Check internet connection
- **CORS errors**: Run from localhost, not file://

## License

MIT License - See LICENSE file for details