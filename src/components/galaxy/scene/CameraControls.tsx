
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { StarSystem as StarSystemType, BlackHole } from '../../../utils/galaxyGenerator';
import * as THREE from 'three';

interface CameraControlsProps {
  selectedSystem: StarSystemType | null;
  onControlsReady: (controls: any) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  selectedSystem,
  onControlsReady
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const preserveCameraPosition = useRef(false);
  const hasInitiallyZoomed = useRef(false);

  useEffect(() => {
    if (controlsRef.current) {
      onControlsReady(controlsRef.current);
    }
  }, [onControlsReady]);

  useEffect(() => {
    if (!preserveCameraPosition.current) {
      camera.position.set(0, 20000, 40000);
      camera.lookAt(0, 0, 0);
      preserveCameraPosition.current = true;
    }
    
    gl.domElement.style.touchAction = 'none';
    gl.domElement.style.pointerEvents = 'auto';
  }, [camera, gl]);

  useEffect(() => {
    if (selectedSystem && controlsRef.current) {
      console.log('Centering camera on system:', selectedSystem.id);
      const [x, y, z] = selectedSystem.position;
      targetPosition.current.set(x, y, z);
      controlsRef.current.target.copy(targetPosition.current);
      
      let targetDistance;
      if (!hasInitiallyZoomed.current) {
        targetDistance = 8000;
        hasInitiallyZoomed.current = true;
        console.log('Initial zoom to system at closer distance:', targetDistance);
      } else {
        const currentDistance = camera.position.distanceTo(targetPosition.current);
        targetDistance = Math.max(5000, currentDistance);
      }
      
      const direction = camera.position.clone().sub(targetPosition.current).normalize();
      camera.position.copy(targetPosition.current).add(direction.multiplyScalar(targetDistance));
      isMoving.current = true;
    }
  }, [selectedSystem, camera]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true} 
      enableZoom={true} 
      enableRotate={true}
      maxDistance={300000}
      minDistance={1000}
      dampingFactor={0.05}
      enableDamping={true}
      zoomSpeed={3}
      panSpeed={2}
      rotateSpeed={1}
    />
  );
};
