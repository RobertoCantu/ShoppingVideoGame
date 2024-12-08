import { useEffect, useRef, useState } from 'react'
import './App.css'
import { SceneSetup } from './scene/scene'

function App() {
  const canvasRef = useRef(null)
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [scene, setNewScene] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current
    const scene = new SceneSetup(canvas, setLoading);  // Pass canvas to SceneSetup
    setNewScene(scene);
  }, []);

  const handleStartButtonClick = () => {
    // Hide the overlay and start the scene or animation
    setIsOverlayVisible(false);
    scene.player.lockPointer();
  };

  return (
    <div className="App">
      {isOverlayVisible && (
        <div id="startOverlay">
          <button id="startButton" onClick={handleStartButtonClick} disabled={loading}>
            Start
          </button>
        </div>
      )}
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  );
}

export default App
