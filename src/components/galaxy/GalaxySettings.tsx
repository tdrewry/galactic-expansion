
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';

interface GalaxySettingsProps {
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  raymarchingSamples?: number;
  minimumVisibility?: number;
  onSettingsChange: (settings: {
    numSystems: number;
    numNebulae: number;
    binaryFrequency: number;
    trinaryFrequency: number;
    raymarchingSamples?: number;
    minimumVisibility?: number;
  }) => void;
}

export const GalaxySettings: React.FC<GalaxySettingsProps> = ({
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  raymarchingSamples = 8,
  minimumVisibility = 0.1,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = React.useState({
    numSystems,
    numNebulae,
    binaryFrequency,
    trinaryFrequency,
    raymarchingSamples,
    minimumVisibility
  });

  const handleApply = () => {
    onSettingsChange(localSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      numSystems: 1000,
      numNebulae: 50,
      binaryFrequency: 0.15,
      trinaryFrequency: 0.03,
      raymarchingSamples: 8,
      minimumVisibility: 0.1
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>Galaxy Generation Settings</SheetTitle>
          <SheetDescription>
            Configure parameters for procedural galaxy generation and cloud rendering
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Galaxy Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systems">Star Systems</Label>
                <Input
                  id="systems"
                  type="number"
                  value={localSettings.numSystems}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    numSystems: parseInt(e.target.value) || 1000
                  }))}
                  min="100"
                  max="5000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nebulae">Nebulae</Label>
                <Input
                  id="nebulae"
                  type="number"
                  value={localSettings.numNebulae}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    numNebulae: parseInt(e.target.value) || 50
                  }))}
                  min="10"
                  max="200"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Star System Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="binary">Binary System Frequency</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="binary"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={localSettings.binaryFrequency}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      binaryFrequency: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <span className="text-sm text-gray-400">
                    ({Math.round(localSettings.binaryFrequency * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trinary">Trinary System Frequency</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="trinary"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={localSettings.trinaryFrequency}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      trinaryFrequency: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <span className="text-sm text-gray-400">
                    ({Math.round(localSettings.trinaryFrequency * 100)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cloud Rendering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raymarching">Raymarching Samples</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="raymarching"
                    type="number"
                    min="4"
                    max="32"
                    value={localSettings.raymarchingSamples}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      raymarchingSamples: parseInt(e.target.value) || 8
                    }))}
                  />
                  <span className="text-sm text-gray-400">
                    (Higher = better quality, lower performance)
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visibility">Minimum Visibility</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="visibility"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={localSettings.minimumVisibility}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      minimumVisibility: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <span className="text-sm text-gray-400">
                    (0 = natural, >0 = debug mode)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Settings
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
