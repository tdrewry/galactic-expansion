
import * as THREE from 'three';

export const createGravitationalLensingMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      center: { value: new THREE.Vector2(0.5, 0.5) },
      eventHorizonRadius: { value: 0.08 },
      lensingRadius: { value: 0.25 },
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
      uniform float lensingRadius;
      uniform float accretionRadius;
      
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0);
        
        float distFromCenter = length(uv - center);
        
        // Event horizon - pure black, no light escapes
        if (distFromCenter < eventHorizonRadius) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
        
        // Photon sphere - subtle gravitational redshift glow
        if (distFromCenter >= eventHorizonRadius && distFromCenter <= eventHorizonRadius * 1.5) {
          float photonSphereIntensity = smoothstep(eventHorizonRadius, eventHorizonRadius * 1.5, distFromCenter);
          photonSphereIntensity = 1.0 - photonSphereIntensity;
          photonSphereIntensity = pow(photonSphereIntensity, 2.0);
          color += vec3(0.3, 0.4, 0.8) * photonSphereIntensity * 0.4;
        }
        
        // Accretion disk - realistic orbital motion and temperature gradient
        if (distFromCenter > eventHorizonRadius && distFromCenter < accretionRadius) {
          float diskFactor = (distFromCenter - eventHorizonRadius) / (accretionRadius - eventHorizonRadius);
          
          // Orbital motion - faster closer to black hole
          float angle = atan(uv.y - center.y, uv.x - center.x);
          float orbitalSpeed = 1.0 / (distFromCenter + 0.01);
          float orbital = sin(angle * 4.0 + time * orbitalSpeed * 3.0);
          
          // Temperature gradient (inverse square law approximation)
          float temperature = 1.0 / (diskFactor * diskFactor + 0.1);
          temperature = clamp(temperature, 0.0, 1.0);
          
          // Disk turbulence
          float turbulence = sin(angle * 8.0 + time * 2.0) * 0.1 + 0.9;
          
          // Disk intensity with realistic orbital patterns
          float intensity = (orbital * 0.3 + 0.7) * temperature * turbulence;
          intensity = smoothstep(0.2, 1.0, intensity);
          
          // Temperature-based colors
          if (temperature > 0.7) {
            color += vec3(0.9, 0.95, 1.0) * intensity * 0.8; // Very hot - blue-white
          } else if (temperature > 0.4) {
            color += vec3(1.0, 0.9, 0.6) * intensity * 0.6; // Hot - white-yellow
          } else {
            color += vec3(1.0, 0.5, 0.1) * intensity * 0.4; // Cooler - orange-red
          }
          
          // Add some disk thickness variation
          float diskThickness = abs(sin(angle * 6.0)) * 0.02;
          if (diskThickness > 0.015) {
            color *= 0.7; // Darker areas where disk is thicker
          }
        }
        
        // Einstein ring - appears at specific lensing distance
        float einsteinRingDist = lensingRadius * 0.8;
        float ringWidth = 0.008;
        if (abs(distFromCenter - einsteinRingDist) < ringWidth) {
          float ringIntensity = 1.0 - (abs(distFromCenter - einsteinRingDist) / ringWidth);
          ringIntensity = smoothstep(0.0, 1.0, ringIntensity);
          color += vec3(0.6, 0.8, 1.0) * ringIntensity * 0.5;
        }
        
        // Outer gravitational glow - very subtle
        if (distFromCenter > accretionRadius && distFromCenter < lensingRadius) {
          float glowFactor = (lensingRadius - distFromCenter) / (lensingRadius - accretionRadius);
          glowFactor = pow(glowFactor, 3.0);
          color += vec3(0.1, 0.2, 0.4) * glowFactor * 0.1;
        }
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
};

export const updateMaterialUniforms = (material: THREE.ShaderMaterial, time: number) => {
  if (material.uniforms) {
    material.uniforms.time.value = time;
  }
};
