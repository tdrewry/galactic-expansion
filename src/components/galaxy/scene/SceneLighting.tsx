
import React from 'react';

export const SceneLighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffaa00" />
    </>
  );
};
