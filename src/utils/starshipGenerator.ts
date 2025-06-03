export interface StarshipStats {
  name?: string;
  techLevel: number;
  shields: number;
  hull: number;
  combatPower: number;
  diplomacy: number;
  scanners: number;
  cargo: number;
  credits: number;
  crew: number;
  maxCrew: number;
  maxShields: number;
  maxHull: number;
  maxCombatPower: number;
  maxScanners: number;
  maxCargo: number;
}

export interface Room {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StarshipLayout {
  hullPath: string;
  rooms: Room[];
}

export interface Starship {
  name: string;
  class: string;
  stats: StarshipStats;
  layout: StarshipLayout;
}

const shipNames = [
  'Enterprise', 'Voyager', 'Discovery', 'Defiant', 'Prometheus', 'Intrepid',
  'Constitution', 'Galaxy', 'Sovereign', 'Nebula', 'Excelsior', 'Miranda',
  'Phoenix', 'Orion', 'Andromeda', 'Pegasus', 'Titan', 'Apollo'
];

interface ShipClassConfig {
  name: string;
  description: string;
  statModifiers: {
    combatPower: number;
    diplomacy: number;
    scanners: number;
    cargo: number;
    maxCrew: number;
    shields: number;
    hull: number;
  };
}

const shipClasses: ShipClassConfig[] = [
  {
    name: 'Explorer',
    description: 'Balanced ship designed for long-range exploration',
    statModifiers: { combatPower: 0, diplomacy: 10, scanners: 20, cargo: 5, maxCrew: 10, shields: 0, hull: 5 }
  },
  {
    name: 'Cruiser',
    description: 'Well-rounded vessel suitable for any mission',
    statModifiers: { combatPower: 5, diplomacy: 5, scanners: 5, cargo: 5, maxCrew: 5, shields: 5, hull: 5 }
  },
  {
    name: 'Destroyer',
    description: 'Combat-focused warship with heavy firepower',
    statModifiers: { combatPower: 25, diplomacy: -10, scanners: -5, cargo: -10, maxCrew: 0, shields: 10, hull: 15 }
  },
  {
    name: 'Frigate',
    description: 'Fast and maneuverable patrol vessel',
    statModifiers: { combatPower: 10, diplomacy: 0, scanners: 10, cargo: -5, maxCrew: -5, shields: 5, hull: 0 }
  },
  {
    name: 'Battleship',
    description: 'Heavily armored fortress with maximum firepower',
    statModifiers: { combatPower: 30, diplomacy: -15, scanners: -10, cargo: -15, maxCrew: 15, shields: 20, hull: 25 }
  },
  {
    name: 'Scout',
    description: 'Small, fast ship optimized for reconnaissance',
    statModifiers: { combatPower: -10, diplomacy: 5, scanners: 25, cargo: -15, maxCrew: -15, shields: -5, hull: -10 }
  },
  {
    name: 'Research',
    description: 'Scientific vessel equipped with advanced sensors',
    statModifiers: { combatPower: -15, diplomacy: 15, scanners: 30, cargo: 0, maxCrew: 5, shields: -5, hull: -5 }
  },
  {
    name: 'Diplomatic',
    description: 'Luxury vessel designed for negotiations and trade',
    statModifiers: { combatPower: -20, diplomacy: 35, scanners: 0, cargo: 10, maxCrew: 10, shields: 0, hull: 0 }
  },
  {
    name: 'Cargo',
    description: 'Merchant freighter with massive storage capacity',
    statModifiers: { combatPower: -15, diplomacy: 10, scanners: -5, cargo: 40, maxCrew: 0, shields: -10, hull: 5 }
  },
  {
    name: 'Colony',
    description: 'Transport ship designed for colonization missions',
    statModifiers: { combatPower: -10, diplomacy: 20, scanners: 5, cargo: 20, maxCrew: 25, shields: 0, hull: 10 }
  }
];

const roomTypes = [
  { type: 'bridge', name: 'Bridge', minSize: { width: 30, height: 20 } },
  { type: 'engine', name: 'Engine', minSize: { width: 25, height: 25 } },
  { type: 'weapons', name: 'Weapons', minSize: { width: 20, height: 15 } },
  { type: 'shields', name: 'Shields', minSize: { width: 20, height: 15 } },
  { type: 'cargo', name: 'Cargo', minSize: { width: 30, height: 20 } },
  { type: 'quarters', name: 'Quarters', minSize: { width: 25, height: 15 } },
  { type: 'medical', name: 'Medical', minSize: { width: 20, height: 15 } },
  { type: 'science', name: 'Science', minSize: { width: 25, height: 20 } }
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStats(seed: number, shipName: string, shipClass: ShipClassConfig): StarshipStats {
  let currentSeed = seed;
  
  // Base stats
  const baseTechLevel = Math.floor(seededRandom(currentSeed++) * 6) + 3; // 3-8
  const baseMaxShields = 100;
  const baseMaxHull = 100;
  const baseMaxCombatPower = 100;
  const baseMaxScanners = 100;
  const baseMaxCargo = 1000;
  const baseMaxCrew = Math.floor(seededRandom(currentSeed++) * 50) + 50; // 50-100 crew capacity
  
  // Apply class modifiers
  const maxShields = Math.max(50, baseMaxShields + shipClass.statModifiers.shields);
  const maxHull = Math.max(50, baseMaxHull + shipClass.statModifiers.hull);
  const maxCombatPower = Math.max(20, baseMaxCombatPower + shipClass.statModifiers.combatPower);
  const maxScanners = Math.max(50, baseMaxScanners);
  const maxCargo = Math.max(200, baseMaxCargo + shipClass.statModifiers.cargo);
  const maxCrew = Math.max(20, baseMaxCrew + shipClass.statModifiers.maxCrew);
  
  // Current values (start at 70-90% of max)
  const shields = Math.floor(maxShields * (0.7 + seededRandom(currentSeed++) * 0.2));
  const hull = Math.floor(maxHull * (0.7 + seededRandom(currentSeed++) * 0.2));
  const combatPower = Math.floor(maxCombatPower * (0.7 + seededRandom(currentSeed++) * 0.2));
  const baseDiplomacy = Math.floor(seededRandom(currentSeed++) * 80) + 10; // 10-90
  const diplomacy = Math.max(5, baseDiplomacy + shipClass.statModifiers.diplomacy);
  const baseScanners = Math.floor(maxScanners * (0.7 + seededRandom(currentSeed++) * 0.2));
  const scanners = Math.max(25, baseScanners + shipClass.statModifiers.scanners);
  const cargo = Math.floor(maxCargo * (0.3 + seededRandom(currentSeed++) * 0.4)); // 30-70% of max
  const credits = Math.floor(seededRandom(currentSeed++) * 5000) + 1000; // 1000-6000
  const crew = Math.floor(maxCrew * 0.8); // Start with 80% of max crew
  
  return {
    name: shipName,
    techLevel: baseTechLevel,
    shields,
    hull,
    combatPower,
    diplomacy,
    scanners,
    cargo,
    credits,
    crew,
    maxCrew,
    maxShields,
    maxHull,
    maxCombatPower,
    maxScanners,
    maxCargo
  };
}

function generateLayout(seed: number): StarshipLayout {
  let currentSeed = seed;
  
  // Generate hull shape - elongated ship
  const hullPath = "M50,150 Q50,100 100,80 L300,70 Q350,80 380,120 Q390,150 380,180 Q350,220 300,230 L100,220 Q50,200 50,150 Z";
  
  const rooms: Room[] = [];
  const usedPositions: { x: number; y: number; width: number; height: number }[] = [];
  
  // Helper function to check if a position overlaps with existing rooms
  const isOverlapping = (x: number, y: number, width: number, height: number) => {
    return usedPositions.some(pos => 
      x < pos.x + pos.width && x + width > pos.x &&
      y < pos.y + pos.height && y + height > pos.y
    );
  };
  
  // Place bridge at the front
  const bridgeRoom = {
    name: 'Bridge',
    type: 'bridge',
    x: 320,
    y: 130,
    width: 40,
    height: 25
  };
  rooms.push(bridgeRoom);
  usedPositions.push(bridgeRoom);
  
  // Place engine at the back
  const engineRoom = {
    name: 'Engine',
    type: 'engine',
    x: 60,
    y: 125,
    width: 35,
    height: 30
  };
  rooms.push(engineRoom);
  usedPositions.push(engineRoom);
  
  // Place other rooms randomly
  const remainingRooms = roomTypes.filter(r => r.type !== 'bridge' && r.type !== 'engine');
  
  for (const roomType of remainingRooms) {
    let attempts = 0;
    let placed = false;
    
    while (!placed && attempts < 50) {
      const x = Math.floor(seededRandom(currentSeed++) * 250) + 100;
      const y = Math.floor(seededRandom(currentSeed++) * 120) + 90;
      const width = roomType.minSize.width + Math.floor(seededRandom(currentSeed++) * 15);
      const height = roomType.minSize.height + Math.floor(seededRandom(currentSeed++) * 10);
      
      if (!isOverlapping(x, y, width, height) && 
          x + width < 320 && y + height < 210 && 
          x > 95 && y > 85) {
        rooms.push({
          name: roomType.name,
          type: roomType.type,
          x,
          y,
          width,
          height
        });
        usedPositions.push({ x, y, width, height });
        placed = true;
      }
      
      attempts++;
    }
  }
  
  return {
    hullPath,
    rooms
  };
}

export function generateStarship(seed: number, shipClassIndex?: number): Starship {
  let currentSeed = seed;
  
  const nameIndex = Math.floor(seededRandom(currentSeed++) * shipNames.length);
  const classIndex = shipClassIndex !== undefined ? shipClassIndex : Math.floor(seededRandom(currentSeed++) * shipClasses.length);
  const shipName = shipNames[nameIndex];
  const shipClass = shipClasses[classIndex];
  
  return {
    name: shipName,
    class: shipClass.name,
    stats: generateStats(currentSeed, shipName, shipClass),
    layout: generateLayout(currentSeed + 1000)
  };
}

export function generateShipOptions(seed: number, count: number = 3): Starship[] {
  const options: Starship[] = [];
  let currentSeed = seed;
  
  for (let i = 0; i < count; i++) {
    // Ensure we get different classes by using different class indices
    const classIndex = Math.floor(seededRandom(currentSeed++) * shipClasses.length);
    const shipSeed = Math.floor(seededRandom(currentSeed++) * 1000000);
    options.push(generateStarship(shipSeed, classIndex));
  }
  
  return options;
}

export { shipClasses };
