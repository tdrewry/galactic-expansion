
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
      
      // Gravitational lensing distortion for background elements
      vec2 gravitationalLens(vec2 uv, vec2 blackHole, float radius) {
        vec2 delta = uv - blackHole;
        float dist = length(delta);
        
        if (dist < eventHorizonRadius) {
          return vec2(-1.0); // Inside event horizon - no light escapes
        }
        
        if (dist < radius && dist > eventHorizonRadius) {
          // Apply realistic lensing based on distance from black hole
          float lensStrength = (radius - dist) / (radius - eventHorizonRadius);
          float bendAngle = lensStrength * 0.3; // Reduced bending for realism
          
          // Bend light rays around the black hole
          float angle = atan(delta.y, delta.x);
          vec2 bentDirection = vec2(cos(angle + bendAngle), sin(angle + bendAngle));
          
          return uv + bentDirection * lensStrength * 0.1;
        }
        
        return uv;
      }
      
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0);
        
        float distFromCenter = length(uv - center);
        
        // Event horizon - pure black, no light escapes
        if (distFromCenter < eventHorizonRadius) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
        
        // Accretion disk - minimal and realistic
        if (distFromCenter > eventHorizonRadius && distFromCenter < accretionRadius) {
          float diskFactor = (distFromCenter - eventHorizonRadius) / (accretionRadius - eventHorizonRadius);
          
          // Simple orbital motion
          float angle = atan(uv.y - center.y, uv.x - center.x);
          float orbital = sin(angle * 3.0 - time * 2.0 * (1.0 / distFromCenter));
          
          // Temperature gradient (hotter closer to black hole)
          float temperature = 1.0 - diskFactor;
          
          // Disk intensity with realistic orbital patterns
          float intensity = (orbital * 0.2 + 0.8) * temperature;
          intensity = smoothstep(0.3, 1.0, intensity);
          
          // Realistic accretion disk colors based on temperature
          if (temperature > 0.8) {
            color += vec3(0.9, 0.95, 1.0) * intensity * 0.6; // Very hot - blue-white
          } else if (temperature > 0.5) {
            color += vec3(1.0, 0.9, 0.7) * intensity * 0.5; // Hot - white-yellow
          } else {
            color += vec3(1.0, 0.6, 0.2) * intensity * 0.3; // Cooler - orange-red
          }
        }
        
        // Einstein ring effect - visible when background objects align
        float ringDist = abs(distFromCenter - lensingRadius * 0.85);
        if (ringDist < 0.01) {
          float ringIntensity = 1.0 - (ringDist / 0.01);
          color += vec3(0.8, 0.9, 1.0) * ringIntensity * 0.3;
        }
        
        // Photon sphere - subtle gravitational redshift effect
        if (distFromCenter > eventHorizonRadius && distFromCenter < eventHorizonRadius * 1.5) {
          float photonSphereIntensity = 1.0 - (distFromCenter - eventHorizonRadius) / (eventHorizonRadius * 0.5);
          photonSphereIntensity = pow(photonSphereIntensity, 3.0);
          color += vec3(0.2, 0.3, 0.8) * photonSphereIntensity * 0.2;
        }
        
        // Outside the black hole, we let background elements show through naturally
        // The actual lensing of background stars/galaxies will be handled by 
        // the overall scene rendering, not artificial generation here
        
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
