
import React, { useState } from 'react';
import { GalaxyMap } from '../components/GalaxyMap';
import { StarSystem } from '../utils/galaxyGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [galaxySeed, setGalaxySeed] = useState(12345);
  const [inputSeed, setInputSeed] = useState('12345');
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);

  const handleSeedChange = () => {
    const newSeed = parseInt(inputSeed) || 12345;
    setGalaxySeed(newSeed);
    setSelectedSystem(null);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999) + 1;
    setInputSeed(randomSeed.toString());
    setGalaxySeed(randomSeed);
    setSelectedSystem(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Galaxy Map */}
        <div className="flex-1">
          <GalaxyMap 
            seed={galaxySeed} 
            onSystemSelect={setSelectedSystem}
          />
        </div>

        {/* System Details Panel */}
        {selectedSystem && (
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
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

                <div>
                  <strong>Planetary Bodies:</strong> {selectedSystem.planets.length}
                  {selectedSystem.planets.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {selectedSystem.planets.map((planet, index) => (
                        <li key={planet.id} className="bg-gray-700 p-2 rounded text-sm">
                          <div className="font-medium">{planet.name}</div>
                          <div className="text-xs text-gray-400">
                            Type: {planet.type} | Radius: {planet.radius.toFixed(1)}
                          </div>
                          {planet.inhabited && (
                            <div className="text-xs text-green-400">Inhabited</div>
                          )}
                          {planet.civilization && (
                            <div className="text-xs text-blue-400">
                              Civilization: {planet.civilization.name} ({planet.civilization.type})
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <Button className="w-full" disabled={selectedSystem.explored}>
                    {selectedSystem.explored ? 'Already Explored' : 'Begin Exploration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="bg-gray-900 p-2 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>Procedurally Generated Galaxy | Seed: {galaxySeed} | Click and drag to navigate, scroll to zoom</p>
      </footer>
    </div>
  );
};

export default Index;
