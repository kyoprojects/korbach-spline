import { useState, useEffect } from 'react';
import SceneRenderer from './SceneRenderer';

function App() {
  const [sceneUrl, setSceneUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CHANGE_SCENE') {
        console.log('Scene change requested:', event.data.url);
        setSceneUrl(event.data.url.trim());
      }
    };

    console.log('App: Setting up message listener');
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'IFRAME_INIT' }, '*');

    return () => {
      console.log('App: Cleaning up message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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
      {sceneUrl && <SceneRenderer key={sceneUrl} sceneUrl={sceneUrl} />}
    </div>
  );
}

export default App;
