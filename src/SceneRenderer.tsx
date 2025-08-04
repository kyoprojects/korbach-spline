import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';

interface SceneRendererProps {
  sceneUrl: string;
}

function SceneRenderer({ sceneUrl }: SceneRendererProps) {
  console.log('SceneRenderer mounted for:', sceneUrl);

  const state = useRef({
    model: null as any,
    animation: null as number | null,
    rotation: {
      current: { x: 0, z: 0 },
      target: { x: 0, z: 0 }
    }
  });

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const updateRotation = (normalizedX: number, normalizedY: number) => {
    if (!state.current.model) return;

    state.current.rotation.target = {
      z: -(normalizedX - 0.5) * 40,
      x: (normalizedY - 0.5) * 40
    };
  };

  const startAnimation = () => {
    console.log('Starting animation');

    const animate = () => {
      const { model, rotation } = state.current;

      if (!model?.rotation) {
        console.log('No model in animation frame');
        return;
      }

      // Update rotation values
      rotation.current.x = lerp(rotation.current.x, rotation.target.x, 0.1);
      rotation.current.z = lerp(rotation.current.z, rotation.target.z, 0.1);

      // Apply to model
      model.rotation.x = rotation.current.x * (Math.PI / 180);
      model.rotation.z = rotation.current.z * (Math.PI / 180);

      // Request next frame
      state.current.animation = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();
  };

  const stopAnimation = () => {
    console.log('Stopping animation');
    if (state.current.animation) {
      cancelAnimationFrame(state.current.animation);
      state.current.animation = null;
    }
  };

  const onLoad = (splineApp: Application) => {
    console.log('Scene loaded, searching for model...');

    // Find and store model
    const model = splineApp.findObjectByName('Group');
    console.log('Found model:', model);

    if (!model) {
      console.error('Could not find Group in scene');
      return;
    }

    // Store model and start animation
    state.current.model = model;
    startAnimation();

    // Tell parent we're ready
    window.parent.postMessage({ type: 'WHEEL_IFRAME_READY' }, '*');
  };

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

    console.log('SceneRenderer: Setting up event listeners');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('message', handleMessage);

    return () => {
      console.log('SceneRenderer: Cleaning up');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleMessage);
      stopAnimation();
      state.current = {
        model: null,
        animation: null,
        rotation: {
          current: { x: 0, z: 0 },
          target: { x: 0, z: 0 }
        }
      };
    };
  }, []);

  return <Spline scene={sceneUrl} onLoad={onLoad} />;
}

export default SceneRenderer;
