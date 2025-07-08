// src/OrbitControls.js
import * as THREE from 'three';

// This is a simplified version of OrbitControls
export class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3();
    
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    
    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.0;
    
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    
    this.scale = 1;
    this.zoomChanged = false;
    
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    
    this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1 };
    this.state = this.STATE.NONE;
    
    this.update = () => {
      const offset = new THREE.Vector3();
      const position = this.camera.position;
      
      offset.copy(position).sub(this.target);
      this.spherical.setFromVector3(offset);
      
      this.spherical.theta += this.sphericalDelta.theta;
      this.spherical.phi += this.sphericalDelta.phi;
      
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
      
      this.spherical.radius *= this.scale;
      this.spherical.radius = Math.max(10, Math.min(200, this.spherical.radius));
      
      offset.setFromSpherical(this.spherical);
      position.copy(this.target).add(offset);
      
      this.camera.lookAt(this.target);
      
      if (this.enableDamping) {
        this.sphericalDelta.theta *= (1 - this.dampingFactor);
        this.sphericalDelta.phi *= (1 - this.dampingFactor);
      } else {
        this.sphericalDelta.set(0, 0, 0);
      }
      
      this.scale = 1;
      this.zoomChanged = false;
    };
    
    this.onMouseDown = (event) => {
      event.preventDefault();
      this.state = this.STATE.ROTATE;
      this.rotateStart.set(event.clientX, event.clientY);
    };
    
    this.onMouseMove = (event) => {
      event.preventDefault();
      
      if (this.state === this.STATE.ROTATE) {
        this.rotateEnd.set(event.clientX, event.clientY);
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed);
        
        this.sphericalDelta.theta -= 2 * Math.PI * this.rotateDelta.x / this.domElement.clientHeight;
        this.sphericalDelta.phi -= 2 * Math.PI * this.rotateDelta.y / this.domElement.clientHeight;
        
        this.rotateStart.copy(this.rotateEnd);
        this.update();
      }
    };
    
    this.onMouseUp = () => {
      this.state = this.STATE.NONE;
    };
    
    this.onMouseWheel = (event) => {
      event.preventDefault();
      
      if (event.deltaY < 0) {
        this.scale *= 0.95;
      } else {
        this.scale *= 1.05;
      }
      
      this.update();
    };
    
    this.domElement.addEventListener('mousedown', this.onMouseDown);
    this.domElement.addEventListener('mousemove', this.onMouseMove);
    this.domElement.addEventListener('mouseup', this.onMouseUp);
    this.domElement.addEventListener('wheel', this.onMouseWheel);
    
    this.dispose = () => {
      this.domElement.removeEventListener('mousedown', this.onMouseDown);
      this.domElement.removeEventListener('mousemove', this.onMouseMove);
      this.domElement.removeEventListener('mouseup', this.onMouseUp);
      this.domElement.removeEventListener('wheel', this.onMouseWheel);
    };
    
    this.update();
  }
}