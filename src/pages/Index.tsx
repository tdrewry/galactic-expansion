import React, { useState } from 'react';
import { GalaxyMap } from '../components/GalaxyMap';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { SystemView } from '../components/galaxy/SystemView';
import { GalaxySettings } from '../components/galaxy/GalaxySettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [galaxySeed, setGalaxySeed] = useState(12345);
  const [inputSeed, setInputSeed] = useState('12345');
  const [numSystems, setNumSystems] = useState(1000);
  const [numNebulae, setNumNebulae] = useState(50);
  const [binaryFrequency, setBinaryFrequency] = useState(0.15);
  const [trinaryFrequency, setTriinaryFrequency] = useState(0.03);
  const [raymarchingSamples, setRaymarchingSamples] = useState(8);
  const [minimumVisibility, setMinimumVisibility] = useState(0.1);
  const [showDustLanes, setShowDustLanes] = useState(true);
  const [showStarFormingRegions, setShowStarFormingRegions] = useState(false);
  const [showCosmicDust, setShowCosmicDust] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [selectedStar, setSelectedStar] = useState<'primary' | 'binary' | 'trinary'>('primary');
  const [selectedBody, setSelectedBody] = useState<Planet | Moon | null>(null);

  const handleSeedChange = () => {
    const newSeed = parseInt(inputSeed) || 12345;
    setGalaxySeed(newSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999) + 1;
    setInputSeed(randomSeed.toString());
    setGalaxySeed(randomSeed);
    setSelectedSystem(null);
    setSelectedBody(null);
  };

  const handleSettingsChange = (settings: {
    numSystems: number;
    numNebulae: number;
    binaryFrequency: number;
    trinaryFrequency: number;
    raymarchingSamples?: number;
    minimumVisibility?: number;
    showDustLanes?: boolean;
    showStarFormingRegions?: boolean;
    showCosmicDust?: boolean;
  }) => {
    setNumSystems(settings.numSystems);
    setNumNebulae(settings.numNebulae);
    setBinaryFrequency(settings.binaryFrequency);
    setTriinaryFrequency(settings.trinaryFrequency);
    if (settings.raymarchingSamples !== undefined) {
      setRaymarchingSamples(settings.raymarchingSamples);
    }
    if (settings.minimumVisibility !== undefined) {
      setMinimumVisibility(settings.minimumVisibility);
    }
    if (settings.showDustLanes !== undefined) {
      setShowDustLanes(settings.showDustLanes);
    }
    if (settings.showStarFormingRegions !== undefined) {
      setShowStarFormingRegions(settings.showStarFormingRegions);
    }
    if (settings.showCosmicDust !== undefined) {
      setShowCosmicDust(settings.showCosmicDust);
    }
    
    setSelectedSystem(null);
    setSelectedBody(null);
  };

  const handleSystemSelect = (system: StarSystem) => {
    console.log('Index: System selected:', system.id);
    setSelectedSystem(system);
    setSelectedStar('primary');
    setSelectedBody(null);
  };

  const handleStarSelect = (star: 'primary' | 'binary' | 'trinary') => {
    console.log('Index: Star selected:', star);
    setSelectedStar(star);
    setSelectedBody(null);
  };

  const handleBodySelect = (body: Planet | Moon | null) => {
    console.log('Index: Body selected:', body?.name || 'none');
    setSelectedBody(body);
  };

  const getTotalPlanets = (system: StarSystem) => {
    let total = system.planets.length;
    if (system.binaryCompanion) {
      total += system.binaryCompanion.planets.length;
    }
    if (system.trinaryCompanion) {
      total += system.trinaryCompanion.planets.length;
    }
    return total;
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <header className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Stardust Voyager Fleet</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={inputSeed}
                onChange={(e) => setInputSeed(e.target.value)}
                className="w-24 bg-gray-800 border-gray-600 text-white"
                placeholder="Seed"
              />
              <Button onClick={handleSeedChange} variant="secondary" size="sm">
                Load Galaxy
              </Button>
              <Button onClick={generateRandomSeed} variant="secondary" size="sm">
                Random
              </Button>
              <GalaxySettings
                numSystems={numSystems}
                numNebulae={numNebulae}
                binaryFrequency={binaryFrequency}
                trinaryFrequency={trinaryFrequency}
                raymarchingSamples={raymarchingSamples}
                minimumVisibility={minimumVisibility}
                showDustLanes={showDustLanes}
                showStarFormingRegions={showStarFormingRegions}
                showCosmicDust={showCosmicDust}
                onSettingsChange={handleSettingsChange}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="h-full">
              <GalaxyMap 
                seed={galaxySeed} 
                numSystems={numSystems}
                numNebulae={numNebulae}
                binaryFrequency={binaryFrequency}
                trinaryFrequency={trinaryFrequency}
                raymarchingSamples={raymarchingSamples}
                minimumVisibility={minimumVisibility}
                showDustLanes={showDustLanes}
                showStarFormingRegions={showStarFormingRegions}
                showCosmicDust={showCosmicDust}
                onSystemSelect={handleSystemSelect}
                selectedSystem={selectedSystem}
                selectedStar={selectedStar}
                onStarSelect={handleStarSelect}
              />
            </div>
          </ResizablePanel>

          {selectedSystem && (
            <>
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <div className="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
                  <div className="flex-shrink-0 p-4 border-b border-gray-600">
                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">{selectedSystem.id}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-gray-300 space-y-3">
                        <div>
                          <strong>Star Classification:</strong> {selectedSystem.starType}
                        </div>
                        <div>
                          <strong>Temperature:</strong> {Math.round(selectedSystem.temperature).toLocaleString()}K
                        </div>
                        <div>
                          <strong>Mass:</strong> {selectedSystem.mass.toFixed(2)} solar masses
                        </div>
                        <div>
                          <strong>Total Planets:</strong> {getTotalPlanets(selectedSystem)}
                        </div>
                        <div>
                          <strong>Status:</strong> {selectedSystem.explored ? 'Explored' : 'Unexplored'}
                        </div>
                        
                        {selectedSystem.specialFeatures.length > 0 && (
                          <div>
                            <strong>Special Features:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {selectedSystem.specialFeatures.map((feature, index) => (
                                <li key={index} className="capitalize">{feature.replace('-', ' ')}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-600">
                          <Button className="w-full" disabled={selectedSystem.explored}>
                            {selectedSystem.explored ? 'Already Explored' : 'Begin Exploration'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <SystemView 
                        system={selectedSystem} 
                        selectedStar={selectedStar}
                        onBodySelect={handleBodySelect}
                      />
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400 flex-shrink-0">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Systems: {numSystems} | Nebulae: {numNebulae} | Binary: {Math.round(binaryFrequency * 100)}% | Trinary: {Math.round(trinaryFrequency * 100)}% | Raymarching: {raymarchingSamples} samples | Click and drag to navigate, scroll to zoom</p>
      </footer>
    </div>
  );
};

export default Index;
