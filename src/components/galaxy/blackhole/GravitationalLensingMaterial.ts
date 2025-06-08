
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
        
        // Multiple ring layers with multiplicative blending
        if (distFromCenter > eventHorizonRadius && distFromCenter < distortionRadius) {
          // Normalize distance within the ring
          float normalizedDist = (distFromCenter - eventHorizonRadius) / (distortionRadius - eventHorizonRadius);
          
          // Calculate angle for rotational effects
          float angle = atan(offset.y, offset.x);
          
          // Initialize combined values
          vec3 combinedColor = vec3(0.0);
          float combinedAlpha = 0.0;
          
          // VERTICAL RING SYSTEM (original orientation)
          {
            // Layer 1: Primary ring structure
            float angle1 = angle + time * 0.5;
            float ringScale1 = 12.0;
            float ringPos1 = normalizedDist * ringScale1;
            float ringIndex1 = floor(ringPos1);
            float ringFraction1 = fract(ringPos1);
            
            float thicknessVariation1 = sin(angle1 * 3.0 + ringIndex1 * 2.0) * 0.15 + 0.85;
            float baseThickness1 = 0.4;
            float variableThickness1 = baseThickness1 * thicknessVariation1;
            
            float ringStart1 = 0.5 - variableThickness1 * 0.5;
            float ringEnd1 = 0.5 + variableThickness1 * 0.5;
            float ringMask1 = step(ringStart1, ringFraction1) * step(ringFraction1, ringEnd1);
            
            float layer1Alpha = 0.0;
            if (ringMask1 > 0.0) {
              float edgeSmooth1 = smoothstep(ringStart1 - 0.05, ringStart1 + 0.05, ringFraction1) * 
                                 smoothstep(ringEnd1 + 0.05, ringEnd1 - 0.05, ringFraction1);
              layer1Alpha = edgeSmooth1 * 0.7 * thicknessVariation1;
            }
            
            // Layer 2: Secondary ring structure
            float angle2 = angle + time * -0.3;
            float ringScale2 = 8.0;
            float ringPos2 = normalizedDist * ringScale2;
            float ringIndex2 = floor(ringPos2);
            float ringFraction2 = fract(ringPos2);
            
            float thicknessVariation2 = sin(angle2 * 2.0 + ringIndex2 * 3.0) * 0.2 + 0.8;
            float baseThickness2 = 0.35;
            float variableThickness2 = baseThickness2 * thicknessVariation2;
            
            float ringStart2 = 0.4 - variableThickness2 * 0.5;
            float ringEnd2 = 0.4 + variableThickness2 * 0.5;
            float ringMask2 = step(ringStart2, ringFraction2) * step(ringFraction2, ringEnd2);
            
            float layer2Alpha = 0.0;
            if (ringMask2 > 0.0) {
              float edgeSmooth2 = smoothstep(ringStart2 - 0.04, ringStart2 + 0.04, ringFraction2) * 
                                 smoothstep(ringEnd2 + 0.04, ringEnd2 - 0.04, ringFraction2);
              layer2Alpha = edgeSmooth2 * 0.5 * thicknessVariation2;
            }
            
            float verticalRingAlpha = layer1Alpha * layer2Alpha * 3.0;
            combinedAlpha += verticalRingAlpha;
          }
          
          // HORIZONTAL RING SYSTEM (90 degrees rotated)
          {
            // Rotate the angle by 90 degrees (PI/2)
            float horizontalAngle = angle + 1.5708;
            
            // Layer 1H: Primary horizontal ring structure
            float angle1H = horizontalAngle + time * 0.4;
            float ringScale1H = 10.0;
            float ringPos1H = normalizedDist * ringScale1H;
            float ringIndex1H = floor(ringPos1H);
            float ringFraction1H = fract(ringPos1H);
            
            float thicknessVariation1H = sin(angle1H * 2.5 + ringIndex1H * 2.5) * 0.18 + 0.82;
            float baseThickness1H = 0.38;
            float variableThickness1H = baseThickness1H * thicknessVariation1H;
            
            float ringStart1H = 0.45 - variableThickness1H * 0.5;
            float ringEnd1H = 0.45 + variableThickness1H * 0.5;
            float ringMask1H = step(ringStart1H, ringFraction1H) * step(ringFraction1H, ringEnd1H);
            
            float layer1HAlpha = 0.0;
            if (ringMask1H > 0.0) {
              float edgeSmooth1H = smoothstep(ringStart1H - 0.04, ringStart1H + 0.04, ringFraction1H) * 
                                   smoothstep(ringEnd1H + 0.04, ringEnd1H - 0.04, ringFraction1H);
              layer1HAlpha = edgeSmooth1H * 0.6 * thicknessVariation1H;
            }
            
            // Layer 2H: Secondary horizontal ring structure
            float angle2H = horizontalAngle + time * -0.25;
            float ringScale2H = 14.0;
            float ringPos2H = normalizedDist * ringScale2H;
            float ringIndex2H = floor(ringPos2H);
            float ringFraction2H = fract(ringPos2H);
            
            float thicknessVariation2H = sin(angle2H * 3.5 + ringIndex2H * 1.8) * 0.16 + 0.84;
            float baseThickness2H = 0.32;
            float variableThickness2H = baseThickness2H * thicknessVariation2H;
            
            float ringStart2H = 0.55 - variableThickness2H * 0.5;
            float ringEnd2H = 0.55 + variableThickness2H * 0.5;
            float ringMask2H = step(ringStart2H, ringFraction2H) * step(ringFraction2H, ringEnd2H);
            
            float layer2HAlpha = 0.0;
            if (ringMask2H > 0.0) {
              float edgeSmooth2H = smoothstep(ringStart2H - 0.035, ringStart2H + 0.035, ringFraction2H) * 
                                   smoothstep(ringEnd2H + 0.035, ringEnd2H - 0.035, ringFraction2H);
              layer2HAlpha = edgeSmooth2H * 0.55 * thicknessVariation2H;
            }
            
            float horizontalRingAlpha = layer1HAlpha * layer2HAlpha * 2.8;
            combinedAlpha += horizontalRingAlpha;
          }
          
          // Apply final alpha clamping
          combinedAlpha = clamp(combinedAlpha, 0.0, 1.0);
          
          if (combinedAlpha > 0.0) {
            // Create temperature gradient from inner (hot) to outer (cooler)
            float temp = 1.0 - normalizedDist * 0.6;
            
            // Vary colors based on angle and time
            float colorVariation = sin(angle * 2.0 + time * 0.3) * 0.2 + 0.8;
            temp *= colorVariation;
            
            // Enhanced orange colors
            color = mix(
              vec3(1.0, 0.4, 0.1), // Hot orange-red
              vec3(1.0, 0.8, 0.3), // Bright orange-yellow
              temp
            );
            
            // Add brightness variation
            float brightness = 0.9 + 0.3 * colorVariation;
            color *= brightness;
            
            alpha = combinedAlpha;
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
