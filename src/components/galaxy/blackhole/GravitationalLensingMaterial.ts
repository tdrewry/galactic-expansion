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
        
        // Distortion ring - orange accretion disk with ring pattern
        if (distFromCenter > eventHorizonRadius && distFromCenter < distortionRadius) {
          // Create concentric rings
          float ringScale = 15.0; // Number of rings
          float ringPattern = sin((distFromCenter - eventHorizonRadius) * ringScale + time * 2.0);
          
          // Create ring thickness with falloff
          float ringCenter = (eventHorizonRadius + distortionRadius) * 0.65;
          float ringDistance = abs(distFromCenter - ringCenter);
          float ringThickness = 0.025; // Reduced thickness
          
          if (ringDistance < ringThickness) {
            float intensity = 1.0 - (ringDistance / ringThickness);
            intensity = smoothstep(0.0, 1.0, intensity);
            
            // Apply ring pattern
            float ringIntensity = (ringPattern * 0.5 + 0.5) * intensity;
            
            // Create temperature gradient from inner (hot) to outer (cooler)
            float temp = mix(0.8, 0.3, (distFromCenter - eventHorizonRadius) / (distortionRadius - eventHorizonRadius));
            temp = temp * ringIntensity;
            
            // Orange/amber colors for the accretion disk
            color = mix(
              vec3(1.0, 0.3, 0.1), // Hot orange-red
              vec3(1.0, 0.7, 0.2), // Bright orange-yellow
              temp
            );
            
            // Add some brightness variation based on rings
            float brightness = 0.7 + 0.5 * ringIntensity;
            color *= brightness;
            
            alpha = ringIntensity * 0.9;
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
