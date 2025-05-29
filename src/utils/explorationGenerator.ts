
import { StarSystem, Planet, Moon } from './galaxyGenerator';
import { ExplorationEvent } from '../components/galaxy/ExplorationDialog';

export interface MarketLocation {
  type: 'civilization' | 'station' | 'merchant';
  techLevel: number;
  hasRepair: boolean;
  hasMarket: boolean;
}

export const generateExplorationEvent = (system: StarSystem): ExplorationEvent => {
  // Get all celestial bodies in the system
  const allBodies: (Planet | Moon)[] = [];
  
  // Add planets from primary star
  allBodies.push(...system.planets);
  
  // Add planets from binary companion
  if (system.binaryCompanion) {
    allBodies.push(...system.binaryCompanion.planets);
  }
  
  // Add planets from trinary companion
  if (system.trinaryCompanion) {
    allBodies.push(...system.trinaryCompanion.planets);
  }
  
  // Add moons from all planets
  system.planets.forEach(planet => {
    if (planet.moons) {
      allBodies.push(...planet.moons);
    }
  });
  
  if (system.binaryCompanion) {
    system.binaryCompanion.planets.forEach(planet => {
      if (planet.moons) {
        allBodies.push(...planet.moons);
      }
    });
  }
  
  if (system.trinaryCompanion) {
    system.trinaryCompanion.planets.forEach(planet => {
      if (planet.moons) {
        allBodies.push(...planet.moons);
      }
    });
  }
  
  if (allBodies.length === 0) {
    // Chance for space-based encounters (merchant ships, derelicts)
    const spaceEncounters = ['merchant', 'derelict', 'empty'];
    const encounterType = spaceEncounters[Math.floor(Math.random() * spaceEncounters.length)];
    
    if (encounterType === 'merchant') {
      return {
        type: 'market',
        title: 'Merchant Vessel Encountered',
        description: 'Long-range sensors detect a merchant vessel operating in this system. They are willing to trade goods and offer limited ship upgrades.',
        body: {
          id: 'merchant-ship',
          name: 'Merchant Vessel',
          type: 'merchant',
          radius: 0
        } as any,
        rewards: ['Trade Opportunity', 'Ship Upgrades'],
        marketInfo: {
          type: 'merchant',
          techLevel: Math.floor(Math.random() * 5) + 3,
          hasRepair: Math.random() > 0.7,
          hasMarket: true
        }
      };
    }
    
    return {
      type: 'empty',
      title: 'System Survey Complete',
      description: 'Deep space scans reveal no significant celestial bodies in this system. Only stellar radiation and cosmic dust detected.',
      body: {
        id: 'space',
        name: 'Deep Space',
        type: 'void',
        radius: 0
      } as any,
      rewards: ['Survey Data']
    };
  }
  
  // Select random body
  const randomBody = allBodies[Math.floor(Math.random() * allBodies.length)];
  
  // Generate event based on body type and random chance
  const eventTypes = ['discovery', 'resources', 'civilization', 'artifact', 'combat', 'danger', 'market', 'empty'];
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as ExplorationEvent['type'];
  
  return generateEventByType(randomType, randomBody);
};

const generateEventByType = (type: ExplorationEvent['type'], body: Planet | Moon): ExplorationEvent => {
  const isInhabited = 'inhabited' in body && body.inhabited;
  const bodyType = body.type;
  
  switch (type) {
    case 'discovery':
      return {
        type: 'discovery',
        title: 'Scientific Discovery',
        description: `Exploration teams have made a remarkable scientific discovery on ${body.name}. ${getDiscoveryDescription(bodyType)}`,
        body,
        rewards: ['Scientific Data', 'Research Points', 'Discovery Credits']
      };
      
    case 'resources':
      return {
        type: 'resources',
        title: 'Resource Discovery',
        description: `Mining surveys on ${body.name} have revealed valuable resource deposits. ${getResourceDescription(bodyType)}`,
        body,
        rewards: ['Mineral Resources', 'Mining Rights', 'Economic Data']
      };
      
    case 'civilization':
      if (isInhabited) {
        return {
          type: 'civilization',
          title: 'First Contact',
          description: `Diplomatic teams have established contact with the civilization on ${body.name}. Cultural exchange protocols are being established.`,
          body,
          rewards: ['Diplomatic Relations', 'Cultural Data', 'Technology Exchange'],
          marketInfo: {
            type: 'civilization',
            techLevel: Math.floor(Math.random() * 8) + 2,
            hasRepair: Math.random() > 0.3,
            hasMarket: Math.random() > 0.2
          }
        };
      } else {
        return {
          type: 'civilization',
          title: 'Ancient Ruins',
          description: `Archaeological teams have discovered ruins of an ancient civilization on ${body.name}. The structures appear to be millions of years old.`,
          body,
          rewards: ['Archaeological Data', 'Ancient Technology', 'Historical Records']
        };
      }
      
    case 'artifact':
      return {
        type: 'artifact',
        title: 'Mysterious Artifact',
        description: `Survey teams have located an artifact of unknown origin on ${body.name}. Its purpose and creators remain a mystery, but it emanates strange energy signatures.`,
        body,
        rewards: ['Alien Artifact', 'Energy Readings', 'Research Opportunity']
      };

    case 'combat':
      return {
        type: 'combat',
        title: 'Hostile Encounter',
        description: `Exploration teams have encountered hostile forces on ${body.name}. ${getCombatDescription(bodyType)} Engagement protocols are in effect.`,
        body,
        rewards: ['Salvage', 'Combat Experience', 'Territory Control'],
        consequences: ['Equipment Damage', 'Crew Injuries', 'Resource Loss']
      };

    case 'market':
      const marketType = isInhabited ? 'civilization' : 'station';
      return {
        type: 'market',
        title: marketType === 'civilization' ? 'Trading Hub Discovered' : 'Space Station Located',
        description: `${marketType === 'civilization' ? 'A bustling trading center' : 'An orbital space station'} on ${body.name} offers extensive trading opportunities and ship upgrade services.`,
        body,
        rewards: ['Trade Opportunities', 'Ship Upgrades', 'Market Access'],
        marketInfo: {
          type: marketType,
          techLevel: Math.floor(Math.random() * 6) + 4,
          hasRepair: true,
          hasMarket: true
        }
      };
      
    case 'danger':
      return {
        type: 'danger',
        title: 'Exploration Hazard',
        description: `Exploration teams encountered unexpected dangers on ${body.name}. ${getDangerDescription(bodyType)} Mission protocols require immediate evacuation.`,
        body,
        consequences: ['Equipment Loss', 'Team Injuries', 'Mission Delay']
      };
      
    case 'empty':
    default:
      return {
        type: 'empty',
        title: 'Routine Survey',
        description: `Comprehensive scans of ${body.name} completed successfully. No unusual findings detected, but valuable baseline data has been collected for future reference.`,
        body,
        rewards: ['Survey Data']
      };
  }
};

const getDiscoveryDescription = (bodyType: string): string => {
  const discoveries = {
    'terrestrial': 'Unique geological formations suggest this world has experienced extraordinary tectonic activity.',
    'gas-giant': 'Atmospheric analysis reveals previously unknown chemical compounds in the upper atmosphere.',
    'ice-giant': 'Deep ice core samples contain microscopic organisms that challenge our understanding of extremophile life.',
    'rocky': 'Mineral composition analysis indicates this body formed under highly unusual stellar conditions.',
    'metallic': 'Magnetic field readings suggest an exotic core composition unlike any previously catalogued.',
    'ice': 'Subsurface ocean detected beneath the ice shell, with thermal vents potentially supporting life.',
  };
  return discoveries[bodyType] || 'Anomalous readings detected that require further investigation.';
};

const getResourceDescription = (bodyType: string): string => {
  const resources = {
    'terrestrial': 'Rich deposits of rare earth elements have been identified in multiple locations.',
    'gas-giant': 'Atmospheric processors could extract valuable gases from the dense atmosphere.',
    'ice-giant': 'Abundant water ice and frozen hydrocarbons detected throughout the planetary structure.',
    'rocky': 'Dense concentrations of metallic ores embedded within the rocky crust.',
    'metallic': 'Extremely pure metal deposits with minimal refining requirements.',
    'ice': 'Pure water ice reserves could support long-term colonization efforts.',
  };
  return resources[bodyType] || 'Valuable materials detected suitable for industrial extraction.';
};

const getCombatDescription = (bodyType: string): string => {
  const combat = {
    'terrestrial': 'Hostile ground forces have established defensive positions across the planetary surface.',
    'gas-giant': 'Aggressive aerial units patrol the upper atmosphere, challenging our survey craft.',
    'ice-giant': 'Automated defense systems embedded in the ice respond to our presence with hostility.',
    'rocky': 'Entrenched hostile forces use the rocky terrain to their tactical advantage.',
    'metallic': 'Heavily armored opponents exploit the metallic environment for enhanced protection.',
    'ice': 'Swift-moving hostiles use the icy conditions to launch surprise attacks.',
  };
  return combat[bodyType] || 'Unknown hostile entities have detected our presence and are responding aggressively.';
};

const getDangerDescription = (bodyType: string): string => {
  const dangers = {
    'terrestrial': 'Seismic activity triggered landslides that nearly trapped the exploration team.',
    'gas-giant': 'Violent atmospheric storms damaged survey equipment and threatened team safety.',
    'ice-giant': 'Sudden ice quakes caused surface fractures, creating hazardous terrain.',
    'rocky': 'Unstable surface conditions and rockfall events pose ongoing safety risks.',
    'metallic': 'Intense electromagnetic fields interfered with equipment and communications.',
    'ice': 'Thin ice layers over deep crevasses created treacherous exploration conditions.',
  };
  return dangers[bodyType] || 'Unexpected environmental hazards posed significant risks to the exploration team.';
};

export const getSystemMarketInfo = (system: StarSystem): MarketLocation | null => {
  // Check if system has inhabited planets or stations
  const allPlanets = [
    ...system.planets,
    ...(system.binaryCompanion?.planets || []),
    ...(system.trinaryCompanion?.planets || [])
  ];
  
  const inhabitedPlanet = allPlanets.find(planet => 'inhabited' in planet && planet.inhabited);
  if (inhabitedPlanet) {
    return {
      type: 'civilization',
      techLevel: Math.floor(Math.random() * 8) + 2,
      hasRepair: Math.random() > 0.3,
      hasMarket: Math.random() > 0.2
    };
  }
  
  // Random chance for space stations or merchant activity
  if (Math.random() > 0.7) {
    return {
      type: Math.random() > 0.5 ? 'station' : 'merchant',
      techLevel: Math.floor(Math.random() * 6) + 3,
      hasRepair: Math.random() > 0.5,
      hasMarket: true
    };
  }
  
  return null;
};
