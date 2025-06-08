
import * as THREE from 'three';

export const createGravitationalLensingMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      center: { value: new THREE.Vector2(0.5, 0.5) },
      eventHorizonRadius: { value: 0.0 }, // No event horizon for ring geometry
      distortionRadius: { value: 1.0 }, // Use full ring area for effects
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
        
        // For ring geometry, we want effects across the entire ring
        // No event horizon since that's handled by the separate black sphere
        
        // Calculate angle for rotational effects
        float angle = atan(offset.y, offset.x);
        
        // Normalize distance across the ring (0 = inner edge, 1 = outer edge)
        float normalizedDist = distFromCenter;
        
        // Initialize base color and alpha
        vec3 baseColor = vec3(1.0, 0.6, 0.2); // Base orange
        float totalAlpha = 0.0;
        
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
          layer1Alpha = edgeSmooth1 * 0.8 * thicknessVariation1;
        }
        
        // Layer 2: Secondary ring structure (different scale and rotation)
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
          layer2Alpha = edgeSmooth2 * 0.6 * thicknessVariation2;
        }
        
        // Layer 3: Tertiary fine structure
        float angle3 = angle + time * 0.8;
        float ringScale3 = 18.0;
        float ringPos3 = normalizedDist * ringScale3;
        float ringIndex3 = floor(ringPos3);
        float ringFraction3 = fract(ringPos3);
        
        float thicknessVariation3 = sin(angle3 * 4.0 + ringIndex3 * 1.5) * 0.1 + 0.9;
        float baseThickness3 = 0.25;
        float variableThickness3 = baseThickness3 * thicknessVariation3;
        
        float ringStart3 = 0.6 - variableThickness3 * 0.5;
        float ringEnd3 = 0.6 + variableThickness3 * 0.5;
        float ringMask3 = step(ringStart3, ringFraction3) * step(ringFraction3, ringEnd3);
        
        float layer3Alpha = 0.0;
        if (ringMask3 > 0.0) {
          float edgeSmooth3 = smoothstep(ringStart3 - 0.03, ringStart3 + 0.03, ringFraction3) * 
                             smoothstep(ringEnd3 + 0.03, ringEnd3 - 0.03, ringFraction3);
          layer3Alpha = edgeSmooth3 * 0.4 * thicknessVariation3;
        }
        
        // Combine the layers
        float combinedAlpha = layer1Alpha + layer2Alpha + layer3Alpha;
        float multiplicativeEffect = layer1Alpha * layer2Alpha * layer3Alpha * 5.0;
        
        totalAlpha = combinedAlpha + multiplicativeEffect;
        totalAlpha = clamp(totalAlpha, 0.0, 1.0);
        
        if (totalAlpha > 0.0) {
          // Create temperature gradient from inner (hot) to outer (cooler)
          float temp = 1.0 - normalizedDist * 0.6;
          
          // Vary colors based on layer interactions
          float colorVariation = sin(angle * 2.0 + time * 0.3) * 0.2 + 0.8;
          temp *= colorVariation;
          
          // Enhanced orange colors with layer-based variation
          color = mix(
            vec3(1.0, 0.4, 0.1), // Hot orange-red
            vec3(1.0, 0.8, 0.3), // Bright orange-yellow
            temp
          );
          
          // Add brightness boost from multiplicative effects
          float brightness = 1.0 + multiplicativeEffect * 2.0;
          color *= brightness * (0.8 + 0.4 * colorVariation);
          
          alpha = totalAlpha;
        }
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false, // Allow transparency
    depthTest: true
  });
};

export const updateMaterialUniforms = (material: THREE.ShaderMaterial, time: number) => {
  if (material.uniforms) {
    material.uniforms.time.value = time;
  }
};
