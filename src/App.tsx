import { useState } from 'react';
import { HandTracker } from './components/HandTracker';
import { DataOutput } from './components/DataOutput';
import { HandTrackingResult } from './types/handTracking';
import './App.css';

function App() {
  const [trackingData, setTrackingData] = useState<HandTrackingResult | null>(null);
  const [showDataOutput, setShowDataOutput] = useState(true);
  const [showRawData, setShowRawData] = useState(false);

  const handleHandsDetected = (result: HandTrackingResult) => {
    setTrackingData(result);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hand Tracking System MVP</h1>
        <p>Real-time hand and finger tracking using MediaPipe</p>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <h3>Controls</h3>
          <label>
            <input
              type="checkbox"
              checked={showDataOutput}
              onChange={(e) => setShowDataOutput(e.target.checked)}
            />
            Show Data Output
          </label>
          <label>
            <input
              type="checkbox"
              checked={showRawData}
              onChange={(e) => setShowRawData(e.target.checked)}
            />
            Show Raw Data
          </label>
        </div>

        <div className="tracking-section">
          <HandTracker
            onHandsDetected={handleHandsDetected}
            showVideo={true}
            showLandmarks={true}
            config={{
              numHands: 2,
              minHandDetectionConfidence: 0.5,
              minHandPresenceConfidence: 0.5,
              minTrackingConfidence: 0.5
            }}
          />
        </div>

        {showDataOutput && (
          <DataOutput 
            data={trackingData} 
            showRawData={showRawData}
            showJsonExport={true}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Hand Tracking MVP - Detects up to 2 hands with 21 landmarks each
        </p>
        <p>
          Features: Real-time tracking, handedness detection, coordinate export
        </p>
      </footer>
    </div>
  );
}

export default App;