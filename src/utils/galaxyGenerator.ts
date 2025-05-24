
export interface StarSystem {
  id: string;
  position: [number, number, number];
  starType: 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron' | 'magnetar' | 'pulsar' | 'quasar';
  temperature: number;
  mass: number;
  explored: boolean;
  planets: Planet[];
  specialFeatures: string[];
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

  // Generate star systems in a spiral galaxy pattern
  const numSystems = 1000;
  const numArms = 4;
  
  for (let i = 0; i < numSystems; i++) {
    const arm = Math.floor(i / (numSystems / numArms));
    const armProgress = (i % (numSystems / numArms)) / (numSystems / numArms);
    
    // Spiral arm calculation
    const angle = (arm * (2 * Math.PI / numArms)) + (armProgress * Math.PI * 4);
    const distance = armProgress * galaxyRadius + rng.range(-5000, 5000);
    
    const x = Math.cos(angle) * distance + rng.range(-2000, 2000);
    const z = Math.sin(angle) * distance + rng.range(-2000, 2000);
    const y = rng.range(-1000, 1000); // Galaxy thickness
    
    const starType = rng.choice([
      'main-sequence', 'main-sequence', 'main-sequence', 'main-sequence',
      'red-giant', 'white-dwarf', 'neutron', 'magnetar', 'pulsar', 'quasar'
    ]);
    
    const planets = generatePlanets(rng, starType);
    
    starSystems.push({
      id: `system-${i}`,
      position: [x, y, z],
      starType,
      temperature: getStarTemperature(starType, rng),
      mass: getStarMass(starType, rng),
      explored: false,
      planets,
      specialFeatures: generateSpecialFeatures(rng)
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
    playerPosition: starSystems[0]?.position || [0, 0, 0]
  };
}

function generatePlanets(rng: SeededRandom, starType: string): Planet[] {
  const numPlanets = Math.floor(rng.range(0, 12));
  const planets: Planet[] = [];
  
  for (let i = 0; i < numPlanets; i++) {
    const distance = (i + 1) * rng.range(50, 200);
    const angle = rng.next() * Math.PI * 2;
    
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
      civilization: rng.next() < 0.05 ? generateCivilization(rng) : undefined
    });
  }
  
  return planets;
}

function getStarTemperature(starType: string, rng: SeededRandom): number {
  const temps = {
    'main-sequence': [3000, 30000],
    'red-giant': [3000, 5000],
    'white-dwarf': [8000, 40000],
    'neutron': [600000, 1000000],
    'magnetar': [1000000, 10000000],
    'pulsar': [1000000, 1000000],
    'quasar': [10000000, 100000000]
  };
  const range = temps[starType as keyof typeof temps] || [5000, 6000];
  return rng.range(range[0], range[1]);
}

function getStarMass(starType: string, rng: SeededRandom): number {
  const masses = {
    'main-sequence': [0.1, 50],
    'red-giant': [0.5, 8],
    'white-dwarf': [0.17, 1.33],
    'neutron': [1.4, 2],
    'magnetar': [1.4, 2],
    'pulsar': [1.4, 2],
    'quasar': [1000000, 10000000000]
  };
  const range = masses[starType as keyof typeof masses] || [1, 1];
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
