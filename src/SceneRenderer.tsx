import { useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';

interface SceneRendererProps {
  sceneUrl: string;
  onSceneReady?: () => void;
}

function SceneRenderer({ sceneUrl, onSceneReady }: SceneRendererProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const state = useRef({
    model: null as any,
    application: null as Application | null,
    animation: null as number | null,
    rotation: {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 }
    }
  });

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const updateRotation = (normalizedX: number, normalizedY: number) => {
    if (!state.current.model) return;

    state.current.rotation.target = {
      y: (normalizedX - 0.5) * 40, // Removed negative sign to reverse direction
      x: (normalizedY - 0.5) * 40 // Mouse Y controls X rotation (tilt forward/back)
    };
  };

  const startAnimation = () => {
    const animate = () => {
      const { model, rotation } = state.current;

      if (!model?.rotation) return;

      rotation.current.x = lerp(rotation.current.x, rotation.target.x, 0.1);
      rotation.current.y = lerp(rotation.current.y, rotation.target.y, 0.1);

      model.rotation.x = rotation.current.x * (Math.PI / 180);
      model.rotation.y = rotation.current.y * (Math.PI / 180);

      state.current.animation = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAnimation = () => {
    if (state.current.animation) {
      cancelAnimationFrame(state.current.animation);
      state.current.animation = null;
    }
  };

  const onLoad = (splineApp: Application) => {
    console.log('Spline scene loaded, finding wheel model...');
    state.current.application = splineApp;

    const model = splineApp.findObjectByName('wheel');
    if (!model) {
      console.warn('Wheel model not found in scene');
      return;
    }

    console.log('Wheel model found, initializing...');
    state.current.model = model;

    // Initialize mouse position to center on load
    updateRotation(0.5, 0.5);

    startAnimation();

    // Signal that the wheel is ready
    window.parent.postMessage(
      {
        type: 'WHEEL_IFRAME_READY',
        modelName: 'wheel',
        timestamp: new Date().getTime()
      },
      '*'
    );

    // Mark as loaded and notify parent component
    setIsLoaded(true);
  };

  // When loading state changes, notify parent through callback
  useEffect(() => {
    if (isLoaded && onSceneReady) {
      console.log('Scene fully initialized, notifying parent component');
      onSceneReady();
    }
  }, [isLoaded, onSceneReady]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = e.clientX / window.innerWidth;
      const normalizedY = e.clientY / window.innerHeight;
      updateRotation(normalizedX, normalizedY);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'MOUSE_MOVE') {
        const { normalizedX, normalizedY } = event.data;
        updateRotation(normalizedX, normalizedY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleMessage);
      stopAnimation();
      state.current = {
        model: null,
        application: null,
        animation: null,
        rotation: {
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 }
        }
      };
    };
  }, []);

  // Check if it's a desktop device
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: 0,
        margin: 0
      }}>
      <Spline
        scene={sceneUrl}
        onLoad={onLoad}
        style={{
          padding: 0,
          margin: 0
        }}
      />
    </div>
  );
}

export default SceneRenderer;
