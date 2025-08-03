import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';
import { useEffect, useRef, useState } from 'react';

function App() {
  console.log('App rendering');
  // Initialize all refs with proper values
  const splineRef = useRef<Application | null>(null);
  const modelRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const targetRotation = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const animationRef = useRef<number | undefined>(undefined);
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const updateRotation = (normalizedX: number, normalizedY: number) => {
    if (!modelRef.current) return;

    targetRotation.current.z = -(normalizedX - 0.5) * 40;
    targetRotation.current.x = (normalizedY - 0.5) * 40;
    console.log('Target rotation updated:', targetRotation.current);
  };

  const animate = () => {
    if (modelRef.current?.rotation) {
      currentRotation.current.x = lerp(currentRotation.current.x, targetRotation.current.x, 0.1);
      currentRotation.current.z = lerp(currentRotation.current.z, targetRotation.current.z, 0.1);

      // Apply rotation in radians
      modelRef.current.rotation.x = currentRotation.current.x * (Math.PI / 180);
      modelRef.current.rotation.z = currentRotation.current.z * (Math.PI / 180);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  const onLoad = (splineApp: Application) => {
    console.log('Spline loaded');
    splineRef.current = splineApp;
    const model = splineApp.findObjectByName('Group');
    console.log('Found model:', model);
    modelRef.current = model;

    // Start animation loop once model is loaded
    animate();

    // Tell parent we're ready
    window.parent.postMessage({ type: 'WHEEL_IFRAME_READY' }, '*');
  };

  useEffect(() => {
    console.log('Setting up event listeners');

    // Direct mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = e.clientX / window.innerWidth;
      const normalizedY = e.clientY / window.innerHeight;
      updateRotation(normalizedX, normalizedY);
    };

    // Parent window message handler
    const handleParentMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);

      if (event.data.type === 'MOUSE_MOVE') {
        const { normalizedX, normalizedY } = event.data;
        updateRotation(normalizedX, normalizedY);
      }

      // Handle scene change message
      if (event.data.type === 'CHANGE_SCENE') {
        const newSceneUrl = event.data.url.trim();
        console.log('Changing scene to:', newSceneUrl);

        // Reset rotation and refs before changing scene
        targetRotation.current = { x: 0, z: 0 };
        currentRotation.current = { x: 0, z: 0 };
        modelRef.current = null;

        setSceneUrl(newSceneUrl);
      }
    };

    // Add both event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('message', handleParentMessage);

    // Notify parent that we're initializing
    window.parent.postMessage({ type: 'IFRAME_INIT' }, '*');

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleParentMessage);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        pointerEvents: 'none'
      }}>
      {sceneUrl && <Spline scene={sceneUrl} onLoad={onLoad} />}
    </div>
  );
}

export default App;
