import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { componentName = 'Component', fallbackMessage } = this.props;
      
      return (
        <div 
          className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg m-4"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangle 
            className="w-12 h-12 text-red-500 mb-4" 
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {componentName} Error
          </h2>
          <p className="text-red-700 text-center mb-4 max-w-md">
            {fallbackMessage || 
             'Something went wrong with this component. This might be due to WebGL compatibility issues or invalid 3D data.'}
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="w-full max-w-2xl mb-4">
              <summary className="cursor-pointer text-red-600 font-medium mb-2">
                Technical Details (Development Mode)
              </summary>
              <div className="bg-red-100 p-3 rounded text-sm font-mono text-red-800 overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            </details>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              aria-label={`Retry loading ${componentName.toLowerCase()}`}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
              aria-label="Reload entire application"
            >
              Reload Page
            </button>
          </div>
          
          {this.state.retryCount > 2 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Persistent Issue:</strong> If this error continues, try:
              </p>
              <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                <li>Updating your browser</li>
                <li>Checking WebGL support</li>
                <li>Clearing browser cache</li>
                <li>Using a different browser</li>
              </ul>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier wrapping
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized error boundary for Three.js components
export class ThreeJSErrorBoundary extends ErrorBoundary {
  componentDidCatch(error, errorInfo) {
    super.componentDidCatch(error, errorInfo);
    
    // Three.js specific error handling
    if (error.message.includes('WebGL')) {
      console.warn('WebGL-related error detected. Checking WebGL support...');
      
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        this.setState(prevState => ({
          ...prevState,
          error: new Error('WebGL is not supported in this browser. Please use a modern browser with WebGL support.')
        }));
      }
    }
  }
}

// WebGL compatibility check component
export const WebGLCheck = ({ children }) => {
  const [webglSupported, setWebglSupported] = React.useState(null);
  
  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
  }, []);
  
  if (webglSupported === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg m-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          WebGL Not Supported
        </h2>
        <p className="text-yellow-700 text-center max-w-md">
          This application requires WebGL for 3D visualization. Please use a modern browser 
          with WebGL support or enable WebGL in your browser settings.
        </p>
      </div>
    );
  }
  
  if (webglSupported === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Checking 3D support...</span>
      </div>
    );
  }
  
  return children;
};

export default ErrorBoundary;