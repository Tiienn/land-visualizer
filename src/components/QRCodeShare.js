import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Share2, Copy, Check, Download, ExternalLink, Settings, RefreshCw } from 'lucide-react';

// QR code generation utility functions
const generateShareableURL = (configuration) => {
  try {
    // Create comprehensive configuration object
    const config = {
      version: '1.0',
      timestamp: Date.now(),
      data: {
        // Basic land information
        units: configuration.units || [],
        totalArea: configuration.totalAreaInSqM || 0,
        landShape: configuration.landShape || [],
        
        // Measurements and tools
        measuring: {
          tapeMeasurements: configuration.tapeMeasurements || [],
          irregularPolygons: configuration.irregularPolygons || [],
          bearings: configuration.bearings || []
        },
        
        // Subdivisions
        subdivisions: configuration.subdivisions || [],
        
        // Terrain settings
        terrain: {
          enabled: configuration.terrainEnabled || false,
          preset: configuration.terrainPreset || 'flat',
          opacity: configuration.terrainOpacity || 0.9
        },
        
        // Comparison settings
        comparison: {
          selected: configuration.selectedComparison || null
        },
        
        // UI settings
        ui: {
          darkMode: configuration.darkMode || false
        }
      }
    };
    
    // Compress and encode the configuration
    const jsonString = JSON.stringify(config);
    const compressed = btoa(encodeURIComponent(jsonString));
    
    // Generate shareable URL
    const baseURL = window.location.origin + window.location.pathname;
    const shareURL = `${baseURL}?config=${compressed}`;
    
    return shareURL;
  } catch (error) {
    console.error('Error generating shareable URL:', error);
    return null;
  }
};

const parseSharedConfiguration = (configParam) => {
  try {
    const decompressed = decodeURIComponent(atob(configParam));
    const config = JSON.parse(decompressed);
    
    // Validate configuration structure
    if (!config.version || !config.data) {
      throw new Error('Invalid configuration format');
    }
    
    return config.data;
  } catch (error) {
    console.error('Error parsing shared configuration:', error);
    return null;
  }
};

const QRCodeShare = ({
  darkMode,
  // Configuration data
  units,
  totalAreaInSqM,
  landShape,
  tapeMeasurements,
  irregularPolygons,
  bearings,
  subdivisions,
  terrainEnabled,
  terrainPreset,
  terrainOpacity,
  selectedComparison,
  // Callbacks for loading shared configurations
  onLoadConfiguration,
  // Embedded mode (when used in Share modal)
  isEmbedded = false
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [shareURL, setShareURL] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const canvasRef = useRef(null);

  // Check if there's meaningful data to share
  const hasDataToShare = 
    (units && units.length > 0) ||
    (tapeMeasurements && tapeMeasurements.length > 0) ||
    (irregularPolygons && irregularPolygons.length > 0) ||
    (bearings && bearings.length > 0) ||
    (subdivisions && subdivisions.length > 0) ||
    totalAreaInSqM > 0;

  const generateQRCode = async () => {
    if (!hasDataToShare) return;
    
    setGenerating(true);
    
    try {
      // Dynamic import to reduce bundle size
      const QRCode = await import('qrcode');
      
      const configuration = {
        units,
        totalAreaInSqM,
        landShape,
        tapeMeasurements,
        irregularPolygons,
        bearings,
        subdivisions,
        terrainEnabled,
        terrainPreset,
        terrainOpacity,
        selectedComparison,
        darkMode
      };
      
      const url = generateShareableURL(configuration);
      if (!url) {
        throw new Error('Failed to generate shareable URL');
      }
      
      setShareURL(url);
      
      // Generate QR code with specified options
      const qrOptions = {
        errorCorrectionLevel: errorLevel,
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: darkMode ? '#FFFFFF' : '#000000',
          light: darkMode ? '#1F2937' : '#FFFFFF'
        },
        width: qrSize
      };
      
      const qrDataURL = await QRCode.toDataURL(url, qrOptions);
      setQrCodeDataURL(qrDataURL);
      
      // Also render to canvas for download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, qrOptions);
      }
      
    } catch (error) {
      console.error('QR Code generation error:', error);
      alert('Failed to generate QR code. The configuration might be too large.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareURL) return;
    
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareURL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = `land-visualization-qr-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  const shareViaWebAPI = async () => {
    if (!navigator.share || !shareURL) return;
    
    try {
      await navigator.share({
        title: 'Land Visualization Configuration',
        text: 'Check out this land visualization project',
        url: shareURL
      });
    } catch (error) {
      console.error('Web Share API failed:', error);
      copyToClipboard(); // Fallback to copy
    }
  };

  const openInNewTab = () => {
    if (!shareURL) return;
    window.open(shareURL, '_blank');
  };

  const getConfigurationSummary = () => {
    const summary = [];
    if (units?.length > 0) summary.push(`${units.length} area inputs`);
    if (tapeMeasurements?.length > 0) summary.push(`${tapeMeasurements.length} measurements`);
    if (irregularPolygons?.length > 0) summary.push(`${irregularPolygons.length} polygons`);
    if (bearings?.length > 0) summary.push(`${bearings.length} bearings`);
    if (subdivisions?.length > 0) summary.push(`${subdivisions.length} subdivisions`);
    if (terrainEnabled) summary.push(`terrain: ${terrainPreset}`);
    
    return summary.length > 0 ? summary.join(', ') : 'basic configuration';
  };

  // Auto-generate QR code when data changes
  useEffect(() => {
    if (hasDataToShare) {
      generateQRCode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, tapeMeasurements, irregularPolygons, bearings, subdivisions, terrainEnabled, terrainPreset, selectedComparison, darkMode, qrSize, errorLevel]);

  // Check for shared configuration on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam && onLoadConfiguration) {
      const sharedConfig = parseSharedConfiguration(configParam);
      if (sharedConfig) {
        onLoadConfiguration(sharedConfig);
        // Clean URL after loading
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [onLoadConfiguration]);

  // Embedded mode renders a simplified version
  if (isEmbedded) {
    return (
      <div className="space-y-4">
        {hasDataToShare ? (
          <>
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              {qrCodeDataURL ? (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <img 
                    src={qrCodeDataURL} 
                    alt="Configuration QR Code"
                    className="mx-auto"
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              ) : generating ? (
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center`}>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent mb-2"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Generating...
                  </span>
                </div>
              ) : (
                <button
                  onClick={generateQRCode}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Generate QR Code
                </button>
              )}
            </div>

            {/* Download button for embedded mode */}
            {qrCodeDataURL && (
              <div className="flex justify-center">
                <button
                  onClick={downloadQRCode}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    darkMode 
                      ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Download size={14} className="mr-2" />
                  Download QR Code
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            <QrCode size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add land data to generate QR code</p>
          </div>
        )}
      </div>
    );
  }

  // Full standalone mode
  return (
    <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <QrCode className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              QR Code Sharing
            </h3>
          </div>
          <div className={`px-2 py-1 text-xs rounded ${hasDataToShare ? (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}`}>
            {hasDataToShare ? 'Ready to Share' : 'No Data'}
          </div>
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Generate QR codes to share your complete land visualization configuration including measurements, subdivisions, and settings.
        </p>
      </div>

      <div className="p-4 space-y-4">
        {hasDataToShare ? (
          <>
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              {qrCodeDataURL ? (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <img 
                    src={qrCodeDataURL} 
                    alt="Configuration QR Code"
                    className="mx-auto"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              ) : generating ? (
                <div className={`p-8 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex flex-col items-center`}>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent mb-2"></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Generating QR Code...
                  </span>
                </div>
              ) : null}

              {/* Configuration Summary */}
              {shareURL && (
                <div className={`w-full p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Configuration Summary
                  </h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getConfigurationSummary()}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {shareURL && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-all ${
                    copied
                      ? darkMode
                        ? 'bg-green-600 text-white'
                        : 'bg-green-500 text-white'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>

                <button
                  onClick={downloadQRCode}
                  className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-all ${
                    darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download QR
                </button>

                {navigator.share && (
                  <button
                    onClick={shareViaWebAPI}
                    className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-all ${
                      darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                )}

                <button
                  onClick={openInNewTab}
                  className={`inline-flex items-center justify-center px-3 py-2 text-sm rounded-lg transition-all ${
                    darkMode
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Preview
                </button>
              </div>
            )}

            {/* Advanced Options */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Advanced Options</span>
                <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                  ⌄
                </div>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        QR Code Size
                      </label>
                      <select
                        value={qrSize}
                        onChange={(e) => setQrSize(parseInt(e.target.value))}
                        className={`w-full px-2 py-1 text-xs rounded border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value={128}>Small (128px)</option>
                        <option value={256}>Medium (256px)</option>
                        <option value={512}>Large (512px)</option>
                        <option value={1024}>Extra Large (1024px)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Error Correction
                      </label>
                      <select
                        value={errorLevel}
                        onChange={(e) => setErrorLevel(e.target.value)}
                        className={`w-full px-2 py-1 text-xs rounded border ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={generateQRCode}
                    disabled={generating}
                    className={`inline-flex items-center px-3 py-2 text-xs rounded-lg transition-all ${
                      generating
                        ? darkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-300 text-gray-600'
                        : darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
                    Regenerate QR Code
                  </button>
                </div>
              )}
            </div>

            {/* URL Display */}
            {shareURL && (
              <div className="mt-4">
                <label className={`block text-xs font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Shareable URL
                </label>
                <div className={`p-3 rounded-lg font-mono text-xs break-all ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {shareURL}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No Configuration to Share</p>
            <p className="text-sm">
              Create some measurements, subdivisions, or configure your land visualization to generate a QR code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { generateShareableURL, parseSharedConfiguration };
export default QRCodeShare;