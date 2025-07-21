import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Plane, Box, Text, Line } from '@react-three/drei';
import { Plus, Minus, Maximize2, Activity, Ruler, Info, Share2, Copy, Check, Square as SquareIcon, MousePointer, Trash2, Edit3, Save, X, RotateCcw, RotateCw, Moon, Sun } from 'lucide-react';
import * as THREE from 'three';
import './App.css';

// Realistic comparison object component
function RealisticComparisonObject({ type, position, dimensions, color }) {
  const { width, length } = dimensions;
  
  // Border component for each object
  const ObjectBorder = () => (
    <Line
      points={[
        [-width/2, 0.001, -length/2], [width/2, 0.001, -length/2],
        [width/2, 0.001, length/2], [-width/2, 0.001, length/2],
        [-width/2, 0.001, -length/2]
      ]}
      color="#000000"
      lineWidth={4}
    />
  );
  
  switch (type) {
    case 'soccerField':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Grass field */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#2d5a2d" />
          </Plane>
          
          {/* Center circle */}
          <Line
            points={Array.from({ length: 33 }, (_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const radius = 9.15;
              return [Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Center line */}
          <Line
            points={[[0, 0.02, -length/2], [0, 0.02, length/2]]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Penalty areas (16.5m x 40.32m) */}
          <Line
            points={[
              [-width/2, 0.02, -16.5], [-width/2 + 16.5, 0.02, -16.5],
              [-width/2 + 16.5, 0.02, 16.5], [-width/2, 0.02, 16.5],
              [-width/2, 0.02, -16.5]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={[
              [width/2, 0.02, -16.5], [width/2 - 16.5, 0.02, -16.5],
              [width/2 - 16.5, 0.02, 16.5], [width/2, 0.02, 16.5],
              [width/2, 0.02, -16.5]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Goal areas (5.5m x 18.32m) */}
          <Line
            points={[
              [-width/2, 0.02, -5.5], [-width/2 + 5.5, 0.02, -5.5],
              [-width/2 + 5.5, 0.02, 5.5], [-width/2, 0.02, 5.5],
              [-width/2, 0.02, -5.5]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={[
              [width/2, 0.02, -5.5], [width/2 - 5.5, 0.02, -5.5],
              [width/2 - 5.5, 0.02, 5.5], [width/2, 0.02, 5.5],
              [width/2, 0.02, -5.5]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Corner arcs */}
          {Array.from({ length: 4 }, (_, i) => {
            const cornerX = i < 2 ? -width/2 : width/2;
            const cornerZ = i % 2 === 0 ? -length/2 : length/2;
            const startAngle = i * Math.PI / 2;
            
            return (
              <Line
                key={i}
                points={Array.from({ length: 17 }, (_, j) => {
                  const angle = startAngle + (j / 16) * (Math.PI / 2);
                  const radius = 1;
                  return [
                    cornerX + Math.cos(angle) * radius * (i < 2 ? 1 : -1),
                    0.02,
                    cornerZ + Math.sin(angle) * radius * (i % 2 === 0 ? 1 : -1)
                  ];
                })}
                color="#ffffff"
                lineWidth={2}
              />
            );
          })}
          
          {/* Penalty arcs */}
          <Line
            points={Array.from({ length: 17 }, (_, i) => {
              const angle = -Math.PI/2 + (i / 16) * Math.PI; // Mirror the arc
              const radius = 9.15;
              const centerX = -width/2 + 16.5; // Position at edge of penalty area
              return [centerX + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={Array.from({ length: 17 }, (_, i) => {
              const angle = Math.PI/2 + (i / 16) * Math.PI; // Mirror the arc
              const radius = 9.15;
              const centerX = width/2 - 16.5; // Position at edge of penalty area
              return [centerX + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Goals */}
          <Box args={[0.5, 2.44, 7.32]} position={[-width/2, 1.22, 0]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          <Box args={[0.5, 2.44, 7.32]} position={[width/2, 1.22, 0]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
        </group>
      );
      
    case 'basketballCourt':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Court surface */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#B8860B" />
          </Plane>
          
          {/* Center circle */}
          <Line
            points={Array.from({ length: 33 }, (_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const radius = 1.8;
              return [Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Center line */}
          <Line
            points={[[0, 0.02, -length/2], [0, 0.02, length/2]]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Free throw circles */}
          <Line
            points={Array.from({ length: 33 }, (_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const radius = 1.8;
              return [-width/2 + 5.8 + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={Array.from({ length: 33 }, (_, i) => {
              const angle = (i / 32) * Math.PI * 2;
              const radius = 1.8;
              return [width/2 - 5.8 + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Free throw lanes (painted areas) */}
          <Plane
            args={[5.8, 4.9]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-width/2 + 2.9, 0.015, 0]}
          >
            <meshLambertMaterial color="#FF6B35" />
          </Plane>
          <Plane
            args={[5.8, 4.9]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[width/2 - 2.9, 0.015, 0]}
          >
            <meshLambertMaterial color="#FF6B35" />
          </Plane>
          
          {/* Free throw lines */}
          <Line
            points={[[-width/2 + 5.8, 0.02, -2.45], [-width/2 + 5.8, 0.02, 2.45]]}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={[[width/2 - 5.8, 0.02, -2.45], [width/2 - 5.8, 0.02, 2.45]]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Three-point arcs */}
          <Line
            points={Array.from({ length: 25 }, (_, i) => {
              const angle = -Math.PI/2 + (i / 24) * Math.PI;
              const radius = 7.24;
              return [-width/2 + 1.575 + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={Array.from({ length: 25 }, (_, i) => {
              const angle = Math.PI/2 + (i / 24) * Math.PI;
              const radius = 7.24;
              return [width/2 - 1.575 + Math.cos(angle) * radius, 0.02, Math.sin(angle) * radius];
            })}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Baskets with hoops */}
          <Box args={[0.2, 3.05, 1.8]} position={[-width/2 + 1.2, 1.5, 0]} >
            <meshLambertMaterial color="#FF6B35" />
          </Box>
          <Box args={[0.2, 3.05, 1.8]} position={[width/2 - 1.2, 1.5, 0]} >
            <meshLambertMaterial color="#FF6B35" />
          </Box>
          
          {/* Basketball hoops */}
          <Line
            points={Array.from({ length: 17 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const radius = 0.225;
              return [-width/2 + 1.575 + Math.cos(angle) * radius, 3.05, Math.sin(angle) * radius];
            })}
            color="#FFA500"
            lineWidth={3}
          />
          <Line
            points={Array.from({ length: 17 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const radius = 0.225;
              return [width/2 - 1.575 + Math.cos(angle) * radius, 3.05, Math.sin(angle) * radius];
            })}
            color="#FFA500"
            lineWidth={3}
          />
        </group>
      );
      
    case 'tennisCourt':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Court surface */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#2E7D32" />
          </Plane>
          
          {/* Singles court markings */}
          <Line
            points={[
              [-8.23, 0.02, -length/2], [-8.23, 0.02, length/2],
              [8.23, 0.02, length/2], [8.23, 0.02, -length/2],
              [-8.23, 0.02, -length/2]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Doubles court markings */}
          <Line
            points={[
              [-width/2, 0.02, -length/2], [-width/2, 0.02, length/2],
              [width/2, 0.02, length/2], [width/2, 0.02, -length/2],
              [-width/2, 0.02, -length/2]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Service boxes */}
          <Line
            points={[
              [-8.23, 0.02, -6.4], [8.23, 0.02, -6.4],
              [8.23, 0.02, 6.4], [-8.23, 0.02, 6.4],
              [-8.23, 0.02, -6.4]
            ]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Service line (center) */}
          <Line
            points={[[0, 0.02, -6.4], [0, 0.02, 6.4]]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Center service line */}
          <Line
            points={[[-8.23, 0.02, 0], [8.23, 0.02, 0]]}
            color="#ffffff"
            lineWidth={2}
          />
          
          {/* Net */}
          <Box args={[0.1, 0.91, length + 2]} position={[0, 0.45, 0]} >
            <meshLambertMaterial color="#ffffff" wireframe />
          </Box>
          
          {/* Net posts */}
          <Box args={[0.1, 1.07, 0.1]} position={[0, 0.535, -length/2 - 0.5]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
          <Box args={[0.1, 1.07, 0.1]} position={[0, 0.535, length/2 + 0.5]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
          
          {/* Baseline center marks */}
          <Line
            points={[[0, 0.02, -length/2], [0, 0.02, -length/2 + 0.1]]}
            color="#ffffff"
            lineWidth={2}
          />
          <Line
            points={[[0, 0.02, length/2], [0, 0.02, length/2 - 0.1]]}
            color="#ffffff"
            lineWidth={2}
          />
        </group>
      );
      
    case 'swimmingPool':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Pool deck */}
          <Plane
            args={[width + 4, length + 4]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#e2e8f0" />
          </Plane>
          
          {/* Pool water */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.5, 0]}
          >
            <meshLambertMaterial color="#1e90ff" transparent opacity={0.8} />
          </Plane>
          
          {/* Pool edge/coping */}
          <Line
            points={[
              [-width/2, 0.02, -length/2], [width/2, 0.02, -length/2],
              [width/2, 0.02, length/2], [-width/2, 0.02, length/2],
              [-width/2, 0.02, -length/2]
            ]}
            color="#4a5568"
            lineWidth={4}
          />
          
          {/* Lane ropes */}
          {Array.from({ length: 7 }, (_, i) => (
            <Line
              key={i}
              points={[
                [(-width/2) + ((i + 1) * width/8), -0.3, -length/2],
                [(-width/2) + ((i + 1) * width/8), -0.3, length/2]
              ]}
              color="#ff0000"
              lineWidth={2}
            />
          ))}
          
          {/* Lane markers on pool bottom */}
          {Array.from({ length: 8 }, (_, i) => (
            <Line
              key={i}
              points={[
                [(-width/2) + (i * width/7), -0.48, -length/2],
                [(-width/2) + (i * width/7), -0.48, length/2]
              ]}
              color="#000000"
              lineWidth={1}
            />
          ))}
          
          {/* Starting blocks */}
          {Array.from({ length: 8 }, (_, i) => (
            <Box
              key={i}
              args={[1, 0.8, 1]}
              position={[(-width/2) + (i * width/7), 0.4, -length/2 + 0.5]}
            >
              <meshLambertMaterial color="#0066cc" />
            </Box>
          ))}
          
          {/* Pool ladders */}
          <Box args={[0.1, 1.5, 0.5]} position={[width/2 - 0.1, 0.25, length/2 - 1]} >
            <meshLambertMaterial color="#c0c0c0" />
          </Box>
          <Box args={[0.1, 1.5, 0.5]} position={[-width/2 + 0.1, 0.25, length/2 - 1]} >
            <meshLambertMaterial color="#c0c0c0" />
          </Box>
          
          {/* Diving board */}
          <Box args={[0.5, 0.1, 3]} position={[width/4, 1, length/2 - 1.5]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
          <Box args={[0.2, 1.5, 0.2]} position={[width/4, 0.75, length/2 - 3]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
        </group>
      );
      
    case 'house':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Foundation/Lot */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#2d5a2d" />
          </Plane>
          
          {/* Driveway */}
          <Plane
            args={[3, length/3]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[width/3, 0.015, -length/4]}
          >
            <meshLambertMaterial color="#4a5568" />
          </Plane>
          
          {/* House base */}
          <Box args={[width * 0.7, 3, length * 0.6]} position={[0, 1.5, 0]} >
            <meshLambertMaterial color="#dc2626" />
          </Box>
          
          {/* Roof */}
          <Box args={[width * 0.75, 1.5, length * 0.65]} position={[0, 3.75, 0]} >
            <meshLambertMaterial color="#7c2d12" />
          </Box>
          
          {/* Chimney */}
          <Box args={[1, 2, 1]} position={[width * 0.2, 5, length * 0.1]} >
            <meshLambertMaterial color="#7c2d12" />
          </Box>
          
          {/* Front door */}
          <Box args={[1, 2, 0.1]} position={[0, 1, length * 0.3 + 0.05]} >
            <meshLambertMaterial color="#7c2d12" />
          </Box>
          
          {/* Door frame */}
          <Box args={[1.2, 2.2, 0.05]} position={[0, 1.1, length * 0.3 + 0.08]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          
          {/* Windows */}
          <Box args={[1.2, 1.2, 0.05]} position={[-width * 0.2, 2, length * 0.3 + 0.05]} >
            <meshLambertMaterial color="#87ceeb" />
          </Box>
          <Box args={[1.2, 1.2, 0.05]} position={[width * 0.2, 2, length * 0.3 + 0.05]} >
            <meshLambertMaterial color="#87ceeb" />
          </Box>
          
          {/* Window frames */}
          <Box args={[1.4, 1.4, 0.02]} position={[-width * 0.2, 2, length * 0.3 + 0.08]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          <Box args={[1.4, 1.4, 0.02]} position={[width * 0.2, 2, length * 0.3 + 0.08]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          
          {/* Garage */}
          <Box args={[width * 0.4, 2.5, length * 0.4]} position={[width * 0.25, 1.25, -length * 0.15]} >
            <meshLambertMaterial color="#dc2626" />
          </Box>
          
          {/* Garage door */}
          <Box args={[width * 0.35, 2, 0.05]} position={[width * 0.25, 1, -length * 0.15 + length * 0.2]} >
            <meshLambertMaterial color="#4a5568" />
          </Box>
          
          {/* Walkway */}
          <Plane
            args={[1.5, length * 0.4]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, length * 0.15]}
          >
            <meshLambertMaterial color="#e5e7eb" />
          </Plane>
          
          {/* Landscaping */}
          <Box args={[2, 0.5, 2]} position={[-width * 0.3, 0.25, length * 0.2]} >
            <meshLambertMaterial color="#16a34a" />
          </Box>
          <Box args={[2, 0.5, 2]} position={[width * 0.3, 0.25, length * 0.2]} >
            <meshLambertMaterial color="#16a34a" />
          </Box>
        </group>
      );
      
    case 'parkingSpace':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Car body */}
          <Box args={[width * 0.8, 0.6, length * 0.9]} position={[0, 0.3, 0]} >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          
          {/* Car hood */}
          <Box args={[width * 0.75, 0.4, length * 0.3]} position={[0, 0.7, length * 0.25]} >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          
          {/* Car windshield */}
          <Box args={[width * 0.7, 0.5, length * 0.15]} position={[0, 1.0, length * 0.1]} >
            <meshLambertMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
          
          {/* Car rear window */}
          <Box args={[width * 0.7, 0.4, length * 0.1]} position={[0, 0.9, -length * 0.2]} >
            <meshLambertMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
          
          {/* Car side windows */}
          <Box args={[width * 0.05, 0.4, length * 0.4]} position={[width * 0.375, 0.9, 0]} >
            <meshLambertMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
          <Box args={[width * 0.05, 0.4, length * 0.4]} position={[-width * 0.375, 0.9, 0]} >
            <meshLambertMaterial color="#87ceeb" transparent opacity={0.7} />
          </Box>
          
          {/* Car tires */}
          <Box args={[width * 0.15, 0.4, width * 0.15]} position={[width * 0.25, 0.2, length * 0.28]} >
            <meshLambertMaterial color="#000000" />
          </Box>
          <Box args={[width * 0.15, 0.4, width * 0.15]} position={[-width * 0.25, 0.2, length * 0.28]} >
            <meshLambertMaterial color="#000000" />
          </Box>
          <Box args={[width * 0.15, 0.4, width * 0.15]} position={[width * 0.25, 0.2, -length * 0.28]} >
            <meshLambertMaterial color="#000000" />
          </Box>
          <Box args={[width * 0.15, 0.4, width * 0.15]} position={[-width * 0.25, 0.2, -length * 0.28]} >
            <meshLambertMaterial color="#000000" />
          </Box>
          
          {/* Headlights */}
          <Box args={[width * 0.12, 0.2, 0.1]} position={[width * 0.25, 0.6, length * 0.45]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          <Box args={[width * 0.12, 0.2, 0.1]} position={[-width * 0.25, 0.6, length * 0.45]} >
            <meshLambertMaterial color="#ffffff" />
          </Box>
          
          {/* Taillights */}
          <Box args={[width * 0.1, 0.15, 0.08]} position={[width * 0.3, 0.5, -length * 0.45]} >
            <meshLambertMaterial color="#ff0000" />
          </Box>
          <Box args={[width * 0.1, 0.15, 0.08]} position={[-width * 0.3, 0.5, -length * 0.45]} >
            <meshLambertMaterial color="#ff0000" />
          </Box>
          
          {/* Car grille */}
          <Box args={[width * 0.6, 0.3, 0.05]} position={[0, 0.6, length * 0.45]} >
            <meshLambertMaterial color="#333333" />
          </Box>
          
          {/* Car bumpers */}
          <Box args={[width * 0.8, 0.2, 0.1]} position={[0, 0.3, length * 0.45]} >
            <meshLambertMaterial color="#1f2937" />
          </Box>
          <Box args={[width * 0.8, 0.2, 0.1]} position={[0, 0.3, -length * 0.45]} >
            <meshLambertMaterial color="#1f2937" />
          </Box>
        </group>
      );
      
    case 'olympicPool':
      return (
        <group position={position}>
          <ObjectBorder />
          {/* Pool deck */}
          <Plane
            args={[width + 10, length + 10]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color="#e2e8f0" />
          </Plane>
          
          {/* Pool water */}
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.2, 0]}
          >
            <meshLambertMaterial color="#1e90ff" transparent opacity={0.8} />
          </Plane>
          
          {/* Pool edge/coping */}
          <Line
            points={[
              [-width/2, 0.02, -length/2], [width/2, 0.02, -length/2],
              [width/2, 0.02, length/2], [-width/2, 0.02, length/2],
              [-width/2, 0.02, -length/2]
            ]}
            color="#4a5568"
            lineWidth={5}
          />
          
          {/* Lane ropes */}
          {Array.from({ length: 9 }, (_, i) => (
            <Line
              key={i}
              points={[
                [(-width/2) + ((i + 1) * width/10), -0.5, -length/2],
                [(-width/2) + ((i + 1) * width/10), -0.5, length/2]
              ]}
              color="#ff0000"
              lineWidth={3}
            />
          ))}
          
          {/* Lane markers on pool bottom */}
          {Array.from({ length: 10 }, (_, i) => (
            <Line
              key={i}
              points={[
                [(-width/2) + (i * width/9), -1.15, -length/2],
                [(-width/2) + (i * width/9), -1.15, length/2]
              ]}
              color="#000000"
              lineWidth={2}
            />
          ))}
          
          {/* 25m markers on pool bottom */}
          <Line
            points={[
              [-width/2, -1.15, 0], [width/2, -1.15, 0]
            ]}
            color="#000000"
            lineWidth={3}
          />
          
          {/* Starting blocks */}
          {Array.from({ length: 10 }, (_, i) => (
            <Box
              key={i}
              args={[1.5, 1, 2]}
              position={[(-width/2) + 2.5 + (i * width/10), 0.5, -length/2 + 1]}
            >
              <meshLambertMaterial color="#0066cc" />
            </Box>
          ))}
          
          {/* Timing touchpads */}
          {Array.from({ length: 10 }, (_, i) => (
            <Box
              key={i}
              args={[1.2, 0.8, 0.1]}
              position={[(-width/2) + 2.5 + (i * width/10), -0.4, length/2 - 0.1]}
            >
              <meshLambertMaterial color="#ffd700" />
            </Box>
          ))}
          
          {/* Spectator stands */}
          <Box args={[width + 20, 8, 10]} position={[0, 4, length/2 + 10]} >
            <meshLambertMaterial color="#4a5568" />
          </Box>
          
          {/* Diving platforms */}
          <Box args={[3, 0.5, 3]} position={[width/3, 10, -length/3]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
          <Box args={[0.5, 10, 0.5]} position={[width/3, 5, -length/3]} >
            <meshLambertMaterial color="#8B4513" />
          </Box>
          
          {/* Pool ladders */}
          <Box args={[0.2, 2, 1]} position={[width/2 - 0.1, 0.5, length/2 - 2]} >
            <meshLambertMaterial color="#c0c0c0" />
          </Box>
          <Box args={[0.2, 2, 1]} position={[-width/2 + 0.1, 0.5, length/2 - 2]} >
            <meshLambertMaterial color="#c0c0c0" />
          </Box>
        </group>
      );
      
    default:
      return (
        <group position={position}>
          <ObjectBorder />
          <Plane
            args={[width, length]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
          >
            <meshLambertMaterial color={color} transparent opacity={0.6} />
          </Plane>
        </group>
      );
  }
}

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
function DimensionLabel({ start, end, position, distance, darkMode }) {
  return (
    <group>
      {/* Background for better visibility */}
      <Plane
        args={[distance.toFixed(1).length * 2 + 4, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[position.x, 5.5, position.z]}
      >
        <meshBasicMaterial color={darkMode ? "#374151" : "#ffffff"} transparent opacity={0.9} />
      </Plane>
      <Text
        position={[position.x, 6, position.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={4}
        color={darkMode ? "#ffffff" : "#000000"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.5}
        outlineColor={darkMode ? "#000000" : "#ffffff"}
      >
        {distance.toFixed(1)}m
      </Text>
    </group>
  );
}

// Editable land shape component
function EditableLandShape({ landShape, onUpdateShape, drawingMode, onDragStateChange, darkMode }) {
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
            darkMode={darkMode}
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

// Measurement tools component
function MeasurementPlane({ measurementMode, measurementPoints, onMeasurementPoint, measurements, onClearMeasurements, darkMode }) {
  const handlePointerDown = (event) => {
    if (!measurementMode) return;
    
    const point = event.point;
    const worldPoint = { x: point.x, z: point.z };
    
    if (measurementMode === 'distance') {
      if (measurementPoints.length === 0) {
        onMeasurementPoint([worldPoint]);
      } else if (measurementPoints.length === 1) {
        onMeasurementPoint([measurementPoints[0], worldPoint]);
      } else {
        // Start new measurement
        onMeasurementPoint([worldPoint]);
      }
    } else if (measurementMode === 'area') {
      onMeasurementPoint([...measurementPoints, worldPoint]);
    }
  };
  
  return (
    <>
      {/* Invisible plane for measurement clicks */}
      <Plane 
        args={[400, 400]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.001, 0]}
        onPointerDown={handlePointerDown}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>
      
      {/* Render measurement points */}
      {measurementPoints.map((point, index) => (
        <group key={index}>
          <Box
            args={[2, 2, 2]}
            position={[point.x, 1, point.z]}
          >
            <meshBasicMaterial color="#ff6b6b" />
          </Box>
        </group>
      ))}
      
      {/* Render distance line */}
      {measurementMode === 'distance' && measurementPoints.length === 2 && (
        <Line
          points={[
            [measurementPoints[0].x, 0.5, measurementPoints[0].z],
            [measurementPoints[1].x, 0.5, measurementPoints[1].z]
          ]}
          color="#ff6b6b"
          lineWidth={3}
        />
      )}
      
      {/* Render area polygon */}
      {measurementMode === 'area' && measurementPoints.length >= 3 && (
        <Line
          points={[
            ...measurementPoints.map(p => [p.x, 0.5, p.z]),
            [measurementPoints[0].x, 0.5, measurementPoints[0].z] // Close the polygon
          ]}
          color="#ff6b6b"
          lineWidth={3}
        />
      )}
      
      {/* Render saved measurements */}
      {measurements.map((measurement, index) => (
        <group key={index}>
          {measurement.type === 'distance' && (
            <>
              <Line
                points={[
                  [measurement.points[0].x, 0.3, measurement.points[0].z],
                  [measurement.points[1].x, 0.3, measurement.points[1].z]
                ]}
                color="#4ecdc4"
                lineWidth={2}
              />
              {/* Background for text */}
              <Plane
                args={[6, 2]}
                position={[
                  (measurement.points[0].x + measurement.points[1].x) / 2,
                  2.8,
                  (measurement.points[0].z + measurement.points[1].z) / 2
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshLambertMaterial color={darkMode ? "#374151" : "white"} transparent opacity={0.9} />
              </Plane>
              <Text
                position={[
                  (measurement.points[0].x + measurement.points[1].x) / 2,
                  3,
                  (measurement.points[0].z + measurement.points[1].z) / 2
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={2}
                color={darkMode ? "white" : "black"}
                anchorX="center"
                anchorY="middle"
              >
                {measurement.distance.toFixed(2)}m
              </Text>
            </>
          )}
          {measurement.type === 'area' && (
            <>
              <Line
                points={[
                  ...measurement.points.map(p => [p.x, 0.3, p.z]),
                  [measurement.points[0].x, 0.3, measurement.points[0].z]
                ]}
                color="#4ecdc4"
                lineWidth={2}
              />
              {/* Background for text */}
              <Plane
                args={[8, 2]}
                position={[
                  measurement.points.reduce((sum, p) => sum + p.x, 0) / measurement.points.length,
                  2.8,
                  measurement.points.reduce((sum, p) => sum + p.z, 0) / measurement.points.length
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshLambertMaterial color={darkMode ? "#374151" : "white"} transparent opacity={0.9} />
              </Plane>
              <Text
                position={[
                  measurement.points.reduce((sum, p) => sum + p.x, 0) / measurement.points.length,
                  3,
                  measurement.points.reduce((sum, p) => sum + p.z, 0) / measurement.points.length
                ]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={2}
                color={darkMode ? "white" : "black"}
                anchorX="center"
                anchorY="middle"
              >
                {measurement.area.toFixed(2)}m²
              </Text>
            </>
          )}
        </group>
      ))}
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

function Scene({ landShape, onUpdateLandShape, environment, selectedComparison, totalAreaInSqM, drawingMode, subdivisions, setSubdivisions, isDraggingCorner, onDragStateChange, onAddPolylinePoint, polylinePoints, selectedSubdivision, onSubdivisionSelect, onSubdivisionMove, onUpdateSubdivision, isDraggingSubdivisionCorner, onSubdivisionCornerDragStateChange, measurementMode, measurementPoints, onMeasurementPoint, measurements, onClearMeasurements, darkMode }) {
  const comparisonOptions = [
    { id: 'soccerField', name: 'Soccer Field', area: 7140, color: '#10b981', dimensions: { width: 105, length: 68 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, color: '#f59e0b', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, color: '#0ea5e9', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, color: '#06b6d4', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, color: '#8b5cf6', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, color: '#64748b', dimensions: { width: 5, length: 2.5 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, color: '#3b82f6', dimensions: { width: 50, length: 25 } }
  ];

  const comparison = selectedComparison ? comparisonOptions.find(c => c.id === selectedComparison) : null;
  
  const handleAddSubdivision = (subdivision) => {
    const newSubdivisions = [...subdivisions, subdivision];
    setSubdivisions(newSubdivisions);
    // Note: History is saved by the parent component, not here
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
      <ambientLight intensity={darkMode ? 0.6 : 0.4} />
      <directionalLight position={[100, 100, 50]} intensity={darkMode ? 1.0 : 0.8} castShadow />
      <directionalLight position={[-50, 50, -50]} intensity={darkMode ? 0.5 : 0.3} />
      
      {/* Ground */}
      <Plane 
        args={[400, 400]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <meshLambertMaterial color={darkMode ? "#2d3748" : "#4a7c59"} />
      </Plane>
      
      {/* Grid */}
      <Grid 
        args={[400, 400]} 
        cellSize={5} 
        cellThickness={0.5} 
        cellColor={darkMode ? "#4a5568" : "#888888"} 
        sectionSize={25} 
        sectionThickness={1} 
        sectionColor={darkMode ? "#6b7280" : "#cccccc"} 
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
        darkMode={darkMode}
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
        
        // Calculate land dimensions
        const landSideLength = Math.sqrt(totalAreaInSqM);
        
        // Calculate how many objects can actually fit in each dimension
        const objectsPerRowMax = Math.floor(landSideLength / comparison.dimensions.width);
        const objectsPerColMax = Math.floor(landSideLength / comparison.dimensions.length);
        const maxObjectsFit = objectsPerRowMax * objectsPerColMax;
        
        const objectsToShow = Math.min(numObjects, maxObjectsFit, 500);
        const itemsPerRow = Math.min(Math.ceil(Math.sqrt(objectsToShow)), objectsPerRowMax);
        const itemsPerCol = Math.ceil(objectsToShow / itemsPerRow);
        
        // Use exact dimensions for spacing - no gaps
        const spacingX = comparison.dimensions.width;
        const spacingZ = comparison.dimensions.length;
        
        const gridWidth = (itemsPerRow - 1) * spacingX;
        const gridHeight = (itemsPerCol - 1) * spacingZ;
        const startX = -gridWidth / 2;
        const startZ = -gridHeight / 2;
        
        const objects = [];
        
        for (let i = 0; i < objectsToShow; i++) {
          const row = Math.floor(i / itemsPerRow);
          const col = i % itemsPerRow;
          const xPos = startX + col * spacingX;
          const zPos = startZ + row * spacingZ;
          
          objects.push(
            <RealisticComparisonObject
              key={i}
              type={comparison.id}
              position={[xPos, 0, zPos]}
              dimensions={comparison.dimensions}
              color={comparison.color}
            />
          );
        }
        
        return objects;
      })()}
      
      {/* Measurement plane */}
      <MeasurementPlane
        measurementMode={measurementMode}
        measurementPoints={measurementPoints}
        onMeasurementPoint={onMeasurementPoint}
        measurements={measurements}
        onClearMeasurements={onClearMeasurements}
        darkMode={darkMode}
      />
      
      {/* OrbitControls */}
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2}
        enabled={drawingMode !== 'rectangle' && drawingMode !== 'select' && drawingMode !== 'polyline' && !isDraggingCorner && !isDraggingSubdivisionCorner && !measurementMode}
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('landVisualizer-darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Measurement state
  const [measurementMode, setMeasurementMode] = useState(null); // 'distance' or 'area'
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  
  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Save initial state to history on component mount
  useEffect(() => {
    if (history.length === 0) {
      const initialState = {
        timestamp: Date.now(),
        action: 'Initial State',
        state: {
          units: units,
          subdivisions: subdivisions,
          landShape: landShape,
          hasManuallyEditedShape: hasManuallyEditedShape,
          measurements: measurements
        }
      };
      setHistory([initialState]);
      setHistoryIndex(0);
    }
  }, [history.length, units, subdivisions, landShape, hasManuallyEditedShape, measurements]);
  
  // Save state to history
  const saveToHistory = useCallback((action, newState) => {
    const historyEntry = {
      timestamp: Date.now(),
      action,
      state: {
        units: newState.units || units,
        subdivisions: newState.subdivisions || subdivisions,
        landShape: newState.landShape || landShape,
        hasManuallyEditedShape: newState.hasManuallyEditedShape !== undefined ? newState.hasManuallyEditedShape : hasManuallyEditedShape,
        measurements: newState.measurements || measurements
      }
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(historyEntry);
    
    // Limit history to last 50 actions
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, units, subdivisions, landShape, hasManuallyEditedShape, measurements]);
  
  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1].state;
      setUnits(prevState.units);
      setSubdivisions(prevState.subdivisions);
      setLandShape(prevState.landShape);
      setHasManuallyEditedShape(prevState.hasManuallyEditedShape);
      if (prevState.measurements) {
        setMeasurements(prevState.measurements);
      }
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history]);
  
  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1].state;
      setUnits(nextState.units);
      setSubdivisions(nextState.subdivisions);
      setLandShape(nextState.landShape);
      setHasManuallyEditedShape(nextState.hasManuallyEditedShape);
      if (nextState.measurements) {
        setMeasurements(nextState.measurements);
      }
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('landVisualizer-darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  // Delete subdivision function for keyboard shortcut
  const deleteSubdivision = useCallback((subdivisionId) => {
    const newSubdivisions = subdivisions.filter(s => s.id !== subdivisionId);
    setSubdivisions(newSubdivisions);
    saveToHistory('Delete Subdivision', { subdivisions: newSubdivisions });
    setEditingSubdivision(null);
  }, [subdivisions, saveToHistory]);
  
  // Distance calculation
  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dz * dz);
  };
  
  // Area calculation for measurement polygon
  const calculateMeasurementArea = (points) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].z;
      area -= points[j].x * points[i].z;
    }
    return Math.abs(area) / 2;
  };
  
  // Handle measurement point selection
  const handleMeasurementPoint = (points) => {
    if (measurementMode === 'distance' && points.length === 2) {
      const distance = calculateDistance(points[0], points[1]);
      const measurement = {
        id: Date.now(),
        type: 'distance',
        points: points,
        distance: distance
      };
      const newMeasurements = [...measurements, measurement];
      setMeasurements(newMeasurements);
      setMeasurementPoints([]);
      
      // Save to history
      saveToHistory('Add Distance Measurement', { measurements: newMeasurements });
    } else if (measurementMode === 'area' && points.length >= 3) {
      setMeasurementPoints(points);
    } else {
      setMeasurementPoints(points);
    }
  };
  
  // Complete area measurement
  const completeAreaMeasurement = useCallback(() => {
    if (measurementPoints.length >= 3) {
      const area = calculateMeasurementArea(measurementPoints);
      const measurement = {
        id: Date.now(),
        type: 'area',
        points: measurementPoints,
        area: area
      };
      const newMeasurements = [...measurements, measurement];
      setMeasurements(newMeasurements);
      setMeasurementPoints([]);
      
      // Save to history
      saveToHistory('Add Area Measurement', { measurements: newMeasurements });
    }
  }, [measurementPoints, measurements, saveToHistory]);
  
  // Clear all measurements
  const clearMeasurements = () => {
    setMeasurements([]);
    setMeasurementPoints([]);
    
    // Save to history
    saveToHistory('Clear Measurements', { measurements: [] });
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        setDrawingMode(null);
        setMeasurementMode(null);
        setMeasurementPoints([]);
      } else if (e.key === 'Delete' && editingSubdivision) {
        deleteSubdivision(editingSubdivision);
      } else if (e.key === 'Enter' && measurementMode === 'area' && measurementPoints.length >= 3) {
        completeAreaMeasurement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, drawingMode, editingSubdivision, measurementMode, measurementPoints, completeAreaMeasurement, deleteSubdivision, redo, undo]);
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
    { id: 'soccerField', name: 'Soccer Field', area: 7140, icon: '⚽', color: 'emerald', dimensions: { width: 105, length: 68 } },
    { id: 'basketballCourt', name: 'Basketball Court', area: 420, icon: '🏀', color: 'amber', dimensions: { width: 28, length: 15 } },
    { id: 'tennisCourt', name: 'Tennis Court', area: 260.87, icon: '🎾', color: 'sky', dimensions: { width: 23.77, length: 10.97 } },
    { id: 'swimmingPool', name: 'Swimming Pool', area: 163, icon: '🏊', color: 'cyan', dimensions: { width: 25, length: 6.5 } },
    { id: 'house', name: 'Average House', area: 150, icon: '🏠', color: 'violet', dimensions: { width: 12, length: 12.5 } },
    { id: 'parkingSpace', name: 'Parking Space', area: 12.5, icon: '🚗', color: 'slate', dimensions: { width: 5, length: 2.5 } },
    { id: 'olympicPool', name: 'Olympic Pool', area: 1250, icon: '🏊', color: 'blue', dimensions: { width: 50, length: 25 } }
  ];

  const addUnit = () => {
    const newUnits = [...units, { value: 0, unit: 'm²' }];
    setUnits(newUnits);
    saveToHistory('Add Unit', { units: newUnits });
  };

  const removeUnit = (index) => {
    if (units.length > 1) {
      const newUnits = units.filter((_, i) => i !== index);
      setUnits(newUnits);
      saveToHistory('Remove Unit', { units: newUnits });
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
    const newSubdivisions = subdivisions.filter(s => s.id !== id);
    setSubdivisions(newSubdivisions);
    saveToHistory('Delete Subdivision', { subdivisions: newSubdivisions });
  };

  const handleStartEdit = (subdivision) => {
    setEditingSubdivision(subdivision.id);
    setEditingLabel(subdivision.label);
  };

  const handleSaveEdit = (id) => {
    const newSubdivisions = subdivisions.map(s => 
      s.id === id ? { ...s, label: editingLabel } : s
    );
    setSubdivisions(newSubdivisions);
    saveToHistory('Edit Subdivision Label', { subdivisions: newSubdivisions });
    setEditingSubdivision(null);
    setEditingLabel('');
  };

  const handleCancelEdit = () => {
    setEditingSubdivision(null);
    setEditingLabel('');
  };

  const clearAllSubdivisions = () => {
    setSubdivisions([]);
    saveToHistory('Clear All Subdivisions', { subdivisions: [] });
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
      const newUnits = [{ value: newArea, unit: 'm²' }];
      setUnits(newUnits);
      
      // Save to history
      saveToHistory('Update Land Shape', { 
        landShape: newShape, 
        hasManuallyEditedShape: true,
        units: newUnits
      });
      
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
    
    // Save to history
    saveToHistory('Add Corner', { 
      landShape: newShape, 
      hasManuallyEditedShape: true
    });
  };

  const removeCorner = () => {
    if (landShape.length > 3) { // Minimum 3 corners for a polygon
      const newShape = landShape.slice(0, -1);
      setLandShape(newShape);
      setHasManuallyEditedShape(true);
      
      // Save to history
      saveToHistory('Remove Corner', { 
        landShape: newShape, 
        hasManuallyEditedShape: true
      });
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
      
      const newSubdivisions = [...subdivisions, newSubdivision];
      setSubdivisions(newSubdivisions);
      
      // Save to history
      saveToHistory('Add Polyline Subdivision', { subdivisions: newSubdivisions });
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
      
      const newSubdivisions = [...subdivisions, newSubdivision];
      setSubdivisions(newSubdivisions);
      
      // Save to history
      saveToHistory('Add Manual Subdivision', { subdivisions: newSubdivisions });
      
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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`shadow-sm border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Professional Land Visualizer</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Advanced 3D land measurement and analysis tool</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                  {darkMode ? 'Light' : 'Dark'}
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shadow-sm"
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </button>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatNumber(totalAreaInSqM)}</div>
                    <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Square Meters</div>
                  </div>
                  <div className={`h-12 w-px ${darkMode ? 'bg-gray-600' : 'bg-slate-200'}`}></div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatNumber(totalHectares)}</div>
                    <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Hectares</div>
                  </div>
                  <div className={`h-12 w-px ${darkMode ? 'bg-gray-600' : 'bg-slate-200'}`}></div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatNumber(totalAcres)}</div>
                    <div className={`text-xs uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Acres</div>
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
          <div className={`rounded-xl shadow-xl max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Share Your Land Configuration</h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                Copy this link to share your current land configuration with others:
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generateShareURL()}
                  readOnly
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200' 
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
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
                  className={`px-4 py-2 text-sm font-medium ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
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
          <div className={`rounded-xl shadow-xl max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Subdivision by Dimensions</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={manualDimensions.label}
                    onChange={(e) => setManualDimensions({...manualDimensions, label: e.target.value})}
                    placeholder={`Area ${subdivisions.length + 1}`}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      Width (m)
                    </label>
                    <input
                      type="number"
                      value={manualDimensions.width}
                      onChange={(e) => setManualDimensions({...manualDimensions, width: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      Length (m)
                    </label>
                    <input
                      type="number"
                      value={manualDimensions.length}
                      onChange={(e) => setManualDimensions({...manualDimensions, length: e.target.value})}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                {manualDimensions.width && manualDimensions.length && (
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
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
                  className={`px-4 py-2 text-sm font-medium ${
                    darkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
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
        <div className={`rounded-xl shadow-sm border mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Activity className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`} />
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
                  <div className={`rounded-lg p-4 border hover:border-slate-300 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:border-gray-500' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label htmlFor={`area-value-${index}`} className={`block text-xs font-medium mb-1 ${
                          darkMode ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                          Area Value
                        </label>
                        <input
                          type="number"
                          value={unitItem.value}
                          onChange={(e) => updateUnit(index, 'value', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-gray-200 placeholder-gray-400' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          id={`area-value-${index}`}
                          name={`area-value-${index}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`unit-type-${index}`} className={`block text-xs font-medium mb-1 ${
                          darkMode ? 'text-gray-300' : 'text-slate-700'
                        }`}>
                          Unit Type
                        </label>
                        <select
                          value={unitItem.unit}
                          onChange={(e) => updateUnit(index, 'unit', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-gray-200' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
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
                          className={`p-2 text-red-500 hover:text-red-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                            darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                          }`}
                        >
                          <Minus size={18} />
                        </button>
                      )}
                    </div>
                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      = {formatNumber(unitItem.value * unitConversions[unitItem.unit])} m²
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* All Conversions */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-700'}`}>All Conversions</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(unitConversions).map(([unit, conversion]) => (
                  <div key={unit} className={`flex flex-col items-center py-3 px-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-slate-600'
                    }`}>{unit}</span>
                    <span className={`text-sm font-mono font-semibold mt-1 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {formatNumber(totalAreaInSqM / conversion)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Traditional Units Info */}
            <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
              <button
                onClick={() => setShowTraditionalInfo(!showTraditionalInfo)}
                className={`flex items-center text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Info size={16} className="mr-2" />
               Traditional Units Information
             </button>
             
             {showTraditionalInfo && (
               <div className={`mt-3 p-4 rounded-lg border ${
                 darkMode 
                   ? 'bg-blue-900/20 border-blue-700' 
                   : 'bg-blue-50 border-blue-200'
               }`}>
                 <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Traditional Units:</h4>
                 <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
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
               <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
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
           <div className={`rounded-xl shadow-sm border overflow-hidden ${
             darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
           }`}>
             <div className={`p-4 border-b ${
               darkMode 
                 ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600' 
                 : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
             }`}>
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>3D Visualization</h2>
                   <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                     {drawingMode === 'rectangle' 
                       ? 'Click and drag to draw subdivisions'
                       : 'Drag to rotate • Scroll to zoom • Outdoor environment'
                     }
                   </p>
                 </div>
               </div>
             </div>
             <div style={{ width: '100%', height: '500px', backgroundColor: darkMode ? '#1f2937' : '#f8fafc' }}>
               <Canvas camera={{ position: [50, 50, 50], fov: 75 }}>
                 <Scene 
                   landShape={landShape}
                   onUpdateLandShape={handleUpdateLandShape}
                   environment="outdoor" 
                   selectedComparison={selectedComparison}
                   totalAreaInSqM={totalAreaInSqM}
                   drawingMode={drawingMode}
                   darkMode={darkMode}
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
                   measurementMode={measurementMode}
                   measurementPoints={measurementPoints}
                   onMeasurementPoint={handleMeasurementPoint}
                   measurements={measurements}
                   onClearMeasurements={clearMeasurements}
                 />
               </Canvas>
             </div>
           </div>
           
           {/* Drawing Tools */}
           <div className={`rounded-xl shadow-sm border mt-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
             <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
               <div className="flex items-center justify-between">
                 <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Drawing Tools</h3>
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={undo}
                     disabled={historyIndex <= 0}
                     className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                       historyIndex <= 0
                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                         : darkMode
                           ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                           : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                     }`}
                     title="Undo (Ctrl+Z)"
                   >
                     <RotateCcw size={16} />
                   </button>
                   
                   <button
                     onClick={redo}
                     disabled={historyIndex >= history.length - 1}
                     className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                       historyIndex >= history.length - 1
                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                         : darkMode
                           ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                           : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                     }`}
                     title="Redo (Ctrl+Y)"
                   >
                     <RotateCw size={16} />
                   </button>
                   
                   {subdivisions.length > 0 && (
                     <button
                       onClick={clearAllSubdivisions}
                       className={`text-sm flex items-center ${
                         darkMode 
                           ? 'text-red-400 hover:text-red-300' 
                           : 'text-red-600 hover:text-red-700'
                       }`}
                     >
                       <Trash2 size={14} className="mr-1" />
                       Clear All
                     </button>
                   )}
                 </div>
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
                       : darkMode
                         ? 'bg-gray-700 hover:bg-gray-600 text-white'
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
                       : darkMode
                         ? 'bg-gray-700 hover:bg-gray-600 text-white'
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
                       : darkMode
                         ? 'bg-gray-700 hover:bg-gray-600 text-white'
                         : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                   }`}
                 >
                   <Edit3 size={16} className="mr-2" />
                   Draw Polyline
                 </button>
                 
                 <button
                   onClick={() => setShowManualInput(true)}
                   className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     darkMode
                       ? 'bg-gray-700 hover:bg-gray-600 text-white'
                       : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                   }`}
                 >
                   <Edit3 size={16} className="mr-2" />
                   Enter Dimensions
                 </button>
               </div>
               
               {/* Measurement Tools */}
               <div className={`mt-4 pt-4 border-t ${
                 darkMode ? 'border-gray-600' : 'border-slate-200'
               }`}>
                 <h4 className={`text-sm font-medium mb-3 ${
                   darkMode ? 'text-white' : 'text-slate-700'
                 }`}>Measurement Tools</h4>
                 <div className="grid grid-cols-3 gap-2">
                   <button
                     onClick={() => setMeasurementMode(measurementMode === 'distance' ? null : 'distance')}
                     className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                       measurementMode === 'distance'
                         ? 'bg-green-600 text-white'
                         : darkMode
                           ? 'bg-gray-700 hover:bg-gray-600 text-white'
                           : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                     }`}
                   >
                     <Ruler size={16} className="mr-2" />
                     Distance
                   </button>
                   
                   <button
                     onClick={() => setMeasurementMode(measurementMode === 'area' ? null : 'area')}
                     className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                       measurementMode === 'area'
                         ? 'bg-green-600 text-white'
                         : darkMode
                           ? 'bg-gray-700 hover:bg-gray-600 text-white'
                           : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                     }`}
                   >
                     <SquareIcon size={16} className="mr-2" />
                     Area
                   </button>
                   
                   <button
                     onClick={clearMeasurements}
                     className={`inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     darkMode
                       ? 'bg-red-800/30 hover:bg-red-700/40 text-red-300'
                       : 'bg-red-200 hover:bg-red-300 text-red-700'
                   }`}
                   >
                     <Trash2 size={16} className="mr-2" />
                     Clear
                   </button>
                 </div>
                 
                 {measurementMode === 'distance' && (
                   <div className={`mt-3 p-3 rounded-lg ${
                     darkMode ? 'bg-green-900/20' : 'bg-green-50'
                   }`}>
                     <p className={`text-sm ${
                       darkMode ? 'text-green-300' : 'text-green-800'
                     }`}>
                       Click two points to measure distance
                     </p>
                   </div>
                 )}
                 
                 {measurementMode === 'area' && (
                   <div className={`mt-3 p-3 rounded-lg ${
                     darkMode ? 'bg-green-900/20' : 'bg-green-50'
                   }`}>
                     <p className={`text-sm ${
                       darkMode ? 'text-green-300' : 'text-green-800'
                     }`}>
                       Click points to create polygon. Press Enter to complete.
                     </p>
                     {measurementPoints.length >= 3 && (
                       <button
                         onClick={completeAreaMeasurement}
                         className="mt-2 inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                       >
                         Complete Area
                       </button>
                     )}
                   </div>
                 )}
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
           <div className={`rounded-xl shadow-sm border ${
           darkMode 
             ? 'bg-gray-800 border-gray-600' 
             : 'bg-white border-slate-200'
         }`}>
             <div className={`p-4 border-b ${
               darkMode ? 'border-gray-600' : 'border-slate-200'
             }`}>
               <h3 className={`text-lg font-semibold ${
                 darkMode ? 'text-white' : 'text-slate-900'
               }`}>Visual Comparisons</h3>
               <p className={`text-sm mt-1 ${
                 darkMode ? 'text-gray-300' : 'text-slate-600'
               }`}>Click to overlay comparison objects</p>
             </div>
             <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
               {comparisonOptions.map((comparison) => {
                 const count = totalAreaInSqM / comparison.area;
                 return (
                   <button
                     key={comparison.id}
                     className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                       selectedComparison === comparison.id
                         ? darkMode
                           ? 'border-blue-400 bg-gradient-to-r from-blue-900/30 to-blue-800/30 shadow-md'
                           : 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                         : darkMode
                           ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 hover:shadow-sm'
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
                           <div className={`font-semibold ${
                             darkMode ? 'text-white' : 'text-slate-900'
                           }`}>{comparison.name}</div>
                           <div className={`text-sm ${
                             darkMode ? 'text-gray-300' : 'text-slate-600'
                           }`}>
                             {count >= 1 
                               ? `${count.toFixed(1)} ${count === 1 ? 'fits' : 'fit'} in your area`
                               : `You need ${(1/count).toFixed(1)} areas`}
                           </div>
                           <div className={`text-xs mt-1 ${
                             darkMode ? 'text-gray-400' : 'text-slate-500'
                           }`}>
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
                         <div className={`text-xs mt-1 ${
                           darkMode ? 'text-gray-400' : 'text-slate-500'
                         }`}>
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