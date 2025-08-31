# Korbach Spline

Spline scene renderer for Korbach wheel configurator.

## Initialization Events

The application emits several events during initialization that you can listen for:

### PostMessage Events (for iframe communication)

1. `IFRAME_INIT` - Sent immediately when the React application initializes

   ```javascript
   {
     type: 'IFRAME_INIT',
     status: 'framework_ready'
   }
   ```

2. `WHEEL_IFRAME_READY` - Sent when the Spline scene loads and the wheel model is found

   ```javascript
   {
     type: 'WHEEL_IFRAME_READY',
     modelName: 'wheel',
     timestamp: 1234567890123 // timestamp when ready
   }
   ```

3. `APP_INITIALIZED` - Sent when both the app framework and scene are fully loaded and ready
   ```javascript
   {
     type: 'APP_INITIALIZED',
     status: 'ready',
     scene: 'https://example.com/scene.spline' // URL of the loaded scene
   }
   ```

### Custom DOM Events

1. `korbach_spline_initialized` - Dispatched when the framework is initialized

   ```javascript
   window.addEventListener('korbach_spline_initialized', event => {
     console.log('Framework initialized:', event.detail);
     // event.detail = { status: 'framework_ready' }
   });
   ```

2. `korbach_spline_ready` - Dispatched when the scene is fully loaded and ready
   ```javascript
   window.addEventListener('korbach_spline_ready', event => {
     console.log('Scene ready:', event.detail);
     // event.detail = { status: 'ready', scene: 'https://example.com/scene.spline' }
   });
   ```

## Usage Example

```javascript
// Listen for initialization events
window.addEventListener('message', event => {
  if (event.data.type === 'IFRAME_INIT') {
    console.log('Framework initialized');
  } else if (event.data.type === 'WHEEL_IFRAME_READY') {
    console.log('Wheel model ready');
  } else if (event.data.type === 'APP_INITIALIZED') {
    console.log('Application fully initialized with scene:', event.data.scene);
  }
});

// Or use custom DOM events if in the same window context
window.addEventListener('korbach_spline_ready', event => {
  console.log('Ready to interact with the wheel model!', event.detail);
});

// Change the scene
const iframe = document.getElementById('korbach-spline-iframe');
iframe.contentWindow.postMessage(
  {
    type: 'CHANGE_SCENE',
    url: 'https://example.com/new-scene.spline'
  },
  '*'
);
```

## Control the Wheel

You can control the wheel rotation by sending mouse move events:

```javascript
// Send normalized mouse coordinates (0-1) to control wheel rotation
iframe.contentWindow.postMessage(
  {
    type: 'MOUSE_MOVE',
    normalizedX: 0.5, // 0 = left, 1 = right
    normalizedY: 0.5 // 0 = top, 1 = bottom
  },
  '*'
);
```
