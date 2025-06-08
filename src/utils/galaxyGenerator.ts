import * as THREE from 'three';

// Constants for galaxy generation
const G = 6.6743e-11; // Gravitational constant
const SOLAR_MASS = 1.989e30; // Solar mass in kg
const PARSEC = 3.086e16; // 1 parsec in meters
const LIGHT_SPEED = 299792458; // Speed of light in m/s

// Star types
export type StarType = 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar' | 'blackhole';

// Galaxy types
export type GalaxyType = 'spiral' | 'barred-spiral' | 'elliptical' | 'globular';

// Moon characteristics
export interface Moon {
  id: string;
  name: string;
  type: string;
  radius: number;
  distanceFromPlanet: number;
}

// Planet characteristics
export interface Planet {
  id: string;
  name: string;
  type: string;
  radius: number;
  distanceFromStar: number;
  size: number;
  distance: number;
  atmosphere: string;
  temperature: number;
  hasWater: boolean;
  hasLife: boolean;
  resources: string[];
  civilization?: Civilization;
  features?: any[];
  moons?: Moon[];
  inhabited?: boolean;
}

// Civilization details
export interface Civilization {
  name: string;
  type: string;
  techLevel: number;
  population: number;
  description: string;
  hasMarket?: boolean;
  hasRepair?: boolean;
}

// Companion star details
export interface CompanionStar {
  starType: StarType;
  temperature: number;
  mass: number;
  planets: Planet[];
}

// Star system details
export interface StarSystem {
  id: string;
  name: string;
  position: [number, number, number];
  starType: StarType;
  size: number;
  temperature?: number;
  mass?: number;
  planets: Planet[];
  explored?: boolean;
  binaryCompanion?: CompanionStar;
  trinaryCompanion?: CompanionStar;
  specialFeatures?: string[];
}

export interface BlackHole {
  id: string;
  name: string;
  position: [number, number, number];
  starType: 'blackhole';
  size: number;
  planets: Planet[]; // Black holes can have captured planets/debris
  explored?: boolean;
}

// Create a union type for entities that can be selected/navigated to
export type SelectableEntity = StarSystem | BlackHole;

// Nebula details
export interface Nebula {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  size: number;
}

// Galaxy details
export interface Galaxy {
  name: string;
  seed: number;
  galaxyType: GalaxyType;
  starSystems: StarSystem[];
  blackHoles?: BlackHole[];
  nebulae: Nebula[];
  width: number;
  height: number;
  depth: number;
}

// Function to generate a planet
function generatePlanet(systemName: string, planetIndex: number, random: () => number): Planet {
  const name = `Planet ${planetIndex + 1}`;
  const type = random() > 0.7 ? 'gas-giant' : random() > 0.5 ? 'terrestrial' : 'rocky';
  const radius = Math.floor(random() * 10000 + 1000); // Random radius in km
  const distanceFromStar = Math.floor(random() * 50 + 20); // Random distance from star
  const size = Math.floor(random() * 10 + 5); // Random size between 5 and 15
  const distance = Math.floor(random() * 50 + 20); // Random distance from star
  const atmosphere = random() > 0.5 ? 'Toxic' : 'Breathable';
  const temperature = Math.floor(random() * 100 - 50); // Random temperature between -50 and 50
  const hasWater = random() > 0.3;
  const hasLife = hasWater && random() > 0.6;
  const resources = ['Iron', 'Gold', 'Uranium'];
  const inhabited = hasLife && random() > 0.5;

  let civilization: Civilization | undefined;
  if (inhabited) {
    const civType = random() > 0.5 ? 'advanced' : 'primitive';
    civilization = {
      name: `${name} Civilization`,
      type: civType,
      techLevel: Math.floor(random() * 5 + 1),
      population: Math.floor(random() * 1000000),
      description: 'A thriving civilization.',
      hasMarket: random() > 0.3,
      hasRepair: random() > 0.5
    };
  }

  // Generate moons
  const numMoons = Math.floor(random() * 3); // 0-2 moons
  const moons: Moon[] = [];
  for (let i = 0; i < numMoons; i++) {
    moons.push({
      id: `${systemName}-${name}-moon-${i}`,
      name: `${name} Moon ${i + 1}`,
      type: 'rocky',
      radius: Math.floor(random() * 1000 + 100),
      distanceFromPlanet: Math.floor(random() * 10000 + 5000)
    });
  }

  return {
    id: `${systemName}-planet-${planetIndex}`,
    name,
    type,
    radius,
    distanceFromStar,
    size,
    distance,
    atmosphere,
    temperature,
    hasWater,
    hasLife,
    resources,
    civilization,
    moons: moons.length > 0 ? moons : undefined,
    inhabited
  };
}

// Function to generate a companion star
function generateCompanionStar(systemName: string, companionType: 'binary' | 'trinary', random: () => number): CompanionStar {
  const starTypes: StarType[] = ['main-sequence', 'red-giant', 'white-dwarf', 'neutron', 'magnetar', 'pulsar', 'quasar'];
  const starType = starTypes[Math.floor(random() * starTypes.length)];
  const temperature = Math.floor(random() * 40000 + 3000); // 3000K to 43000K
  const mass = Math.random() * 3 + 0.5; // 0.5 to 3.5 solar masses
  const numPlanets = Math.floor(random() * 3); // 0-2 planets for companions

  const planets: Planet[] = [];
  for (let i = 0; i < numPlanets; i++) {
    planets.push(generatePlanet(`${systemName}-${companionType}`, i, random));
  }

  return {
    starType,
    temperature,
    mass,
    planets
  };
}

// Function to generate a star system
function generateStarSystem(id: number, random: () => number, binaryFrequency: number = 0.15, trinaryFrequency: number = 0.03): StarSystem {
  const starTypes: StarType[] = ['main-sequence', 'red-giant', 'white-dwarf', 'neutron', 'magnetar', 'pulsar', 'quasar'];
  const name = `System ${id}`;
  const position = [
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000
  ] as [number, number, number];
  const starType = starTypes[Math.floor(random() * starTypes.length)];
  const size = Math.floor(random() * 200 + 50); // Random size between 50 and 250
  const temperature = Math.floor(random() * 40000 + 3000); // 3000K to 43000K
  const mass = Math.random() * 3 + 0.5; // 0.5 to 3.5 solar masses
  const numPlanets = Math.floor(random() * 5); // Random number of planets

  const planets: Planet[] = [];
  for (let i = 0; i < numPlanets; i++) {
    planets.push(generatePlanet(name, i, random));
  }

  // Generate companion stars
  let binaryCompanion: CompanionStar | undefined;
  let trinaryCompanion: CompanionStar | undefined;
  
  if (random() < binaryFrequency) {
    binaryCompanion = generateCompanionStar(name, 'binary', random);
    
    if (random() < trinaryFrequency) {
      trinaryCompanion = generateCompanionStar(name, 'trinary', random);
    }
  }

  // Generate special features
  const specialFeatures: string[] = [];
  if (random() > 0.8) {
    const features = ['asteroid-belt', 'nebula', 'space-station', 'ancient-ruins'];
    specialFeatures.push(features[Math.floor(random() * features.length)]);
  }

  return {
    id: `star-system-${id}`,
    name,
    position,
    starType,
    size,
    temperature,
    mass,
    planets,
    binaryCompanion,
    trinaryCompanion,
    specialFeatures
  };
}

// Function to generate a black hole
function generateBlackHole(id: number, random: () => number): BlackHole {
  const name = `Black Hole ${id}`;
  const position = [
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000
  ] as [number, number, number];
  const size = Math.floor(random() * 300 + 100); // Random size between 100 and 400
  const numPlanets = Math.floor(random() * 3); // Black holes can have a few captured planets

  const planets: Planet[] = [];
  for (let i = 0; i < numPlanets; i++) {
    planets.push(generatePlanet(name, i, random));
  }

  return {
    id: `black-hole-${id}`,
    name,
    position,
    starType: 'blackhole',
    size,
    planets
  };
}

// Function to generate a nebula
function generateNebula(id: number, random: () => number): Nebula {
  const name = `Nebula ${id}`;
  const position = [
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000,
    Math.floor(random() * 100000) - 50000
  ] as [number, number, number];
  const color = '#' + Math.floor(random() * 16777215).toString(16); // Random hex color
  const size = Math.floor(random() * 5000 + 1000); // Random size between 1000 and 6000

  return {
    id: `nebula-${id}`,
    name,
    position,
    color,
    size
  };
}

// Function to generate a galaxy
export function generateGalaxy(seed: number, numSystems: number, numBlackHoles: number = 50, binaryFrequency: number = 0.15, trinaryFrequency: number = 0.03): Galaxy {
  const name = 'Procedural Galaxy';
  const width = 100000;
  const height = 100000;
  const depth = 100000;

  // Use a seeded random number generator
  const random = mulberry32(seed);

  // Generate galaxy type based on seed
  const galaxyTypeRoll = random();
  let galaxyType: GalaxyType;
  if (galaxyTypeRoll < 0.4) {
    galaxyType = 'spiral';
  } else if (galaxyTypeRoll < 0.7) {
    galaxyType = 'barred-spiral';
  } else if (galaxyTypeRoll < 0.9) {
    galaxyType = 'elliptical';
  } else {
    galaxyType = 'globular';
  }

  console.log(`Generated ${galaxyType} galaxy with seed ${seed}`);

  const starSystems: StarSystem[] = [];
  for (let i = 0; i < numSystems; i++) {
    starSystems.push(generateStarSystem(i, random, binaryFrequency, trinaryFrequency));
  }

  // Generate black holes (subtract 1 to account for central black hole)
  const blackHoles: BlackHole[] = [];
  for (let i = 0; i < numBlackHoles - 1; i++) {
    blackHoles.push(generateBlackHole(i, random));
  }
  
  // Add a central black hole
  blackHoles.push({
    id: 'central-blackhole',
    name: 'Central Supermassive Black Hole',
    position: [0, 0, 0],
    starType: 'blackhole',
    size: 500,
    planets: []
  });

  console.log('Generated galaxy with:', starSystems.length, 'star systems and', blackHoles.length, 'black holes');

  // Generate nebulae
  const nebulae: Nebula[] = [];
  for (let i = 0; i < 10; i++) {
    nebulae.push(generateNebula(i, random));
  }

  return {
    name,
    seed,
    galaxyType,
    starSystems,
    blackHoles,
    nebulae,
    width,
    height,
    depth
  };
}

// Seeded random number generator (mulberry32)
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
