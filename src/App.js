import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Plane, Box, Text, Line } from '@react-three/drei';
import { Plus, Minus, Maximize2, Activity, Ruler, Info, Share2, Copy, Check, Square as SquareIcon, MousePointer, Trash2, Edit3, Save, X } from 'lucide-react';
import * as THREE from 'three';
import './App.css';

// Editable corner point component
function EditableCornerPoint({ position, index, onDrag, isActive, onSelect, onDragStart, onDragEnd, drawingMode, isDragging, onPointerMove }) {
  const [hovered, setHovered] = useState(false);
  
  const handlePointerDown = (event) => {
    if (drawingMode !== 'select') return; // Only allow dragging in select mode
    event.stopPropagation();
    onSelect(index);
    onDragStart(index);
  };
  
  const handlePointerUp = () => {
    if (isDragging) {
      onDragEnd();
    }
  };
  
  // Show visual feedback for draggable state
  const isSelectable = drawingMode === 'select';
  
  return (
    <Box
      args={[3, 5, 3]} // Larger size for easier dragging
      position={[position.x, 2.5, position.z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshLambertMaterial 
        color={
          !isSelectable ? "#94a3b8" : // Gray when not selectable
          isActive ? "#3b82f6" : "#0066cc"
        } 
        transparent 
        opacity={
          !isSelectable ? 0.4 : // More transparent when not selectable
          hovered ? 0.9 : 0.7
        }
      />
    </Box>
  );
}

// Dimension label component
function DimensionLabel({ start, end, position, distance }) {
  return (
    <Text
      position={[position.x, 6, position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={3}
      color="#333333"
      anchorX="center"
      anchorY="middle"
    >
      {distance.toFixed(1)}m
    </Text>
  );
}

// Editable land shape component
function EditableLandShape({ landShape, onUpdateShape, drawingMode, onDragStateChange }) {
  const [selectedCorner, setSelectedCorner] = useState(null);
  const [draggingCorner, setDraggingCorner] = useState(null);
  
  const handleCornerDrag = (index, newX, newZ) => {
    const newShape = [...landShape];
    newShape[index] = { x: newX, z: newZ };
    onUpdateShape(newShape);
  };
  
  const handleDragStart = (index) => {
    setDraggingCorner(index);
    onDragStateChange(true);
  };
  
  const handleDragEnd = () => {
    setDraggingCorner(null);
    onDragStateChange(false);
  };
  
  const handlePointerMove = (event) => {
    if (draggingCorner !== null && drawingMode === 'select') {
      event.stopPropagation();
      handleCornerDrag(draggingCorner, event.point.x, event.point.z);
    }
  };
  
  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dz * dz);
  };
  
  const getMidpoint = (point1, point2) => {
    return {
      x: (point1.x + point2.x) / 2,
      z: (point1.z + point2.z) / 2
    };
  };
  
  
  // Create points for the land outline
  const landPoints = [...landShape, landShape[0]].map(point => [point.x, 0.01, point.z]);
  
  return (
    <group>
      {/* Land area plane */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]}
        onPointerMove={handlePointerMove}
      >
        <meshLambertMaterial color="#0066cc" transparent opacity={0.2} />
      </Plane>
      
      {/* Land outline */}
      <Line
        points={landPoints}
        color="#0066cc"
        lineWidth={3}
      />
      
      {/* Editable corner points */}
      {landShape.map((corner, index) => (
        <EditableCornerPoint
          key={index}
          position={corner}
          index={index}
          onDrag={handleCornerDrag}
          isActive={selectedCorner === index}
          onSelect={setSelectedCorner}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          drawingMode={drawingMode}
          isDragging={draggingCorner === index}
        />
      ))}
      
      {/* Dimension labels */}
      {landShape.map((corner, index) => {
        const nextCorner = landShape[(index + 1) % landShape.length];
        const distance = calculateDistance(corner, nextCorner);
        const midpoint = getMidpoint(corner, nextCorner);
        
        return (
          <DimensionLabel
            key={`dim-${index}`}
            start={corner}
            end={nextCorner}
            position={midpoint}
            distance={distance}
          />
        );
      })}
    </group>
  );
}

// Drawing mode component
function DrawingPlane({ landShape, onAddSubdivision, drawingMode, subdivisions, setSubdivisions, onAddPolylinePoint, polylinePoints }) {
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Check if a point is inside the land shape using ray casting algorithm
  const isPointInLand = (x, z) => {
    let inside = false;
    const n = landShape.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = landShape[i].x, zi = landShape[i].z;
      const xj = landShape[j].x, zj = landShape[j].z;
      
      if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  const handlePointerDown = (event) => {
    const point = event.point;
    
    if (drawingMode === 'rectangle') {
      if (!isPointInLand(point.x, point.z)) return;
      setStartPoint([point.x, point.z]);
      setIsDrawing(true);
    } else if (drawingMode === 'polyline') {
      if (!isPointInLand(point.x, point.z)) return;
      onAddPolylinePoint(point.x, point.z);
    }
  };

  const handlePointerMove = (event) => {
    if (!isDrawing || drawingMode !== 'rectangle') return;
    
    const point = event.point;
    setCurrentPoint([point.x, point.z]);
  };

  const handlePointerUp = (event) => {
    if (!isDrawing || !startPoint || !currentPoint) return;
    
    const width = Math.abs(currentPoint[0] - startPoint[0]);
    const length = Math.abs(currentPoint[1] - startPoint[1]);
    const area = width * length;
    
    if (area > 0.1) { // Minimum area threshold
      const newSubdivision = {
        id: Date.now(),
        x: (startPoint[0] + currentPoint[0]) / 2,
        z: (startPoint[1] + currentPoint[1]) / 2,
        width: width,
        length: length,
        area: area,
        label: `Area ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
      
      onAddSubdivision(newSubdivision);
    }
    
    setStartPoint(null);
    setCurrentPoint(null);
    setIsDrawing(false);
  };

  return (
    <>
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.005, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>
      
      {/* Preview rectangle while drawing */}
      {isDrawing && startPoint && currentPoint && (
        <group>
          <Plane
            args={[
              Math.abs(currentPoint[0] - startPoint[0]),
              Math.abs(currentPoint[1] - startPoint[1])
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[
              (startPoint[0] + currentPoint[0]) / 2,
              0.02,
              (startPoint[1] + currentPoint[1]) / 2
            ]}
          >
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </Plane>
          <Line
            points={[
              [startPoint[0], 0.02, startPoint[1]],
              [currentPoint[0], 0.02, startPoint[1]],
              [currentPoint[0], 0.02, currentPoint[1]],
              [startPoint[0], 0.02, currentPoint[1]],
              [startPoint[0], 0.02, startPoint[1]]
            ]}
            color="#3b82f6"
            lineWidth={2}
          />
        </group>
      )}
      
      {/* Polyline points while drawing */}
      {drawingMode === 'polyline' && polylinePoints.length > 0 && (
        <group>
          {/* Show polyline points */}
          {polylinePoints.map((point, index) => (
            <Box
              key={index}
              args={[1, 2, 1]}
              position={[point.x, 1, point.z]}
            >
              <meshBasicMaterial color="#f59e0b" />
            </Box>
          ))}
          
          {/* Show polyline connections */}
          {polylinePoints.length > 1 && (
            <Line
              points={polylinePoints.map(p => [p.x, 0.02, p.z])}
              color="#f59e0b"
              lineWidth={3}
            />
          )}
        </group>
      )}
    </>
  );
}

// Editable subdivision corner component
function SubdivisionCornerPoint({ position, index, subdivisionId, onDrag, isActive, onSelect, onDragStart, onDragEnd, drawingMode, isDragging }) {
  const [hovered, setHovered] = useState(false);
  
  const handlePointerDown = (event) => {
    if (drawingMode !== 'select') return;
    event.stopPropagation();
    onSelect(index);
    onDragStart(index);
  };
  
  const handlePointerUp = () => {
    if (isDragging) {
      onDragEnd();
    }
  };
  
  const isSelectable = drawingMode === 'select';
  
  return (
    <Box
      args={[2, 3, 2]}
      position={[position.x, 2, position.z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshLambertMaterial 
        color={
          !isSelectable ? "#94a3b8" : 
          isActive ? "#f59e0b" : "#fbbf24"
        } 
        transparent 
        opacity={
          !isSelectable ? 0.4 : 
          hovered ? 0.9 : 0.7
        }
      />
    </Box>
  );
}

// Subdivision component
function Subdivision({ subdivision, onDelete, onEdit, isSelected, onSelect, onMove, drawingMode, onUpdateSubdivision, onSubdivisionCornerDragStateChange }) {
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCorner, setSelectedCorner] = useState(null);
  const [draggingCorner, setDraggingCorner] = useState(null);
  
  const handlePointerDown = (event) => {
    if (drawingMode === 'select' && !draggingCorner) {
      event.stopPropagation();
      onSelect(subdivision.id);
      setIsDragging(true);
    }
  };
  
  const handlePointerMove = (event) => {
    if (isDragging && drawingMode === 'select' && !draggingCorner) {
      event.stopPropagation();
      if (subdivision.type === 'polyline') {
        // For polylines, move to the new position
        onMove(subdivision.id, event.point.x, event.point.z);
      } else {
        // For rectangles, move to the new position
        onMove(subdivision.id, event.point.x, event.point.z);
      }
    } else if (draggingCorner !== null && drawingMode === 'select') {
      event.stopPropagation();
      handleCornerDrag(draggingCorner, event.point.x, event.point.z);
    }
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  const handleCornerDrag = (index, newX, newZ) => {
    if (subdivision.type === 'polyline') {
      const newPoints = [...subdivision.points];
      newPoints[index] = { x: newX, z: newZ };
      onUpdateSubdivision(subdivision.id, { points: newPoints });
    } else {
      // For rectangle subdivisions, convert to polyline format for corner editing
      const currentCorners = [
        { x: subdivision.x - subdivision.width/2, z: subdivision.z - subdivision.length/2 },
        { x: subdivision.x + subdivision.width/2, z: subdivision.z - subdivision.length/2 },
        { x: subdivision.x + subdivision.width/2, z: subdivision.z + subdivision.length/2 },
        { x: subdivision.x - subdivision.width/2, z: subdivision.z + subdivision.length/2 }
      ];
      
      const newCorners = [...currentCorners];
      newCorners[index] = { x: newX, z: newZ };
      
      // Convert to polyline type with corner points
      const calculatePolylineArea = (points) => {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += points[i].x * points[j].z;
          area -= points[j].x * points[i].z;
        }
        return Math.abs(area) / 2;
      };
      
      onUpdateSubdivision(subdivision.id, { 
        type: 'polyline',
        points: newCorners,
        area: calculatePolylineArea(newCorners)
      });
    }
  };
  
  const handleCornerDragStart = (index) => {
    setDraggingCorner(index);
  };
  
  const handleCornerDragEnd = () => {
    setDraggingCorner(null);
  };
  
  // Update the parent component about subdivision corner dragging
  React.useEffect(() => {
    if (typeof onSubdivisionCornerDragStateChange === 'function') {
      onSubdivisionCornerDragStateChange(draggingCorner !== null);
    }
  }, [draggingCorner, onSubdivisionCornerDragStateChange]);
  
  if (subdivision.type === 'polyline') {
    // Calculate centroid for label positioning
    const centroid = subdivision.points.reduce(
      (acc, point) => ({ x: acc.x + point.x, z: acc.z + point.z }),
      { x: 0, z: 0 }
    );
    centroid.x /= subdivision.points.length;
    centroid.z /= subdivision.points.length;
    
    // Create polyline points for border
    const polylinePoints = [...subdivision.points, subdivision.points[0]].map(p => [p.x, 0.02, p.z]);
    
    // Create triangulated geometry for polyline shape using earcut algorithm
    const createPolylineGeometry = () => {
      // Convert points to flat array for earcut
      const vertices = [];
      subdivision.points.forEach(point => {
        vertices.push(point.x, point.z);
      });
      
      // Use earcut to triangulate the polygon
      const triangles = THREE.ShapeUtils.triangulateShape(subdivision.points.map(p => new THREE.Vector2(p.x, p.z)), []);
      
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      
      // Convert triangles to 3D positions
      triangles.forEach(triangle => {
        triangle.forEach(vertex => {
          positions.push(vertex.x, 0, vertex.y); // Note: y becomes z in 3D space
        });
      });
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
      
      return geometry;
    };
    
    return (
      <group
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Polyline fill using triangulated geometry */}
        <mesh position={[0, 0.015, 0]}>
          <primitive object={createPolylineGeometry()} />
          <meshLambertMaterial 
            color={subdivision.color} 
            transparent 
            opacity={isSelected ? 0.7 : hovered ? 0.5 : 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Border */}
        <Line
          points={polylinePoints}
          color={isSelected ? "#ff6b6b" : subdivision.color}
          lineWidth={isSelected ? 3 : 2}
        />
        
        {/* Label */}
        <Text
          position={[centroid.x, 0.5, centroid.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={2}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {subdivision.label}
          {'\n'}
          {subdivision.area.toFixed(1)} m²
        </Text>
        
        {/* Editable corner points for polyline when selected */}
        {isSelected && subdivision.points.map((point, index) => (
          <SubdivisionCornerPoint
            key={`${subdivision.id}-corner-${index}`}
            position={point}
            index={index}
            subdivisionId={subdivision.id}
            onDrag={handleCornerDrag}
            isActive={selectedCorner === index}
            onSelect={setSelectedCorner}
            onDragStart={handleCornerDragStart}
            onDragEnd={handleCornerDragEnd}
            drawingMode={drawingMode}
            isDragging={draggingCorner === index}
          />
        ))}
      </group>
    );
  }
  
  // Rectangle subdivision (existing code)
  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Plane
        args={[subdivision.width, subdivision.length]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[subdivision.x, 0.015, subdivision.z]}
      >
        <meshLambertMaterial 
          color={subdivision.color} 
          transparent 
          opacity={isSelected ? 0.7 : hovered ? 0.5 : 0.3} 
        />
      </Plane>
      
      {/* Border */}
      <Line
        points={[
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z - subdivision.length/2],
          [subdivision.x + subdivision.width/2, 0.02, subdivision.z - subdivision.length/2],
          [subdivision.x + subdivision.width/2, 0.02, subdivision.z + subdivision.length/2],
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z + subdivision.length/2],
          [subdivision.x - subdivision.width/2, 0.02, subdivision.z - subdivision.length/2]
        ]}
        color={isSelected ? "#ff6b6b" : subdivision.color}
        lineWidth={isSelected ? 3 : 2}
      />
      
      {/* Label */}
      <Text
        position={[subdivision.x, 0.5, subdivision.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {subdivision.label}
        {'\n'}
        {subdivision.area.toFixed(1)} m²
      </Text>
      
      {/* Editable corner points for rectangle when selected */}
      {isSelected && (() => {
        const corners = [
          { x: subdivision.x - subdivision.width/2, z: subdivision.z - subdivision.length/2 },
          { x: subdivision.x + subdivision.width/2, z: subdivision.z - subdivision.length/2 },
          { x: subdivision.x + subdivision.width/2, z: subdivision.z + subdivision.length/2 },
          { x: subdivision.x - subdivision.width/2, z: subdivision.z + subdivision.length/2 }
        ];
        
        return corners.map((corner, index) => (
          <SubdivisionCornerPoint
            key={`${subdivision.id}-rect-corner-${index}`}
            position={corner}
            index={index}
            subdivisionId={subdivision.id}
            onDrag={handleCornerDrag}
            isActive={selectedCorner === index}
            onSelect={setSelectedCorner}
            onDragStart={handleCornerDragStart}
            onDragEnd={handleCornerDragEnd}
            drawingMode={drawingMode}
            isDragging={draggingCorner === index}
          />
        ));
      })()}
    </group>
  );
}

function Scene({ landShape, onUpdateLandShape, environment, selectedComparison, totalAreaInSqM, drawingMode, subdivisions, setSubdivisions, isDraggingCorner, onDragStateChange, onAddPolylinePoint, polylinePoints, selectedSubdivision, onSubdivisionSelect, onSubdivisionMove, onUpdateSubdivision, isDraggingSubdivisionCorner, onSubdivisionCornerDragStateChange }) {
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, color: '#10b981', dimensions: { width: 100, length: 70 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, color: '#f59e0b', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, color: '#0ea5e9', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, color: '#06b6d4', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, color: '#8b5cf6', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, color: '#64748b', dimensions: { width: 5, length: 2.5 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, color: '#3b82f6', dimensions: { width: 50, length: 25 } }
  ];

  const comparison = selectedComparison ? comparisonOptions.find(c => c.id === selectedComparison) : null;
  
  const handleAddSubdivision = (subdivision) => {
    setSubdivisions([...subdivisions, subdivision]);
  };

  const handleDeleteSubdivision = (id) => {
    setSubdivisions(subdivisions.filter(s => s.id !== id));
  };

  const handleEditSubdivision = (id, newLabel) => {
    setSubdivisions(subdivisions.map(s => 
      s.id === id ? { ...s, label: newLabel } : s
    ));
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[100, 100, 50]} intensity={0.8} castShadow />
      <directionalLight position={[-50, 50, -50]} intensity={0.3} />
      
      {/* Ground */}
      <Plane 
        args={[400, 400]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color="#4a7c59" />
      </Plane>
      
      {/* Grid */}
      <Grid 
        args={[400, 400]} 
        cellSize={5} 
        cellThickness={0.5} 
        cellColor="#888888" 
        sectionSize={25} 
        sectionThickness={1} 
        sectionColor="#cccccc" 
        fadeDistance={200} 
        infiniteGrid={false}
        position={[0, 0.001, 0]}
      />
      
      {/* Editable land shape */}
      <EditableLandShape
        landShape={landShape}
        onUpdateShape={onUpdateLandShape}
        drawingMode={drawingMode}
        onDragStateChange={onDragStateChange}
      />
      
      {/* Drawing plane for subdivisions */}
      <DrawingPlane 
        landShape={landShape}
        onAddSubdivision={handleAddSubdivision}
        drawingMode={drawingMode}
        subdivisions={subdivisions}
        setSubdivisions={setSubdivisions}
        onAddPolylinePoint={onAddPolylinePoint}
        polylinePoints={polylinePoints}
      />
      
      {/* Render subdivisions */}
      {subdivisions.map(subdivision => (
        <Subdivision
          key={subdivision.id}
          subdivision={subdivision}
          onDelete={handleDeleteSubdivision}
          onEdit={handleEditSubdivision}
          isSelected={selectedSubdivision === subdivision.id}
          onSelect={onSubdivisionSelect}
          onMove={onSubdivisionMove}
          drawingMode={drawingMode}
          onUpdateSubdivision={onUpdateSubdivision}
          onSubdivisionCornerDragStateChange={onSubdivisionCornerDragStateChange}
        />
      ))}
      
      {/* Comparison objects - only show if not in drawing mode */}
      {!drawingMode && comparison && (() => {
        const numObjects = Math.floor(totalAreaInSqM / comparison.area);
        const objectsToShow = Math.min(numObjects, 20);
        const itemsPerRow = Math.ceil(Math.sqrt(objectsToShow));
        const spacing = Math.max(comparison.dimensions.width, comparison.dimensions.length) * 1.2;
        const gridWidth = (itemsPerRow - 1) * spacing;
        const startX = -gridWidth / 2;
        const startZ = -gridWidth / 2;
        
        const objects = [];
        
        for (let i = 0; i < objectsToShow; i++) {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const xPos = startX + col * spacing;
          const zPos = startZ + row * spacing;
          
          objects.push(
            <Plane 
              key={i}
              args={[comparison.dimensions.width, comparison.dimensions.length]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[xPos, 0.03, zPos]}
            >
              <meshLambertMaterial color={comparison.color} transparent opacity={0.6} />
            </Plane>
          );
        }
        
        return objects;
      })()}
      
      {/* OrbitControls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2}
        enabled={drawingMode !== 'rectangle' && drawingMode !== 'select' && drawingMode !== 'polyline' && !isDraggingCorner && !isDraggingSubdivisionCorner}
      />
    </>
  );
}

const LandVisualizer = () => {
  const [units, setUnits] = useState([{ value: 1000, unit: 'm²' }]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [showTraditionalInfo, setShowTraditionalInfo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [subdivisions, setSubdivisions] = useState([]);
  const [editingSubdivision, setEditingSubdivision] = useState(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualDimensions, setManualDimensions] = useState({ width: '', length: '', label: '' });
  const [landShape, setLandShape] = useState([
    { x: -50, z: -50 },
    { x: 50, z: -50 },
    { x: 50, z: 50 },
    { x: -50, z: 50 }
  ]);
  const [polylinePoints, setPolylinePoints] = useState([]);
  const [isUpdatingFromShape, setIsUpdatingFromShape] = useState(false);
  const [isDraggingCorner, setIsDraggingCorner] = useState(false);
  const [hasManuallyEditedShape, setHasManuallyEditedShape] = useState(false);
  const [selectedSubdivision, setSelectedSubdivision] = useState(null);
  const [isDraggingSubdivisionCorner, setIsDraggingSubdivisionCorner] = useState(false);

  // Unit conversions to square meters
  const unitConversions = {
    'm²': 1,
    'ft²': 0.092903,
    'hectares': 10000,
    'acres': 4046.86,
    'arpent': 3418.89,
    'perche': 42.2112,
    'toise': 3.798
  };

  // Load configuration from URL on mount
  useEffect(() => {
    const loadFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const config = params.get('config');
      
      if (config) {
        try {
          const decoded = JSON.parse(atob(config));
          if (decoded.units && Array.isArray(decoded.units)) {
            setUnits(decoded.units);
          }
          if (decoded.comparison) {
            setSelectedComparison(decoded.comparison);
          }
          if (decoded.subdivisions) {
            setSubdivisions(decoded.subdivisions);
          }
          if (decoded.landShape) {
            setLandShape(decoded.landShape);
          }
          if (decoded.hasManuallyEditedShape) {
            setHasManuallyEditedShape(decoded.hasManuallyEditedShape);
          }
        } catch (error) {
          console.error('Failed to load configuration from URL');
        }
      }
    };
    
    loadFromURL();
  }, []);

  // Generate shareable URL
  const generateShareURL = () => {
    const config = {
      units: units,
      comparison: selectedComparison,
      subdivisions: subdivisions,
      landShape: landShape,
      hasManuallyEditedShape: hasManuallyEditedShape
    };
    
    const encoded = btoa(JSON.stringify(config));
    const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
    return url;
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const url = generateShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate total area from units input
  const totalAreaInSqM = units.reduce((total, unit) => {
    return total + (unit.value * unitConversions[unit.unit]);
  }, 0);
  
  // Update land shape to match the input area only if not manually edited
  useEffect(() => {
    if (totalAreaInSqM > 0 && !isUpdatingFromShape && !hasManuallyEditedShape) {
      const sideLength = Math.sqrt(totalAreaInSqM);
      const halfSide = sideLength / 2;
      
      setLandShape([
        { x: -halfSide, z: -halfSide },
        { x: halfSide, z: -halfSide },
        { x: halfSide, z: halfSide },
        { x: -halfSide, z: halfSide }
      ]);
    }
  }, [totalAreaInSqM, isUpdatingFromShape, hasManuallyEditedShape]);

  // Calculate conversions
  const totalAcres = totalAreaInSqM / 4046.86;
  const totalHectares = totalAreaInSqM / 10000;

  // Calculate subdivisions total
  const subdivisionsTotal = subdivisions.reduce((total, sub) => total + sub.area, 0);
  const remainingArea = totalAreaInSqM - subdivisionsTotal;

  // Comparison data
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, icon: '⚽', color: 'emerald', dimensions: { width: 100, length: 70 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, icon: '🏀', color: 'amber', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, icon: '🎾', color: 'sky', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, icon: '🏊', color: 'cyan', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, icon: '🏠', color: 'violet', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, icon: '🚗', color: 'slate', dimensions: { width: 5, length: 2.5 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, icon: '🏊', color: 'blue', dimensions: { width: 50, length: 25 } }
  ];

  const addUnit = () => {
    setUnits([...units, { value: 0, unit: 'm²' }]);
    // Don't reset the shape when adding a new unit with value 0
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
      // Reset manual edit flag when removing a unit changes the total area
      setHasManuallyEditedShape(false);
    }
  };

  const updateUnit = (index, field, value) => {
    const newUnits = [...units];
    newUnits[index][field] = field === 'value' ? Number(value) : value;
    setUnits(newUnits);
    
    // Reset manual edit flag when user changes area value input or unit type
    if ((field === 'value' && value !== '' && Number(value) > 0) || field === 'unit') {
      setHasManuallyEditedShape(false);
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleDeleteSubdivision = (id) => {
    setSubdivisions(subdivisions.filter(s => s.id !== id));
  };

  const handleStartEdit = (subdivision) => {
    setEditingSubdivision(subdivision.id);
    setEditingLabel(subdivision.label);
  };

  const handleSaveEdit = (id) => {
    setSubdivisions(subdivisions.map(s => 
      s.id === id ? { ...s, label: editingLabel } : s
    ));
    setEditingSubdivision(null);
    setEditingLabel('');
  };

  const handleCancelEdit = () => {
    setEditingSubdivision(null);
    setEditingLabel('');
  };

  const clearAllSubdivisions = () => {
    setSubdivisions([]);
    setDrawingMode(null);
  };

  const handleUpdateLandShape = (newShape) => {
    setLandShape(newShape);
    setHasManuallyEditedShape(true); // Mark that user has manually edited the shape
    
    // Calculate area from the new shape and update units
    const calculateShapeArea = () => {
      let area = 0;
      const n = newShape.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += newShape[i].x * newShape[j].z;
        area -= newShape[j].x * newShape[i].z;
      }
      return Math.abs(area) / 2;
    };
    
    const newArea = calculateShapeArea();
    if (newArea > 0) {
      setIsUpdatingFromShape(true);
      setUnits([{ value: newArea, unit: 'm²' }]);
      setTimeout(() => setIsUpdatingFromShape(false), 100);
    }
  };

  const handleDragStateChange = (isDragging) => {
    setIsDraggingCorner(isDragging);
  };

  const resetToSquareShape = () => {
    setHasManuallyEditedShape(false);
    setPolylinePoints([]);
    // This will trigger the useEffect to recreate a square shape
  };

  const addCorner = () => {
    const newCorner = { x: 0, z: 0 }; // Add corner at center
    const newShape = [...landShape, newCorner];
    setLandShape(newShape);
    setHasManuallyEditedShape(true);
  };

  const removeCorner = () => {
    if (landShape.length > 3) { // Minimum 3 corners for a polygon
      const newShape = landShape.slice(0, -1);
      setLandShape(newShape);
      setHasManuallyEditedShape(true);
    }
  };

  const finishPolylineDrawing = () => {
    if (polylinePoints.length >= 3) {
      // Calculate area of polyline using shoelace formula
      const calculatePolylineArea = (points) => {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += points[i].x * points[j].z;
          area -= points[j].x * points[i].z;
        }
        return Math.abs(area) / 2;
      };
      
      const area = calculatePolylineArea(polylinePoints);
      
      // Create a subdivision instead of replacing the main land area
      const newSubdivision = {
        id: Date.now(),
        points: polylinePoints,
        area: area,
        label: `Polyline Area ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        type: 'polyline'
      };
      
      setSubdivisions([...subdivisions, newSubdivision]);
    }
    setPolylinePoints([]);
    setDrawingMode(null);
  };

  const addPolylinePoint = (x, z) => {
    // Check if clicking on an existing point to close the shape
    const clickThreshold = 3; // Distance threshold for clicking on existing points
    const existingPointIndex = polylinePoints.findIndex(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.z - z, 2));
      return distance < clickThreshold;
    });
    
    if (existingPointIndex !== -1 && polylinePoints.length >= 3) {
      // Close the shape by finishing the polyline
      finishPolylineDrawing();
      return;
    }
    
    const newPoint = { x, z };
    setPolylinePoints([...polylinePoints, newPoint]);
  };

  const handleManualAdd = () => {
    const width = parseFloat(manualDimensions.width);
    const length = parseFloat(manualDimensions.length);
    
    if (width > 0 && length > 0) {
      const area = width * length;
      const newSubdivision = {
        id: Date.now(),
        x: 0,
        z: 0,
        width: width,
        length: length,
        area: area,
        label: manualDimensions.label || `Area ${subdivisions.length + 1}`,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
      
      setSubdivisions([...subdivisions, newSubdivision]);
      setManualDimensions({ width: '', length: '', label: '' });
      setShowManualInput(false);
    }
  };
  
  const handleSubdivisionSelect = (subdivisionId) => {
    setSelectedSubdivision(subdivisionId);
  };
  
  const handleSubdivisionCornerDragStateChange = (isDragging) => {
    setIsDraggingSubdivisionCorner(isDragging);
  };
  
  const handleSubdivisionMove = (subdivisionId, newX, newZ) => {
    setSubdivisions(subdivisions.map(sub => {
      if (sub.id === subdivisionId) {
        if (sub.type === 'polyline') {
          // Calculate the centroid of the current polyline
          const currentCentroid = sub.points.reduce(
            (acc, point) => ({ x: acc.x + point.x, z: acc.z + point.z }),
            { x: 0, z: 0 }
          );
          currentCentroid.x /= sub.points.length;
          currentCentroid.z /= sub.points.length;
          
          // Calculate the offset from current centroid to new position
          const deltaX = newX - currentCentroid.x;
          const deltaZ = newZ - currentCentroid.z;
          
          // Move all points by the offset
          const newPoints = sub.points.map(point => ({
            x: point.x + deltaX,
            z: point.z + deltaZ
          }));
          return { ...sub, points: newPoints };
        } else {
          // Move rectangle subdivision
          return { ...sub, x: newX, z: newZ };
        }
      }
      return sub;
    }));
  };
  
  const handleUpdateSubdivision = (subdivisionId, updates) => {
    setSubdivisions(subdivisions.map(sub => {
      if (sub.id === subdivisionId) {
        const updatedSub = { ...sub, ...updates };
        
        // Recalculate area if points were updated
        if (updates.points && updatedSub.type === 'polyline') {
          const calculatePolylineArea = (points) => {
            let area = 0;
            const n = points.length;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              area += points[i].x * points[j].z;
              area -= points[j].x * points[i].z;
            }
            return Math.abs(area) / 2;
          };
          
          updatedSub.area = calculatePolylineArea(updates.points);
        }
        
        return updatedSub;
      }
      return sub;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </button>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAreaInSqM)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Square Meters</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalHectares)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Hectares</div>
                  </div>
                  <div className="h-12 w-px bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(totalAcres)}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Acres</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Land Configuration</h3>
              <p className="text-sm text-slate-600 mb-4">
                Copy this link to share your current land configuration with others:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generateShareURL()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Modal */}
      {showManualInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Subdivision by Dimensions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={manualDimensions.label}
                    onChange={(e) => setManualDimensions({...manualDimensions, label: e.target.value})}
                    placeholder={`Area ${subdivisions.length + 1}`}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      value={manualDimensions.width}
                      onChange={(e) => setManualDimensions({...manualDimensions, width: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      value={manualDimensions.length}
                      onChange={(e) => setManualDimensions({...manualDimensions, length: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {manualDimensions.width && manualDimensions.length && (
                  <div className="text-sm text-slate-600">
                    Area: {formatNumber(parseFloat(manualDimensions.width) * parseFloat(manualDimensions.length))} m²
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualDimensions({ width: '', length: '', label: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualAdd}
                  disabled={!manualDimensions.width || !manualDimensions.length}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add Subdivision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <label htmlFor={`area-value-${index}`} className="block text-xs font-medium text-slate-700 mb-1">
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
                          id={`area-value-${index}`}
                          name={`area-value-${index}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`unit-type-${index}`} className="block text-xs font-medium text-slate-700 mb-1">
                          Unit Type
                        </label>
                        <select
                          value={unitItem.unit}
                          onChange={(e) => updateUnit(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                          id={`unit-type-${index}`}
                          name={`unit-type-${index}`}
                        >
                          <option value="m²">m²</option>
                          <option value="ft²">ft²</option>
                          <option value="hectares">hectares</option>
                          <option value="acres">acres</option>
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
            
            {/* All Conversions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">All Conversions</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(unitConversions).map(([unit, conversion]) => (
                  <div key={unit} className="flex flex-col items-center py-3 px-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{unit}</span>
                    <span className="text-sm font-mono text-slate-900 font-semibold mt-1">
                      {formatNumber(totalAreaInSqM / conversion)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Traditional Units Info */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowTraditionalInfo(!showTraditionalInfo)}
                className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Info size={16} className="mr-2" />
               Traditional Units Information
             </button>
             
             {showTraditionalInfo && (
               <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                 <h4 className="font-semibold text-slate-900 mb-2">Traditional Units:</h4>
                 <ul className="space-y-2 text-sm text-slate-700">
                   <li>
                     <strong>Arpent:</strong> French colonial unit, varies by region (Louisiana ≈ 0.84 acres)
                   </li>
                   <li>
                     <strong>Perche:</strong> Traditional British unit, also called "rod" or "pole"
                   </li>
                   <li>
                     <strong>Toise:</strong> Historical French unit of length and area
                   </li>
                 </ul>
               </div>
             )}
             
             <div className="mt-4 flex items-center justify-between">
               <span className="text-sm text-slate-600">
                 <Maximize2 size={16} className="inline mr-1" />
                 Total land area: {totalAreaInSqM.toFixed(1)} m²
               </span>
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
                     {drawingMode === 'rectangle' 
                       ? 'Click and drag to draw subdivisions'
                       : 'Drag to rotate • Scroll to zoom • Outdoor environment'
                     }
                   </p>
                 </div>
               </div>
             </div>
             <div style={{ width: '100%', height: '500px', backgroundColor: '#f8fafc' }}>
               <Canvas camera={{ position: [50, 50, 50], fov: 75 }}>
                 <Scene 
                   landShape={landShape}
                   onUpdateLandShape={handleUpdateLandShape}
                   environment="outdoor" 
                   selectedComparison={selectedComparison}
                   totalAreaInSqM={totalAreaInSqM}
                   drawingMode={drawingMode}
                   subdivisions={subdivisions}
                   setSubdivisions={setSubdivisions}
                   isDraggingCorner={isDraggingCorner}
                   onDragStateChange={handleDragStateChange}
                   onAddPolylinePoint={addPolylinePoint}
                   polylinePoints={polylinePoints}
                   selectedSubdivision={selectedSubdivision}
                   onSubdivisionSelect={handleSubdivisionSelect}
                   onSubdivisionMove={handleSubdivisionMove}
                   onUpdateSubdivision={handleUpdateSubdivision}
                   isDraggingSubdivisionCorner={isDraggingSubdivisionCorner}
                   onSubdivisionCornerDragStateChange={handleSubdivisionCornerDragStateChange}
                 />
               </Canvas>
             </div>
           </div>
           
           {/* Drawing Tools */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
             <div className="p-4 border-b border-slate-200">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-slate-900">Drawing Tools</h3>
                 {subdivisions.length > 0 && (
                   <button
                     onClick={clearAllSubdivisions}
                     className="text-sm text-red-600 hover:text-red-700 flex items-center"
                   >
                     <Trash2 size={14} className="mr-1" />
                     Clear All
                   </button>
                 )}
               </div>
             </div>
             <div className="p-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 <button
                   onClick={() => {
                     setDrawingMode(drawingMode === 'select' ? null : 'select');
                     setSelectedSubdivision(null);
                   }}
                   className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     drawingMode === 'select'
                       ? 'bg-blue-600 text-white'
                       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                   }`}
                 >
                   <MousePointer size={16} className="mr-2" />
                   Select
                 </button>
                 
                 <button
                   onClick={() => setDrawingMode(drawingMode === 'rectangle' ? null : 'rectangle')}
                   className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     drawingMode === 'rectangle'
                       ? 'bg-blue-600 text-white'
                       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                   }`}
                 >
                   <SquareIcon size={16} className="mr-2" />
                   Draw Rectangle
                 </button>
                 
                 <button
                   onClick={() => setDrawingMode(drawingMode === 'polyline' ? null : 'polyline')}
                   className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     drawingMode === 'polyline'
                       ? 'bg-blue-600 text-white'
                       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                   }`}
                 >
                   <Edit3 size={16} className="mr-2" />
                   Draw Polyline
                 </button>
                 
                 <button
                   onClick={() => setShowManualInput(true)}
                   className="inline-flex items-center justify-center px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-all"
                 >
                   <Edit3 size={16} className="mr-2" />
                   Enter Dimensions
                 </button>
               </div>
               
               {/* Corner Controls - Available for rectangle, polyline, and dimensions modes */}
               {(drawingMode === 'rectangle' || drawingMode === 'polyline' || drawingMode === null) && (
                 <div className="mt-4 pt-4 border-t border-slate-200">
                   <h4 className="text-sm font-medium text-slate-700 mb-3">Corner Controls</h4>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={addCorner}
                       className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all"
                     >
                       <Plus size={14} className="mr-1" />
                       Add Corner
                     </button>
                     
                     <button
                       onClick={removeCorner}
                       disabled={landShape.length <= 3}
                       className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-all"
                     >
                       <Minus size={14} className="mr-1" />
                       Remove Corner
                     </button>
                     
                     {hasManuallyEditedShape && (
                       <button
                         onClick={resetToSquareShape}
                         className="inline-flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-all"
                       >
                         <SquareIcon size={14} className="mr-1" />
                         Reset to Square
                       </button>
                     )}
                   </div>
                 </div>
               )}
               
               {/* Polyline Controls */}
               {drawingMode === 'polyline' && (
                 <div className="mt-4 pt-4 border-t border-slate-200">
                   <div className="flex items-center justify-between">
                     <span className="text-sm text-slate-600">
                       Click on the land to add points. Need at least 3 points.
                     </span>
                     <button
                       onClick={finishPolylineDrawing}
                       disabled={polylinePoints.length < 3}
                       className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-all"
                     >
                       Finish Shape
                     </button>
                   </div>
                   {polylinePoints.length > 0 && (
                     <div className="mt-2 text-sm text-slate-500">
                       Points: {polylinePoints.length}
                     </div>
                   )}
                 </div>
               )}
               
               {drawingMode === 'rectangle' && (
                 <div className="mt-4 pt-4 border-t border-slate-200">
                   <span className="text-sm text-slate-600">
                     Click and drag on the land to draw a subdivision
                   </span>
                 </div>
               )}
             </div>
           </div>
           
           {/* Subdivisions List */}
           {subdivisions.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
               <div className="p-4 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-900">Subdivisions</h3>
                 <p className="text-sm text-slate-600 mt-1">
                   Total subdivided: {formatNumber(subdivisionsTotal)} m² • 
                   Remaining: {formatNumber(remainingArea)} m²
                 </p>
               </div>
               <div className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {subdivisions.map((subdivision) => (
                     <div
                       key={subdivision.id}
                       className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-colors"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <div 
                           className="w-4 h-4 rounded"
                           style={{ backgroundColor: subdivision.color }}
                         />
                         {editingSubdivision === subdivision.id ? (
                           <div className="flex items-center flex-1 mx-2">
                             <input
                               type="text"
                               value={editingLabel}
                               onChange={(e) => setEditingLabel(e.target.value)}
                               className="flex-1 px-2 py-1 text-sm bg-white border border-slate-300 rounded"
                               autoFocus
                             />
                             <button
                               onClick={() => handleSaveEdit(subdivision.id)}
                               className="ml-1 p-1 text-green-600 hover:text-green-700"
                             >
                               <Save size={14} />
                             </button>
                             <button
                               onClick={handleCancelEdit}
                               className="ml-1 p-1 text-slate-600 hover:text-slate-700"
                             >
                               <X size={14} />
                             </button>
                           </div>
                         ) : (
                           <span className="flex-1 mx-2 font-medium text-slate-900">
                             {subdivision.label}
                           </span>
                         )}
                         {editingSubdivision !== subdivision.id && (
                           <div className="flex items-center gap-1">
                             <button
                               onClick={() => handleStartEdit(subdivision)}
                               className="p-1 text-slate-600 hover:text-slate-900"
                             >
                               <Edit3 size={14} />
                             </button>
                             <button
                               onClick={() => handleDeleteSubdivision(subdivision.id)}
                               className="p-1 text-red-600 hover:text-red-700"
                             >
                               <Trash2 size={14} />
                             </button>
                           </div>
                         )}
                       </div>
                       <div className="text-sm text-slate-600">
                         Area: {formatNumber(subdivision.area)} m²
                       </div>
                       <div className="text-xs text-slate-500 mt-1">
                         {subdivision.type === 'polyline' 
                           ? `Polyline (${subdivision.points.length} points)`
                           : `${subdivision.width.toFixed(1)}m × ${subdivision.length.toFixed(1)}m`
                         }
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
           {/* Size Comparisons */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-200">
               <h3 className="text-lg font-semibold text-slate-900">Visual Comparisons</h3>
               <p className="text-sm text-slate-600 mt-1">Click to overlay comparison objects</p>
             </div>
             <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
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
                     disabled={drawingMode === 'rectangle'}
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                         <div className="text-3xl">
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

           
           {/* Area Summary */}
           {subdivisions.length > 0 && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200">
               <div className="p-4 border-b border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-900">Area Summary</h3>
               </div>
               <div className="p-4 space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Total Area</span>
                   <span className="text-sm font-mono text-slate-900">
                     {formatNumber(totalAreaInSqM)} m²
                   </span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Subdivided</span>
                   <span className="text-sm font-mono text-green-600">
                     {formatNumber(subdivisionsTotal)} m²
                   </span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t">
                   <span className="text-sm font-medium text-slate-700">Remaining</span>
                   <span className="text-sm font-mono text-blue-600">
                     {formatNumber(remainingArea)} m²
                   </span>
                 </div>
                 <div className="text-xs text-slate-500 mt-2">
                   {((subdivisionsTotal / totalAreaInSqM) * 100).toFixed(1)}% subdivided
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

function App() {
 return <LandVisualizer />;
}

export default App;