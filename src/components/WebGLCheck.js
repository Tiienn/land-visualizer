import React, { useEffect, useState } from 'react';

/**
 * WebGL Compatibility Checker Component
 * Detects WebGL support and provides fallback UI for older hardware
 */
export const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { supported: false, version: 0, message: 'WebGL is not supported' };
    }
    
    // Check WebGL version
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown';
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown';
    
    // Check for WebGL 2
    const gl2 = canvas.getContext('webgl2');
    const version = gl2 ? 2 : 1;
    
    return {
      supported: true,
      version,
      vendor,
      renderer,
      message: `WebGL ${version} supported`
    };
  } catch (e) {
    return {
      supported: false,
      version: 0,
      message: 'Error checking WebGL support: ' + e.message
    };
  }
};

export const WebGLFallback = ({ darkMode }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full p-8 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold">3D View Not Available</h2>
        <p className="text-lg">
          Your browser or graphics card doesn't support WebGL, which is required for 3D visualization.
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
          <h3 className="font-semibold mb-2">Your Land Details:</h3>
          <div className="text-left space-y-1">
            <p>Area: 5,000 m²</p>
            <p>Dimensions: 70.7m × 70.7m</p>
            <p>Perimeter: 282.8m</p>
          </div>
        </div>
        <div className="pt-4">
          <p className="text-sm">To enable 3D view:</p>
          <ul className="text-sm text-left list-disc list-inside mt-2">
            <li>Update your browser to the latest version</li>
            <li>Enable hardware acceleration in browser settings</li>
            <li>Update your graphics drivers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const useWebGLCheck = () => {
  const [webglStatus, setWebglStatus] = useState(null);
  
  useEffect(() => {
    const status = checkWebGLSupport();
    setWebglStatus(status);
    
    if (!status.supported) {
      console.warn('WebGL not supported:', status.message);
    } else {
      console.log('WebGL status:', status);
    }
  }, []);
  
  return webglStatus;
};

export default WebGLFallback;