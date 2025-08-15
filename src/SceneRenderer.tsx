import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';

interface SceneRendererProps {
  sceneUrl: string;
}

function SceneRenderer({ sceneUrl }: SceneRendererProps) {
  const state = useRef({
    model: null as any,
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
      y: -(normalizedX - 0.5) * 40, // Mouse X controls Y rotation (tilt left/right)
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
    const model = splineApp.findObjectByName('wheel');
    if (!model) return;

    state.current.model = model;
    startAnimation();

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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('message', handleMessage);
      stopAnimation();
      state.current = {
        model: null,
        animation: null,
        rotation: {
          current: { x: 0, y: 0 },
          target: { x: 0, y: 0 }
        }
      };
    };
  }, []);

  return <Spline scene={sceneUrl} onLoad={onLoad} />;
}

export default SceneRenderer;
