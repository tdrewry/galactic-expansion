
import * as THREE from 'three';

export const createGravitationalLensingMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      center: { value: new THREE.Vector2(0.5, 0.5) },
      eventHorizonRadius: { value: 0.04 }, // Reduced from 0.08
      distortionRadius: { value: 0.055 }, // Reduced from 0.1 to be 45% smaller
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
      uniform float distortionRadius;
      
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0);
        float alpha = 0.0;
        
        float distFromCenter = length(uv - center);
        vec2 offset = uv - center;
        
        // Event horizon - solid black sphere (always render this first)
        if (distFromCenter <= eventHorizonRadius) {
          color = vec3(0.0, 0.0, 0.0);
          alpha = 1.0;
          gl_FragColor = vec4(color, alpha);
          return;
        }
        
        // Distortion ring - orange accretion disk with concentric rings
        if (distFromCenter > eventHorizonRadius && distFromCenter < distortionRadius) {
          // Normalize distance within the ring
          float normalizedDist = (distFromCenter - eventHorizonRadius) / (distortionRadius - eventHorizonRadius);
          
          // Calculate angle for rotational effects
          float angle = atan(offset.y, offset.x) + time * 0.5; // Slow rotation
          
          // Create concentric rings
          float ringScale = 12.0; // Number of rings
          float ringPos = normalizedDist * ringScale;
          float ringIndex = floor(ringPos);
          float ringFraction = fract(ringPos);
          
          // Add thickness variation based on angle and ring index
          float thicknessVariation = sin(angle * 3.0 + ringIndex * 2.0) * 0.15 + 0.85;
          float baseThickness = 0.4;
          float variableThickness = baseThickness * thicknessVariation;
          
          // Create asymmetric ring pattern with variable thickness
          float ringStart = 0.5 - variableThickness * 0.5;
          float ringEnd = 0.5 + variableThickness * 0.5;
          
          // Create ring pattern with variable edges
          float ringMask = step(ringStart, ringFraction) * step(ringFraction, ringEnd);
          
          if (ringMask > 0.0) {
            // Create temperature gradient from inner (hot) to outer (cooler)
            float temp = 1.0 - normalizedDist * 0.6;
            
            // Vary ring colors based on ring index and angle
            float ringVariation = sin(ringIndex * 1.5 + angle * 0.5) * 0.3 + 0.7;
            temp *= ringVariation;
            
            // Orange/amber colors for the accretion disk
            color = mix(
              vec3(1.0, 0.4, 0.1), // Hot orange-red
              vec3(1.0, 0.8, 0.3), // Bright orange-yellow
              temp
            );
            
            // Add brightness variation based on thickness and position
            float brightness = 0.8 + 0.4 * ringVariation * thicknessVariation;
            color *= brightness;
            
            // Smooth falloff at ring edges with variable smoothing
            float edgeSmooth = smoothstep(ringStart - 0.05, ringStart + 0.05, ringFraction) * 
                             smoothstep(ringEnd + 0.05, ringEnd - 0.05, ringFraction);
            alpha = edgeSmooth * 0.9 * thicknessVariation;
          }
        }
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false
  });
};

export const updateMaterialUniforms = (material: THREE.ShaderMaterial, time: number) => {
  if (material.uniforms) {
    material.uniforms.time.value = time;
  }
};
