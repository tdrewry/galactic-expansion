
import * as THREE from 'three';

export const createGravitationalLensingMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      center: { value: new THREE.Vector2(0.5, 0.5) },
      eventHorizonRadius: { value: 0.08 },
      haloRadius: { value: 0.25 },
      accretionRadius: { value: 0.15 },
    },
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 center;
      uniform float eventHorizonRadius;
      uniform float haloRadius;
      uniform float accretionRadius;
      
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0);
        float alpha = 0.0;
        
        float distFromCenter = length(uv - center);
        
        // Event horizon - solid black sphere
        if (distFromCenter < eventHorizonRadius) {
          color = vec3(0.0, 0.0, 0.0);
          alpha = 1.0;
        }
        // Ring 1: Gravitational halo (horizontal orientation)
        else if (distFromCenter >= eventHorizonRadius && distFromCenter <= haloRadius) {
          // Create horizontal ring effect
          float ringDistance = abs(distFromCenter - (eventHorizonRadius + haloRadius) * 0.5);
          float ringWidth = (haloRadius - eventHorizonRadius) * 0.3;
          
          if (ringDistance < ringWidth) {
            float ringIntensity = 1.0 - (ringDistance / ringWidth);
            ringIntensity = smoothstep(0.0, 1.0, ringIntensity);
            
            // Subtle gravitational lensing glow
            color = vec3(0.4, 0.6, 1.0) * ringIntensity;
            alpha = ringIntensity * 0.6;
          }
        }
        // Ring 2: Accretion disk (vertical orientation, 90 degrees rotated)
        else if (distFromCenter >= eventHorizonRadius && distFromCenter <= accretionRadius) {
          // Create vertical ring for accretion disk
          vec2 offset = uv - center;
          float verticalDistance = abs(offset.x); // Use x-component for vertical ring
          float diskThickness = 0.02;
          
          if (verticalDistance < diskThickness) {
            float diskIntensity = 1.0 - (verticalDistance / diskThickness);
            diskIntensity = smoothstep(0.0, 1.0, diskIntensity);
            
            // Orange swirling pattern based on reference image
            float angle = atan(offset.y, offset.x);
            float swirl = sin(angle * 3.0 + time * 2.0 + distFromCenter * 10.0) * 0.5 + 0.5;
            
            // Temperature-based colors - hot orange/red swirls
            float temp = swirl * diskIntensity;
            color = mix(
              vec3(1.0, 0.3, 0.1), // Hot orange-red
              vec3(1.0, 0.8, 0.2), // Bright yellow-orange
              temp
            );
            
            alpha = diskIntensity * 0.8;
          }
        }
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending
  });
};

export const updateMaterialUniforms = (material: THREE.ShaderMaterial, time: number) => {
  if (material.uniforms) {
    material.uniforms.time.value = time;
  }
};
