export interface StarSystem {
  id: string;
  position: [number, number, number];
  starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar';
  temperature: number;
  mass: number;
  explored: boolean;
  planets: Planet[];
  specialFeatures: string[];
  binaryCompanion?: {
    starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar';
    temperature: number;
    mass: number;
  };
  trinaryCompanion?: {
    starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar';
    temperature: number;
    mass: number;
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
}

export interface Nebula {
  id: string;
  position: [number, number, number];
  size: number;
  type: 'emission' | 'reflection' | 'dark' | 'planetary';
  color: string;
}

export interface Galaxy {
  seed: number;
  starSystems: StarSystem[];
  nebulae: Nebula[];
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

export function generateGalaxy(seed: number): Galaxy {
  const rng = new SeededRandom(seed);
  const galaxyRadius = 50000; // Light years
  const starSystems: StarSystem[] = [];
  const nebulae: Nebula[] = [];
  
  // Choose galaxy type with proper typing
  const galaxyTypes: Galaxy['galaxyType'][] = ['spiral', 'barred-spiral', 'globular', 'elliptical'];
  const galaxyType = rng.choice(galaxyTypes);

  // Generate star systems based on galaxy type
  const numSystems = 1000;
  
  // Define star types with proper typing
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
      case 'barred-spiral':
        position = generateBarredSpiralPosition(rng, i, numSystems, galaxyRadius);
        break;
      case 'globular':
        position = generateGlobularPosition(rng, galaxyRadius);
        break;
      case 'elliptical':
        position = generateEllipticalPosition(rng, galaxyRadius);
        break;
      default:
        position = generateSpiralPosition(rng, i, numSystems, galaxyRadius);
    }
    
    const starType = rng.choice(starTypes);
    const planets = generatePlanets(rng, starType);
    
    // Generate binary/trinary companions (15% chance for binary, 3% for trinary)
    let binaryCompanion: StarSystem['binaryCompanion'] = undefined;
    let trinaryCompanion: StarSystem['trinaryCompanion'] = undefined;
    
    if (rng.next() < 0.15) { // 15% chance for binary
      const companionType = rng.choice(starTypes);
      binaryCompanion = {
        starType: companionType,
        temperature: getStarTemperature(companionType, rng),
        mass: getStarMass(companionType, rng)
      };
      
      if (rng.next() < 0.2) { // 20% of binary systems have a third star
        const trinaryType = rng.choice(starTypes);
        trinaryCompanion = {
          starType: trinaryType,
          temperature: getStarTemperature(trinaryType, rng),
          mass: getStarMass(trinaryType, rng)
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

  // Generate nebulae
  const numNebulae = 50;
  for (let i = 0; i < numNebulae; i++) {
    const angle = rng.next() * Math.PI * 2;
    const distance = rng.range(5000, galaxyRadius * 0.8);
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = rng.range(-500, 500);
    
    nebulae.push({
      id: `nebula-${i}`,
      position: [x, y, z],
      size: rng.range(1000, 5000),
      type: rng.choice(['emission', 'reflection', 'dark', 'planetary']),
      color: rng.choice(['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'])
    });
  }

  return {
    seed,
    starSystems,
    nebulae,
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

function generatePlanets(rng: SeededRandom, starType: StarSystem['starType']): Planet[] {
  const numPlanets = Math.floor(rng.range(0, 12));
  const planets: Planet[] = [];
  
  for (let i = 0; i < numPlanets; i++) {
    const distance = (i + 1) * rng.range(50, 200);
    const angle = rng.next() * Math.PI * 2;
    const distanceFromStar = (i + 1) * rng.range(0.5, 3.0);
    
    const moons = generateMoons(rng);
    
    planets.push({
      id: `planet-${i}`,
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
      civilization: rng.next() < 0.05 ? generateCivilization(rng) : undefined,
      distanceFromStar,
      moons: moons.length > 0 ? moons : undefined
    });
  }
  
  return planets;
}

function generateMoons(rng: SeededRandom): Moon[] {
  const numMoons = Math.floor(rng.range(0, 5));
  const moons: Moon[] = [];
  
  for (let i = 0; i < numMoons; i++) {
    moons.push({
      id: `moon-${i}`,
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
  
  return {
    name: rng.choice(names),
    type: rng.choice(types),
    techLevel: Math.floor(rng.range(1, 10)),
    disposition: rng.choice(dispositions),
    tradeGoods: generateResources(rng)
  };
}
