
import React, { useState } from 'react';
import { GalaxyMap } from '../components/GalaxyMap';
import { StarSystem, Planet, Moon } from '../utils/galaxyGenerator';
import { SystemView } from '../components/galaxy/SystemView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [galaxySeed, setGalaxySeed] = useState(12345);
  const [inputSeed, setInputSeed] = useState('12345');
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
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

  const handleSystemSelect = (system: StarSystem) => {
    console.log('Index: System selected:', system.id);
    setSelectedSystem(system);
    setSelectedBody(null);
  };

  const handleBodySelect = (body: Planet | Moon | null) => {
    console.log('Index: Body selected:', body?.name || 'none');
    setSelectedBody(body);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Stardust Voyager Fleet</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={inputSeed}
                onChange={(e) => setInputSeed(e.target.value)}
                className="w-24 bg-gray-800 border-gray-600"
                placeholder="Seed"
              />
              <Button onClick={handleSeedChange} variant="outline" size="sm">
                Load Galaxy
              </Button>
              <Button onClick={generateRandomSeed} variant="outline" size="sm">
                Random
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Layout */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Galaxy Map Panel */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <GalaxyMap 
              seed={galaxySeed} 
              onSystemSelect={handleSystemSelect}
            />
          </ResizablePanel>

          {/* Resizable Handle */}
          {selectedSystem && (
            <>
              <ResizableHandle withHandle />
              
              {/* System Details Panel */}
              <ResizablePanel defaultSize={30} minSize={20} maxSize={60}>
                <div className="h-full bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto space-y-4">
                  {/* System Overview */}
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
                        <strong>Planets:</strong> {selectedSystem.planets.length}
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

                  {/* System View - This should show the orbital diagram */}
                  <SystemView 
                    system={selectedSystem} 
                    onBodySelect={handleBodySelect}
                  />

                  {/* Detailed Planet/Moon Info */}
                  {selectedBody && (
                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{selectedBody.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-gray-300 space-y-2">
                        <div><strong>Type:</strong> {selectedBody.type}</div>
                        <div><strong>Radius:</strong> {selectedBody.radius.toFixed(1)} km</div>
                        {'distanceFromStar' in selectedBody && (
                          <div><strong>Distance from Star:</strong> {selectedBody.distanceFromStar.toFixed(2)} AU</div>
                        )}
                        {'inhabited' in selectedBody && selectedBody.inhabited && (
                          <div className="text-green-400 font-medium">Inhabited World</div>
                        )}
                        {'civilization' in selectedBody && selectedBody.civilization && (
                          <div>
                            <strong>Civilization:</strong> {selectedBody.civilization.name}
                            <div className="text-sm text-gray-400">Type: {selectedBody.civilization.type}</div>
                          </div>
                        )}
                        {'moons' in selectedBody && selectedBody.moons && selectedBody.moons.length > 0 && (
                          <div>
                            <strong>Moons:</strong> {selectedBody.moons.length}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Click and drag to navigate, scroll to zoom</p>
      </footer>
    </div>
  );
};

export default Index;
