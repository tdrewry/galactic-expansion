
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
        vec2 offset = uv - center;
        
        // Event horizon - solid black sphere
        if (distFromCenter < eventHorizonRadius) {
          color = vec3(0.0, 0.0, 0.0);
          alpha = 1.0;
        }
        // Ring 1: Gravitational halo - circular ring
        else if (distFromCenter > eventHorizonRadius + 0.02 && distFromCenter < haloRadius) {
          // Create a circular ring by checking distance from a specific radius
          float targetRadius = (eventHorizonRadius + haloRadius) * 0.6;
          float ringDistance = abs(distFromCenter - targetRadius);
          float ringThickness = 0.04;
          
          if (ringDistance < ringThickness) {
            float intensity = 1.0 - (ringDistance / ringThickness);
            intensity = smoothstep(0.0, 1.0, intensity);
            
            // Blue gravitational lensing glow
            color = vec3(0.3, 0.5, 1.0) * intensity;
            alpha = intensity * 0.7;
          }
        }
        // Ring 2: Accretion disk - circular ring rotated 90 degrees
        else if (distFromCenter > eventHorizonRadius + 0.01 && distFromCenter < accretionRadius) {
          // Create a second circular ring at a different radius
          float targetRadius = (eventHorizonRadius + accretionRadius) * 0.7;
          float ringDistance = abs(distFromCenter - targetRadius);
          float diskThickness = 0.03;
          
          if (ringDistance < diskThickness) {
            float intensity = 1.0 - (ringDistance / diskThickness);
            intensity = smoothstep(0.0, 1.0, intensity);
            
            // Orange swirling pattern
            float angle = atan(offset.y, offset.x);
            float swirl = sin(angle * 4.0 + time * 3.0 + distFromCenter * 15.0) * 0.5 + 0.5;
            
            // Temperature-based colors - hot orange swirls
            float temp = swirl * intensity;
            color = mix(
              vec3(1.0, 0.4, 0.1), // Hot orange-red
              vec3(1.0, 0.8, 0.3), // Bright yellow-orange
              temp
            );
            
            alpha = intensity * 0.8;
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
