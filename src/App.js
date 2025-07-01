import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Eye, Navigation, Square, Home, Car, Plus, Minus, Maximize2, Activity, Ruler } from 'lucide-react';

const LandVisualizer = () => {
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);
  const [environment, setEnvironment] = useState('outdoor');
  const [viewMode, setViewMode] = useState('3d');
  const [isWalking, setIsWalking] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const keysRef = useRef({});
  const mouseRef = useRef({ isDown: false, lastX: 0, lastY: 0 });

  // Unit conversions to square meters
  const unitConversions = {
    'm²': 1,
    'ft²': 0.092903,
    'arpent': 3418.89,
    'perche': 42.2112,
    'toise': 3.798
  };

  // Calculate total area in square meters
  const totalAreaInSqM = units.reduce((total, unit) => {
    return total + (unit.value * unitConversions[unit.unit]);
  }, 0);
  
  const sideLength = Math.sqrt(totalAreaInSqM);

  // Comparison data with better organization
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, icon: '⚽', color: 'emerald', dimensions: { width: 100, length: 70 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, icon: '🏀', color: 'amber', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, icon: '🎾', color: 'sky', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, icon: '🏊', color: 'cyan', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, icon: '🏠', color: 'violet', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, icon: '🚗', color: 'slate', dimensions: { width: 5, length: 2.5 } }
  ];

  const addUnit = () => {
    setUnits([...units, { value: 0, unit: 'm²' }]);
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
    }
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = field === 'value' ? Number(value) : value;
    setUnits(newUnits);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(environment === 'outdoor' ? 0x87CEEB : 0xf8f9fa);
    scene.fog = new THREE.Fog(environment === 'outdoor' ? 0x87CEEB : 0xf8f9fa, 100, 400);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);

    // Add a second light for better illumination
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);

    // Ground with grid
    const groundSize = Math.max(sideLength * 3, 200);
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: environment === 'outdoor' ? 0x4a7c59 : 0xf5f5f5
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add grid
    const gridHelper = new THREE.GridHelper(groundSize, 50, 0x888888, 0xcccccc);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Main area visualization with clean styling
    const areaGeometry = new THREE.PlaneGeometry(sideLength, sideLength);
    const areaMaterial = new THREE.MeshLambertMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0.2
    });
    const areaPlane = new THREE.Mesh(areaGeometry, areaMaterial);
    areaPlane.rotation.x = -Math.PI / 2;
    areaPlane.position.y = 0.01;
    scene.add(areaPlane);

    // Clean border lines
    const points = [
      new THREE.Vector3(-sideLength/2, 0.02, -sideLength/2),
      new THREE.Vector3(sideLength/2, 0.02, -sideLength/2),
      new THREE.Vector3(sideLength/2, 0.02, sideLength/2),
      new THREE.Vector3(-sideLength/2, 0.02, sideLength/2),
      new THREE.Vector3(-sideLength/2, 0.02, -sideLength/2)
    ];
    const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x0066cc, linewidth: 3 });
    const borderLines = new THREE.Line(borderGeometry, borderMaterial);
    scene.add(borderLines);

    // Add corner markers
    const markerGeometry = new THREE.BoxGeometry(1, 3, 1);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
    const corners = [
      [-sideLength/2, -sideLength/2],
      [sideLength/2, -sideLength/2],
      [sideLength/2, sideLength/2],
      [-sideLength/2, sideLength/2]
    ];
    
    corners.forEach(([x, z]) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, 1.5, z);
      marker.castShadow = true;
      scene.add(marker);
    });

    // Add comparison objects if selected
    if (selectedComparison) {
      const comparison = comparisonOptions.find(c => c.id === selectedComparison);
      if (comparison) {
        const numObjects = Math.floor(totalAreaInSqM / comparison.area);
        const maxObjects = 50; // Limit for performance
        const objectsToShow = Math.min(numObjects, maxObjects);
        
        for (let i = 0; i < objectsToShow; i++) {
          const objectGeometry = new THREE.PlaneGeometry(
            comparison.dimensions.width, 
            comparison.dimensions.length
          );
          const objectMaterial = new THREE.MeshLambertMaterial({
            color: getColorByName(comparison.color),
            transparent: true,
            opacity: 0.5
          });
          const object = new THREE.Mesh(objectGeometry, objectMaterial);
          object.rotation.x = -Math.PI / 2;
          object.position.y = 0.03;
          
          // Arrange in grid
          const itemsPerRow = Math.ceil(Math.sqrt(objectsToShow));
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const spacing = Math.max(comparison.dimensions.width, comparison.dimensions.length) * 1.2;
          
          object.position.x = (col - itemsPerRow / 2) * spacing;
          object.position.z = (row - itemsPerRow / 2) * spacing;
          
          // Only show if within main area bounds
          if (Math.abs(object.position.x) < sideLength/2 && Math.abs(object.position.z) < sideLength/2) {
            scene.add(object);
            
            // Add outline
            const outlinePoints = [
              new THREE.Vector3(-comparison.dimensions.width/2, 0.04, -comparison.dimensions.length/2),
              new THREE.Vector3(comparison.dimensions.width/2, 0.04, -comparison.dimensions.length/2),
              new THREE.Vector3(comparison.dimensions.width/2, 0.04, comparison.dimensions.length/2),
              new THREE.Vector3(-comparison.dimensions.width/2, 0.04, comparison.dimensions.length/2),
              new THREE.Vector3(-comparison.dimensions.width/2, 0.04, -comparison.dimensions.length/2)
            ];
            const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
            const outlineMaterial = new THREE.LineBasicMaterial({ 
              color: getColorByName(comparison.color), 
              linewidth: 2 
            });
            const outline = new THREE.Line(outlineGeometry, outlineMaterial);
            outline.position.copy(object.position);
            scene.add(outline);
          }
        }
      }
    }

    // Environment objects (simplified and cleaner)
    if (environment === 'outdoor') {
      // Simplified trees
      const numTrees = Math.min(12, Math.floor(groundSize / 40));
      for (let i = 0; i < numTrees; i++) {
        const treeGroup = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // Leaves - multiple spheres for more realistic look
        const leafPositions = [
          { x: 0, y: 10, z: 0, size: 5 },
          { x: -2, y: 9, z: 0, size: 3 },
          { x: 2, y: 9, z: 1, size: 3 },
          { x: 0, y: 12, z: -1, size: 4 }
        ];
        
        leafPositions.forEach(pos => {
          const leavesGeometry = new THREE.SphereGeometry(pos.size);
          const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x1a5f3f });
          const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
          leaves.position.set(pos.x, pos.y, pos.z);
          leaves.castShadow = true;
          treeGroup.add(leaves);
        });
        
        // Position outside main area
        const angle = (i / numTrees) * Math.PI * 2;
        const distance = Math.max(sideLength * 0.8, 40);
        treeGroup.position.x = Math.cos(angle) * distance + (Math.random() - 0.5) * 10;
        treeGroup.position.z = Math.sin(angle) * distance + (Math.random() - 0.5) * 10;
        treeGroup.scale.y = 0.8 + Math.random() * 0.4;
        scene.add(treeGroup);
      }
    }

    // Camera positioning
    if (viewMode === 'top') {
      camera.position.set(0, Math.max(sideLength * 1.2, 50), 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(sideLength * 0.7, 20, sideLength * 0.7);
      camera.lookAt(0, 0, 0);
    }

    // Mouse controls
    const handleMouseDown = (event) => {
      if (viewMode === '3d' && !isWalking) {
        mouseRef.current.isDown = true;
        mouseRef.current.lastX = event.clientX;
        mouseRef.current.lastY = event.clientY;
      }
    };

    const handleMouseMove = (event) => {
      if (mouseRef.current.isDown && viewMode === '3d' && !isWalking) {
        const deltaX = event.clientX - mouseRef.current.lastX;
        const deltaY = event.clientY - mouseRef.current.lastY;
        
        // Rotate camera around the center
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
        
        mouseRef.current.lastX = event.clientX;
        mouseRef.current.lastY = event.clientY;
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleWheel = (event) => {
      if (viewMode === '3d') {
        const direction = camera.position.clone().normalize();
        const distance = event.deltaY * 0.01;
        camera.position.add(direction.multiplyScalar(distance));
        
        // Limit zoom
        const minDistance = 5;
        const maxDistance = 300;
        const currentDistance = camera.position.length();
        if (currentDistance < minDistance) {
          camera.position.normalize().multiplyScalar(minDistance);
        } else if (currentDistance > maxDistance) {
          camera.position.normalize().multiplyScalar(maxDistance);
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Handle walking controls
      if (viewMode === '3d' && isWalking) {
        const moveSpeed = 1;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        
        const right = new THREE.Vector3();
        right.crossVectors(direction, camera.up);
        
        if (keysRef.current['w'] || keysRef.current['W']) {
          camera.position.add(direction.multiplyScalar(moveSpeed));
        }
        if (keysRef.current['s'] || keysRef.current['S']) {
          camera.position.sub(direction.multiplyScalar(moveSpeed));
        }
        if (keysRef.current['a'] || keysRef.current['A']) {
          camera.position.sub(right.multiplyScalar(moveSpeed));
        }
        if (keysRef.current['d'] || keysRef.current['D']) {
          camera.position.add(right.multiplyScalar(moveSpeed));
        }
        
        // Keep camera at reasonable height
        camera.position.y = Math.max(camera.position.y, 2);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (mountRef.current && renderer && camera) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [units, environment, viewMode, isWalking, selectedComparison, totalAreaInSqM, sideLength]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      keysRef.current[event.key] = true;
    };
    
    const handleKeyUp = (event) => {
      keysRef.current[event.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getColorByName = (colorName) => {
    const colors = {
      emerald: 0x10b981,
      amber: 0xf59e0b,
      sky: 0x0ea5e9,
      cyan: 0x06b6d4,
      violet: 0x8b5cf6,
      slate: 0x64748b
    };
    return colors[colorName] || 0x64748b;
  };

  const toggleView = () => {
    setViewMode(viewMode === '3d' ? 'top' : '3d');
    setIsWalking(false);
  };

  const toggleWalking = () => {
    if (viewMode === '3d') {
      setIsWalking(!isWalking);
    }
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 1 });
  };

  // Calculate acres for display
  const totalAcres = totalAreaInSqM / 4046.86;
  const totalHectares = totalAreaInSqM / 10000;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Professional Land Visualizer</h1>
                  <p className="text-sm text-slate-600">Advanced 3D land measurement and analysis tool</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAreaInSqM)}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Square Meters</div>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAcres)}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Acres</div>
                </div>
                <div className="h-12 w-px bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{formatNumber(totalHectares)}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Hectares</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-slate-600" />
                Area Configuration
              </h2>
              <button
                onClick={addUnit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Component
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {units.map((unitItem, index) => (
                <div key={index} className="relative group">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Area Value
                        </label>
                        <input
                          type="number"
                          value={unitItem.value}
                          onChange={(e) => updateUnit(index, 'value', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Unit Type
                        </label>
                        <select
                          value={unitItem.unit}
                          onChange={(e) => updateUnit(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                        >
                          <option value="m²">m²</option>
                          <option value="ft²">ft²</option>
                          <option value="arpent">arpent</option>
                          <option value="perche">perche</option>
                          <option value="toise">toise</option>
                        </select>
                      </div>
                      {units.length > 1 && (
                        <button
                          onClick={() => removeUnit(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      = {formatNumber(unitItem.value * unitConversions[unitItem.unit])} m²
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Environment and View Controls */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-slate-700 mr-3">Environment:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50">
                    <button
                      onClick={() => setEnvironment('outdoor')}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-all ${
                        environment === 'outdoor' 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Outdoor
                    </button>
                    <button
                      onClick={() => setEnvironment('indoor')}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-all ${
                        environment === 'indoor' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      Indoor
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleView}
                    className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
                  >
                    <Eye size={16} className="mr-2" />
                    {viewMode === '3d' ? 'Aerial View' : '3D View'}
                  </button>
                  
                  {viewMode === '3d' && (
                    <button
                      onClick={toggleWalking}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 shadow-sm ${
                        isWalking 
                          ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      <Navigation size={16} className="mr-2" />
                      {isWalking ? 'Exit Walk Mode' : 'Walk Mode'}
                    </button>
                  )}
                </div>
                
                <div className="ml-auto text-sm text-slate-600">
                  <Maximize2 size={16} className="inline mr-1" />
                  Area: {sideLength.toFixed(1)}m × {sideLength.toFixed(1)}m
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 3D Visualization */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">3D Visualization</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {viewMode === '3d' ? (
                        isWalking ? 
                          'Use WASD keys to navigate • Mouse to look around' : 
                          'Drag to rotate • Scroll to zoom • Click Walk Mode to explore'
                      ) : (
                        'Birds-eye view of your land area'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div ref={mountRef} className="w-full h-[500px] xl:h-[700px] bg-slate-50" />
            </div>
          </div>

          {/* Professional Sidebar */}
          <div className="space-y-6">
            {/* Size Comparisons */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Visual Comparisons</h3>
                <p className="text-sm text-slate-600 mt-1">Click to overlay comparison objects</p>
              </div>
              <div className="p-4 space-y-3">
                {comparisonOptions.map((comparison) => {
                  const count = totalAreaInSqM / comparison.area;
                  return (
                    <button
                      key={comparison.id}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                        selectedComparison === comparison.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedComparison(
                        selectedComparison === comparison.id ? null : comparison.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`text-3xl`}>
                            {comparison.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{comparison.name}</div>
                            <div className="text-sm text-slate-600">
                              {count >= 1 
                                ? `${count.toFixed(1)} ${count === 1 ? 'fits' : 'fit'} in your area`
                                : `You need ${(1/count).toFixed(1)} areas`}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {comparison.dimensions.width}m × {comparison.dimensions.length}m
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className={`w-4 h-4 rounded-full transition-all ${
                            selectedComparison === comparison.id 
                              ? 'bg-blue-500 ring-4 ring-blue-200' 
                              : 'bg-slate-300'
                          }`} />
                          <div className="text-xs text-slate-500 mt-1">
                            {formatNumber(comparison.area)} m²
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Quick Statistics</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Perimeter</span>
                    <span className="text-sm font-mono text-slate-900">
                      {(sideLength * 4).toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Diagonal</span>
                    <span className="text-sm font-mono text-slate-900">
                      {(sideLength * Math.sqrt(2)).toFixed(1)} m
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Side Length</span>
                    <span className="text-sm font-mono text-slate-900">
                      {sideLength.toFixed(1)} m
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Unit Conversions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">All Conversions</h3>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(unitConversions).map(([unit, conversion]) => (
                  <div key={unit} className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-700">{unit}</span>
                    <span className="text-sm font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded">
                      {formatNumber(totalAreaInSqM / conversion)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandVisualizer;