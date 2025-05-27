import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

interface GalaxySettingsProps {
  numSystems: number;
  numNebulae: number;
  binaryFrequency: number;
  trinaryFrequency: number;
  raymarchingSamples?: number;
  minimumVisibility?: number;
  showDustLanes?: boolean;
  showStarFormingRegions?: boolean;
  showCosmicDust?: boolean;
  appTitle?: string;
  dustLaneParticles?: number;
  starFormingParticles?: number;
  cosmicDustParticles?: number;
  dustLaneOpacity?: number;
  starFormingOpacity?: number;
  cosmicDustOpacity?: number;
  dustLaneColorIntensity?: number;
  starFormingColorIntensity?: number;
  cosmicDustColorIntensity?: number;
  onSettingsChange: (settings: {
    numSystems: number;
    numNebulae: number;
    binaryFrequency: number;
    trinaryFrequency: number;
    raymarchingSamples?: number;
    minimumVisibility?: number;
    showDustLanes?: boolean;
    showStarFormingRegions?: boolean;
    showCosmicDust?: boolean;
    appTitle?: string;
    dustLaneParticles?: number;
    starFormingParticles?: number;
    cosmicDustParticles?: number;
    dustLaneOpacity?: number;
    starFormingOpacity?: number;
    cosmicDustOpacity?: number;
    dustLaneColorIntensity?: number;
    starFormingColorIntensity?: number;
    cosmicDustColorIntensity?: number;
  }) => void;
}

export const GalaxySettings: React.FC<GalaxySettingsProps> = ({
  numSystems,
  numNebulae,
  binaryFrequency,
  trinaryFrequency,
  raymarchingSamples = 8,
  minimumVisibility = 0.1,
  showDustLanes = true,
  showStarFormingRegions = false,
  showCosmicDust = true,
  appTitle = 'Stardust Voyager',
  dustLaneParticles = 15000,
  starFormingParticles = 12000,
  cosmicDustParticles = 10000,
  dustLaneOpacity = 0.4,
  starFormingOpacity = 0.3,
  cosmicDustOpacity = 0.4,
  dustLaneColorIntensity = 1.0,
  starFormingColorIntensity = 1.2,
  cosmicDustColorIntensity = 0.8,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = React.useState({
    numSystems,
    numNebulae,
    binaryFrequency,
    trinaryFrequency,
    raymarchingSamples,
    minimumVisibility,
    showDustLanes,
    showStarFormingRegions,
    showCosmicDust,
    appTitle,
    dustLaneParticles,
    starFormingParticles,
    cosmicDustParticles,
    dustLaneOpacity,
    starFormingOpacity,
    cosmicDustOpacity,
    dustLaneColorIntensity,
    starFormingColorIntensity,
    cosmicDustColorIntensity
  });

  // Update local settings when props change
  React.useEffect(() => {
    setLocalSettings({
      numSystems,
      numNebulae,
      binaryFrequency,
      trinaryFrequency,
      raymarchingSamples,
      minimumVisibility,
      showDustLanes,
      showStarFormingRegions,
      showCosmicDust,
      appTitle,
      dustLaneParticles,
      starFormingParticles,
      cosmicDustParticles,
      dustLaneOpacity,
      starFormingOpacity,
      cosmicDustOpacity,
      dustLaneColorIntensity,
      starFormingColorIntensity,
      cosmicDustColorIntensity
    });
  }, [numSystems, numNebulae, binaryFrequency, trinaryFrequency, raymarchingSamples, minimumVisibility, showDustLanes, showStarFormingRegions, showCosmicDust, appTitle, dustLaneParticles, starFormingParticles, cosmicDustParticles, dustLaneOpacity, starFormingOpacity, cosmicDustOpacity, dustLaneColorIntensity, starFormingColorIntensity, cosmicDustColorIntensity]);

  const handleApply = () => {
    console.log('Applying particle settings:', localSettings);
    onSettingsChange(localSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      numSystems: 1000,
      numNebulae: 50,
      binaryFrequency: 0.15,
      trinaryFrequency: 0.03,
      raymarchingSamples: 8,
      minimumVisibility: 0.1,
      showDustLanes: true,
      showStarFormingRegions: false,
      showCosmicDust: true,
      appTitle: 'Stardust Voyager',
      dustLaneParticles: 15000,
      starFormingParticles: 12000,
      cosmicDustParticles: 10000,
      dustLaneOpacity: 0.4,
      starFormingOpacity: 0.3,
      cosmicDustOpacity: 0.4,
      dustLaneColorIntensity: 1.0,
      starFormingColorIntensity: 1.2,
      cosmicDustColorIntensity: 0.8
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
      <SheetContent side="right" className="w-96 flex flex-col">
        <SheetHeader className="flex-shrink-0 pb-4 border-b">
          <SheetTitle>Galaxy Generation Settings</SheetTitle>
          <SheetDescription>
            Configure parameters for procedural galaxy generation
          </SheetDescription>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleApply} className="flex-1">
              Apply Settings
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-title">Application Title</Label>
                  <Input
                    id="app-title"
                    type="text"
                    value={localSettings.appTitle}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      appTitle: e.target.value
                    }))}
                    placeholder="Enter application title"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Visual Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dust-lanes">Dust Lanes</Label>
                  <Switch
                    id="dust-lanes"
                    checked={localSettings.showDustLanes}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                      ...prev,
                      showDustLanes: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="star-forming">Star-forming Regions (Nebulae)</Label>
                  <Switch
                    id="star-forming"
                    checked={localSettings.showStarFormingRegions}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                      ...prev,
                      showStarFormingRegions: checked
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="cosmic-dust">Cosmic Dust</Label>
                  <Switch
                    id="cosmic-dust"
                    checked={localSettings.showCosmicDust}
                    onCheckedChange={(checked) => setLocalSettings(prev => ({
                      ...prev,
                      showCosmicDust: checked
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-sm">Particle System Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dust Lane Particles */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Dust Lane Particles</h4>
                  <div className="space-y-2">
                    <Label htmlFor="dust-lane-particles">Particle Count</Label>
                    <Input
                      id="dust-lane-particles"
                      type="number"
                      value={localSettings.dustLaneParticles}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        dustLaneParticles: parseInt(e.target.value) || 15000
                      }))}
                      min="1000"
                      max="50000"
                      step="1000"
                    />
                    <span className="text-xs text-gray-400">For spiral galaxy dust lanes</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Opacity: {localSettings.dustLaneOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[localSettings.dustLaneOpacity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        dustLaneOpacity: value
                      }))}
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Intensity: {localSettings.dustLaneColorIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[localSettings.dustLaneColorIntensity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        dustLaneColorIntensity: value
                      }))}
                      min={0.2}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Star-forming Region Particles */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Star-forming Region Particles</h4>
                  <div className="space-y-2">
                    <Label htmlFor="star-forming-particles">Particle Count</Label>
                    <Input
                      id="star-forming-particles"
                      type="number"
                      value={localSettings.starFormingParticles}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        starFormingParticles: parseInt(e.target.value) || 12000
                      }))}
                      min="1000"
                      max="50000"
                      step="1000"
                    />
                    <span className="text-xs text-gray-400">For nebula and star-forming regions</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Opacity: {localSettings.starFormingOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[localSettings.starFormingOpacity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        starFormingOpacity: value
                      }))}
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Intensity: {localSettings.starFormingColorIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[localSettings.starFormingColorIntensity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        starFormingColorIntensity: value
                      }))}
                      min={0.2}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* Cosmic Dust Particles */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium text-sm">Cosmic Dust Particles</h4>
                  <div className="space-y-2">
                    <Label htmlFor="cosmic-dust-particles">Particle Count</Label>
                    <Input
                      id="cosmic-dust-particles"
                      type="number"
                      value={localSettings.cosmicDustParticles}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        cosmicDustParticles: parseInt(e.target.value) || 10000
                      }))}
                      min="1000"
                      max="50000"
                      step="1000"
                    />
                    <span className="text-xs text-gray-400">For globular galaxy cosmic dust</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Opacity: {localSettings.cosmicDustOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[localSettings.cosmicDustOpacity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        cosmicDustOpacity: value
                      }))}
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color Intensity: {localSettings.cosmicDustColorIntensity.toFixed(1)}</Label>
                    <Slider
                      value={[localSettings.cosmicDustColorIntensity]}
                      onValueChange={([value]) => setLocalSettings(prev => ({
                        ...prev,
                        cosmicDustColorIntensity: value
                      }))}
                      min={0.2}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
