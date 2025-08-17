import React from 'react';
import { HandTrackingResult } from '../types/handTracking';

interface DataOutputProps {
  data: HandTrackingResult | null;
  showRawData?: boolean;
  showJsonExport?: boolean;
}

export const DataOutput: React.FC<DataOutputProps> = ({ 
  data, 
  showRawData = false, 
  showJsonExport = true 
}) => {
  const exportToJson = () => {
    if (!data) return;
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hand-tracking-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const getLandmarkName = (index: number): string => {
    const names = [
      'WRIST', 'THUMB_CMC', 'THUMB_MCP', 'THUMB_IP', 'THUMB_TIP',
      'INDEX_FINGER_MCP', 'INDEX_FINGER_PIP', 'INDEX_FINGER_DIP', 'INDEX_FINGER_TIP',
      'MIDDLE_FINGER_MCP', 'MIDDLE_FINGER_PIP', 'MIDDLE_FINGER_DIP', 'MIDDLE_FINGER_TIP',
      'RING_FINGER_MCP', 'RING_FINGER_PIP', 'RING_FINGER_DIP', 'RING_FINGER_TIP',
      'PINKY_MCP', 'PINKY_PIP', 'PINKY_DIP', 'PINKY_TIP'
    ];
    return names[index] || `LANDMARK_${index}`;
  };

  if (!data) {
    return (
      <div className="data-output" style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
        <h3>Hand Tracking Data</h3>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="data-output" style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Hand Tracking Data</h3>
        {showJsonExport && (
          <button onClick={exportToJson} style={{ padding: '8px 16px' }}>
            Export JSON
          </button>
        )}
      </div>

      <div className="summary" style={{ marginBottom: '20px' }}>
        <p><strong>Timestamp:</strong> {new Date(data.timestamp).toLocaleTimeString()}</p>
        <p><strong>Frame Rate:</strong> {data.frameRate.toFixed(1)} FPS</p>
        <p><strong>Hands Detected:</strong> {data.hands.length}</p>
      </div>

      {data.hands.map((hand, handIndex) => (
        <div key={handIndex} className="hand-data" style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          border: '1px solid #ddd',
          backgroundColor: hand.handedness === 'Left' ? '#ffe6e6' : '#e6e6ff'
        }}>
          <h4>{hand.handedness} Hand (Confidence: {(hand.confidence * 100).toFixed(1)}%)</h4>
          
          <div className="landmarks-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '10px',
            marginTop: '10px'
          }}>
            {hand.landmarks.slice(0, 5).map((landmark, index) => (
              <div key={index} className="landmark-summary" style={{ 
                padding: '8px', 
                backgroundColor: 'white',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>{getLandmarkName(index)}</strong><br/>
                X: {landmark.x.toFixed(3)}<br/>
                Y: {landmark.y.toFixed(3)}<br/>
                Z: {landmark.z.toFixed(3)}
              </div>
            ))}
          </div>

          {showRawData && (
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Show All 21 Landmarks
              </summary>
              <div style={{ 
                maxHeight: '300px', 
                overflow: 'auto', 
                marginTop: '10px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}>
                {hand.landmarks.map((landmark, index) => (
                  <div key={index} style={{ padding: '2px 0', borderBottom: '1px solid #eee' }}>
                    <strong>{index}: {getLandmarkName(index)}</strong> - 
                    X: {landmark.x.toFixed(4)}, 
                    Y: {landmark.y.toFixed(4)}, 
                    Z: {landmark.z.toFixed(4)}
                    {landmark.visibility && `, Visibility: ${landmark.visibility.toFixed(3)}`}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ))}

      {showRawData && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Raw JSON Data
          </summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};