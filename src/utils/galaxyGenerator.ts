
export interface StarSystem {
  id: string;
  position: [number, number, number];
  starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar' | 'blackhole';
  temperature: number;
  mass: number;
  explored: boolean;
  planets: Planet[];
  specialFeatures: string[];
  binaryCompanion?: {
    starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar' | 'blackhole';
    temperature: number;
    mass: number;
    planets: Planet[];
  };
  trinaryCompanion?: {
    starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar' | 'blackhole';
    temperature: number;
    mass: number;
    planets: Planet[];
  };
}

export interface Planet {
  id: string;
  name: string;
  type: 'terrestrial' | 'gas-giant' | 'ice-giant' | 'asteroid-belt' | 'dwarf-planet';
  position: [number, number, number];
  radius: number;
  atmosphere: string;
  resources: string[];
  inhabited: boolean;
  civilization?: Civilization;
  distanceFromStar: number;
  moons?: Moon[];
}

export interface Moon {
  id: string;
  name: string;
  type: 'rocky' | 'ice' | 'metallic';
  radius: number;
  distanceFromPlanet: number;
}

export interface Civilization {
  name: string;
  type: 'agronarian' | 'peacfolia' | 'mercantile' | 'unknown';
  techLevel: number;
  disposition: 'hostile' | 'neutral' | 'friendly' | 'unknown';
  tradeGoods: string[];
  hasMarket: boolean;
  hasRepair: boolean;
}

export interface Nebula {
  id: string;
  position: [number, number, number];
  size: number;
  type: 'emission' | 'reflection' | 'dark' | 'planetary';
  color: string;
}

export interface BlackHole {
  id: string;
  position: [number, number, number];
  mass: number;
  size: number;
  starType: 'blackhole'; // Add this to make black holes compatible with system selection
  temperature: number;
  explored: boolean;
  planets: Planet[]; // Empty array for black holes
  specialFeatures: string[]; // Empty array for black holes
}

export interface Galaxy {
  seed: number;
  starSystems: StarSystem[];
  nebulae: Nebula[];
  blackHoles: BlackHole[];
  galacticCenter: [number, number, number];
  playerPosition: [number, number, number];
  galaxyType: 'spiral' | 'barred-spiral' | 'globular' | 'elliptical';
}

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export function generateGalaxy(
  seed: number, 
  numSystems: number = 1000, 
  numBlackHoles: number = 50,
  binaryFrequency: number = 0.15,
  trinaryFrequency: number = 0.03
): Galaxy {
  const rng = new SeededRandom(seed);
  const galaxyRadius = 50000; // Light years
  const starSystems: StarSystem[] = [];
  const nebulae: Nebula[] = [];
  const blackHoles: BlackHole[] = [];
  
  // Choose galaxy type - keep all types for seed consistency but substitute unsupported ones
  const galaxyTypes: Galaxy['galaxyType'][] = ['spiral', 'barred-spiral', 'globular', 'elliptical'];
  let galaxyType = rng.choice(galaxyTypes);
  
  // Substitute unsupported galaxy types
  if (galaxyType === 'barred-spiral') {
    console.log(`Galaxy ${seed}: Substituting barred-spiral with spiral`);
    galaxyType = 'spiral';
  } else if (galaxyType === 'elliptical') {
    console.log(`Galaxy ${seed}: Substituting elliptical with globular`);
    galaxyType = 'globular';
  }

  // ALWAYS place a supermassive black hole at the center of the galaxy
  blackHoles.push({
    id: 'central-blackhole',
    position: [0, 0, 0],
    mass: rng.range(1000000, 10000000), // Supermassive black hole
    size: rng.range(5000, 8000), // Larger visual size for central black hole
    starType: 'blackhole',
    temperature: 0,
    explored: false,
    planets: [],
    specialFeatures: []
  });

  // Generate star systems - only normal star types, no black holes
  const starTypes: StarSystem['starType'][] = [
    'main-sequence', 'main-sequence', 'main-sequence', 'main-sequence',
    'red-giant', 'white-dwarf', 'neutron', 'magnetar', 'pulsar', 'quasar'
  ];
  
  for (let i = 0; i < numSystems; i++) {
    let position: [number, number, number];
    
    switch (galaxyType) {
      case 'spiral':
        position = generateSpiralPosition(rng, i, numSystems, galaxyRadius);
        break;
      case 'globular':
        position = generateGlobularPosition(rng, galaxyRadius);
        break;
      default:
        position = generateSpiralPosition(rng, i, numSystems, galaxyRadius);
    }
    
    const starType = rng.choice(starTypes);
    const planets = generatePlanets(rng, starType, `${i}-primary`);
    
    // Generate binary/trinary companions using configurable frequencies
    let binaryCompanion: StarSystem['binaryCompanion'] = undefined;
    let trinaryCompanion: StarSystem['trinaryCompanion'] = undefined;
    
    if (rng.next() < binaryFrequency) {
      const companionTypes: ('main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar')[] = [
        'main-sequence', 'red-giant', 'white-dwarf', 'neutron', 'magnetar', 'pulsar', 'quasar'
      ];
      const companionType = rng.choice(companionTypes);
      const binaryPlanets = generatePlanets(rng, companionType, `${i}-binary`);
      binaryCompanion = {
        starType: companionType,
        temperature: getStarTemperature(companionType, rng),
        mass: getStarMass(companionType, rng),
        planets: binaryPlanets
      };
      
      if (rng.next() < (trinaryFrequency / binaryFrequency)) {
        const trinaryType = rng.choice(companionTypes);
        const trinaryPlanets = generatePlanets(rng, trinaryType, `${i}-trinary`);
        trinaryCompanion = {
          starType: trinaryType,
          temperature: getStarTemperature(trinaryType, rng),
          mass: getStarMass(trinaryType, rng),
          planets: trinaryPlanets
        };
      }
    }
    
    starSystems.push({
      id: `system-${i}`,
      position,
      starType,
      temperature: getStarTemperature(starType, rng),
      mass: getStarMass(starType, rng),
      explored: false,
      planets,
      specialFeatures: generateSpecialFeatures(rng),
      binaryCompanion,
      trinaryCompanion
    });
  }

  // Generate additional black holes from numBlackHoles parameter (minus the central one)
  const additionalBlackHoles = numBlackHoles - 1; // Subtract the central black hole
  for (let i = 0; i < additionalBlackHoles; i++) {
    let position: [number, number, number];
    
    switch (galaxyType) {
      case 'spiral':
        position = generateSpiralPosition(rng, i, additionalBlackHoles, galaxyRadius * 0.8);
        break;
      case 'globular':
        position = generateGlobularPosition(rng, galaxyRadius * 0.6);
        break;
      default:
        position = generateSpiralPosition(rng, i, additionalBlackHoles, galaxyRadius * 0.8);
    }
    
    blackHoles.push({
      id: `blackhole-${i}`,
      position,
      mass: rng.range(10, 100), // Solar masses
      size: rng.range(1500, 3000), // Visual size
      starType: 'blackhole',
      temperature: 0,
      explored: false,
      planets: [],
      specialFeatures: []
    });
  }

  return {
    seed,
    starSystems,
    nebulae: [], // Empty nebulae array since we're replacing with black holes
    blackHoles,
    galacticCenter: [0, 0, 0],
    playerPosition: starSystems[0]?.position || [0, 0, 0],
    galaxyType
  };
}

function generateSpiralPosition(rng: SeededRandom, index: number, total: number, radius: number): [number, number, number] {
  const numArms = 4;
  const arm = Math.floor(index / (total / numArms));
  const armProgress = (index % (total / numArms)) / (total / numArms);
  
  const angle = (arm * (2 * Math.PI / numArms)) + (armProgress * Math.PI * 4);
  const distance = armProgress * radius + rng.range(-5000, 5000);
  
  const x = Math.cos(angle) * distance + rng.range(-2000, 2000);
  const z = Math.sin(angle) * distance + rng.range(-2000, 2000);
  const y = rng.range(-1000, 1000);
  
  return [x, y, z];
}

function generateBarredSpiralPosition(rng: SeededRandom, index: number, total: number, radius: number): [number, number, number] {
  const barLength = radius * 0.3;
  const barWidth = radius * 0.1;
  
  // 30% chance for bar region, 70% for spiral arms
  if (rng.next() < 0.3) {
    // Bar region
    const barProgress = rng.range(-1, 1);
    const x = barProgress * barLength + rng.range(-barWidth, barWidth);
    const z = rng.range(-barWidth, barWidth);
    const y = rng.range(-500, 500);
    return [x, y, z];
  } else {
    // Spiral arms starting from bar ends
    return generateSpiralPosition(rng, index, total, radius);
  }
}

function generateGlobularPosition(rng: SeededRandom, radius: number): [number, number, number] {
  // Spherical distribution with higher density toward center
  const distance = Math.pow(rng.next(), 0.5) * radius * 0.6;
  const theta = rng.range(0, Math.PI * 2);
  const phi = Math.acos(1 - 2 * rng.next());
  
  const x = distance * Math.sin(phi) * Math.cos(theta);
  const y = distance * Math.sin(phi) * Math.sin(theta);
  const z = distance * Math.cos(phi);
  
  return [x, y, z];
}

function generateEllipticalPosition(rng: SeededRandom, radius: number): [number, number, number] {
  // Elliptical distribution
  const distance = Math.pow(rng.next(), 0.7) * radius * 0.8;
  const angle = rng.range(0, Math.PI * 2);
  const height = rng.range(-radius * 0.2, radius * 0.2);
  
  const x = distance * Math.cos(angle);
  const z = distance * Math.sin(angle) * 0.6; // Flattened
  const y = height;
  
  return [x, y, z];
}

function generatePlanets(rng: SeededRandom, starType: StarSystem['starType'], starId: string): Planet[] {
  const numPlanets = Math.floor(rng.range(0, 12));
  const planets: Planet[] = [];
  
  for (let i = 0; i < numPlanets; i++) {
    const distance = (i + 1) * rng.range(50, 200);
    const angle = rng.next() * Math.PI * 2;
    const distanceFromStar = (i + 1) * rng.range(0.5, 3.0);
    
    const moons = generateMoons(rng, `${starId}-planet-${i}`);
    
    // Generate civilization with persistent market info
    const civilization = rng.next() < 0.05 ? generateCivilization(rng) : undefined;
    
    planets.push({
      id: `${starId}-planet-${i}`,
      name: generatePlanetName(rng),
      type: rng.choice(['terrestrial', 'gas-giant', 'ice-giant', 'asteroid-belt', 'dwarf-planet']),
      position: [
        Math.cos(angle) * distance,
        rng.range(-10, 10),
        Math.sin(angle) * distance
      ],
      radius: rng.range(0.5, 20),
      atmosphere: rng.choice(['none', 'thin', 'thick', 'toxic', 'breathable']),
      resources: generateResources(rng),
      inhabited: rng.next() < 0.1,
      civilization,
      distanceFromStar,
      moons: moons.length > 0 ? moons : undefined
    });
  }
  
  return planets;
}

function generateMoons(rng: SeededRandom, planetId: string): Moon[] {
  const numMoons = Math.floor(rng.range(0, 5));
  const moons: Moon[] = [];
  
  for (let i = 0; i < numMoons; i++) {
    moons.push({
      id: `${planetId}-moon-${i}`,
      name: generateMoonName(rng),
      type: rng.choice(['rocky', 'ice', 'metallic']),
      radius: rng.range(0.1, 2.0),
      distanceFromPlanet: (i + 1) * rng.range(2, 10)
    });
  }
  
  return moons;
}

function generateMoonName(rng: SeededRandom): string {
  const prefixes = ['Luna', 'Io', 'Titan', 'Europa', 'Ganymede', 'Callisto', 'Mimas', 'Enceladus'];
  const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return rng.choice(prefixes) + ' ' + rng.choice(suffixes);
}

function getStarTemperature(starType: StarSystem['starType'], rng: SeededRandom): number {
  const temps = {
    'main-sequence': [3000, 30000],
    'red-giant': [3000, 5000],
    'white-dwarf': [8000, 40000],
    'neutron': [600000, 1000000],
    'magnetar': [1000000, 10000000],
    'pulsar': [1000000, 1000000],
    'quasar': [10000000, 100000000]
  };
  const range = temps[starType] || [5000, 6000];
  return rng.range(range[0], range[1]);
}

function getStarMass(starType: StarSystem['starType'], rng: SeededRandom): number {
  const masses = {
    'main-sequence': [0.1, 50],
    'red-giant': [0.5, 8],
    'white-dwarf': [0.17, 1.33],
    'neutron': [1.4, 2],
    'magnetar': [1.4, 2],
    'pulsar': [1.4, 2],
    'quasar': [1000000, 10000000000]
  };
  const range = masses[starType] || [1, 1];
  return rng.range(range[0], range[1]);
}

function generateSpecialFeatures(rng: SeededRandom): string[] {
  const features = ['asteroid-field', 'ancient-ruins', 'space-station', 'wormhole', 'anomaly'];
  const numFeatures = Math.floor(rng.range(0, 3));
  const selected: string[] = [];
  
  for (let i = 0; i < numFeatures; i++) {
    const feature = rng.choice(features);
    if (!selected.includes(feature)) {
      selected.push(feature);
    }
  }
  
  return selected;
}

function generatePlanetName(rng: SeededRandom): string {
  const prefixes = ['Keth', 'Zeph', 'Vex', 'Nox', 'Quin', 'Bex', 'Taal', 'Rhen'];
  const suffixes = ['ara', 'ion', 'ius', 'eon', 'oth', 'ium', 'lex', 'nar'];
  return rng.choice(prefixes) + rng.choice(suffixes);
}

function generateResources(rng: SeededRandom): string[] {
  const resources = ['iron', 'titanium', 'platinum', 'rare-earth', 'energy-crystals', 'water', 'organics'];
  const numResources = Math.floor(rng.range(0, 4));
  const selected: string[] = [];
  
  for (let i = 0; i < numResources; i++) {
    const resource = rng.choice(resources);
    if (!selected.includes(resource)) {
      selected.push(resource);
    }
  }
  
  return selected;
}

function generateCivilization(rng: SeededRandom): Civilization {
  const names = ['Keplerians', 'Voidwalkers', 'Starborn', 'Cosmic Collective', 'Nexus Alliance'];
  const types: ('agronarian' | 'peacfolia' | 'mercantile' | 'unknown')[] = ['agronarian', 'peacfolia', 'mercantile', 'unknown'];
  const dispositions: ('hostile' | 'neutral' | 'friendly' | 'unknown')[] = ['hostile', 'neutral', 'friendly', 'unknown'];
  
  const techLevel = Math.floor(rng.range(1, 10));
  
  return {
    name: rng.choice(names),
    type: rng.choice(types),
    techLevel,
    disposition: rng.choice(dispositions),
    tradeGoods: generateResources(rng),
    hasMarket: techLevel >= 2, // Markets available at tech level 2+
    hasRepair: techLevel >= 3  // Repair facilities at tech level 3+
  };
}
