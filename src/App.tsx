import { useState, useEffect } from 'react';
import SceneRenderer from './SceneRenderer';

function App() {
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  // Send initialization event when app is fully loaded
  useEffect(() => {
    // Notify that the app framework has initialized
    window.parent.postMessage({ type: 'IFRAME_INIT', status: 'framework_ready' }, '*');

    // Custom event that can be listened to from outside
    const appInitEvent = new CustomEvent('page_initialized', {
      detail: { status: 'framework_ready' }
    });
    window.dispatchEvent(appInitEvent);

    console.log('Korbach Spline framework initialized');
  }, []);

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CHANGE_SCENE') {
        setSceneUrl(event.data.url.trim());
        setIsSceneReady(false); // Reset ready state when scene changes
        console.log('Scene URL changed:', event.data.url);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Handle scene ready state
  useEffect(() => {
    if (isSceneReady && sceneUrl) {
      // Notify that the scene is fully loaded and ready
      window.parent.postMessage(
        {
          type: 'APP_INITIALIZED',
          status: 'ready',
          scene: sceneUrl
        },
        '*'
      );

      // Custom event that can be listened to from outside
      const appReadyEvent = new CustomEvent('scene_rendered', {
        detail: { status: 'ready', scene: sceneUrl }
      });
      window.dispatchEvent(appReadyEvent);

      console.log('Korbach Spline fully initialized with scene:', sceneUrl);
    }
  }, [isSceneReady, sceneUrl]);

  // Handle scene ready callback from SceneRenderer
  const handleSceneReady = () => {
    setIsSceneReady(true);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        pointerEvents: 'none'
      }}>
      {sceneUrl && <SceneRenderer key={sceneUrl} sceneUrl={sceneUrl} onSceneReady={handleSceneReady} />}
    </div>
  );
}

export default App;
