export interface StarshipStats {
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

const shipClasses = [
  'Explorer', 'Cruiser', 'Destroyer', 'Frigate', 'Battleship', 'Scout',
  'Research', 'Diplomatic', 'Cargo', 'Colony'
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

function generateStats(seed: number): StarshipStats {
  let currentSeed = seed;
  
  // Base stats
  const techLevel = Math.floor(seededRandom(currentSeed++) * 6) + 3; // 3-8
  const maxShields = 100;
  const maxHull = 100;
  const maxCombatPower = 100;
  const maxScanners = 100;
  const maxCargo = 1000;
  const maxCrew = Math.floor(seededRandom(currentSeed++) * 50) + 50; // 50-100 crew capacity
  
  // Current values
  const shields = Math.floor(seededRandom(currentSeed++) * 60) + 30; // 30-90
  const hull = Math.floor(seededRandom(currentSeed++) * 60) + 40; // 40-100
  const combatPower = Math.floor(seededRandom(currentSeed++) * 70) + 20; // 20-90
  const diplomacy = Math.floor(seededRandom(currentSeed++) * 80) + 10; // 10-90
  const scanners = Math.floor(seededRandom(currentSeed++) * 70) + 25; // 25-95
  const cargo = Math.floor(seededRandom(currentSeed++) * 600) + 200; // 200-800
  const credits = Math.floor(seededRandom(currentSeed++) * 5000) + 1000; // 1000-6000
  const crew = Math.floor(maxCrew * 0.8); // Start with 80% of max crew
  
  return {
    techLevel,
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

export function generateStarship(seed: number): Starship {
  let currentSeed = seed;
  
  const nameIndex = Math.floor(seededRandom(currentSeed++) * shipNames.length);
  const classIndex = Math.floor(seededRandom(currentSeed++) * shipClasses.length);
  
  return {
    name: shipNames[nameIndex],
    class: shipClasses[classIndex],
    stats: generateStats(currentSeed),
    layout: generateLayout(currentSeed + 1000)
  };
}