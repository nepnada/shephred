import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Users, Activity, MapPin, AlertTriangle, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSheepData } from "@/contexts/SheepContext";
import heroImage from "@/assets/sheep-hero-warm.jpg";
import flowerImage from "@/assets/farm-flower.jpg";

// Sheep Management Dashboard Component
export const SheepDataDashboard = () => {
  const { t } = useTranslation();
  const { sheepData, addFlock, updateFlockSheepCount, deleteFlock } = useSheepData();

  const [newFlockName, setNewFlockName] = useState("");
  const [newSheepCount, setNewSheepCount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingFlock, setEditingFlock] = useState<string | null>(null);
  const [editSheepCount, setEditSheepCount] = useState("");

  const handleAddFlock = () => {
    if (newFlockName && newSheepCount && !isNaN(Number(newSheepCount))) {
      addFlock(newFlockName, Number(newSheepCount));
      setNewFlockName("");
      setNewSheepCount("");
      setIsAdding(false);
    }
  };

  const handleUpdateFlock = (flockId: string) => {
    if (editSheepCount && !isNaN(Number(editSheepCount))) {
      updateFlockSheepCount(flockId, Number(editSheepCount));
      setEditingFlock(null);
      setEditSheepCount("");
    }
  };

  const startEditing = (flockId: string, currentCount: number) => {
    setEditingFlock(flockId);
    setEditSheepCount(currentCount.toString());
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 text-white">
          <div className="absolute inset-0 bg-black/50"></div>
          <img 
            src={heroImage} 
            alt="Sheep flock" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img 
            src={flowerImage} 
            alt="Farm flower" 
            className="absolute top-4 right-4 w-8 h-8 opacity-70 z-10"
          />
          <div className="relative p-8 text-center">
            <h1 className="text-2xl font-bold mb-2 text-white">
              {t('dashboard.welcome')}
            </h1>
            <p className="text-sm text-white/90 mb-6">
              {t('dashboard.subtitle')}
            </p>
            <div className="bg-white/90 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('dashboard.my_flock')}
              </h3>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="px-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-primary/5 border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold">{sheepData.totalSheep}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.total_sheep')}</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-emerald-700">{sheepData.healthySheep}</p>
                <p className="text-xs text-emerald-600">{t('dashboard.healthy')}</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-red-700">{sheepData.sickSheep}</p>
                <p className="text-xs text-red-600">{t('dashboard.sick')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Flock Management Section */}
          <Card className="bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {t('dashboard.manage_flocks')}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAdding(!isAdding)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Add New Flock Form */}
              {isAdding && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label htmlFor="flockName">{t('dashboard.flock_name')}</Label>
                    <Input
                      id="flockName"
                      placeholder={t('dashboard.enter_flock_name')}
                      value={newFlockName}
                      onChange={(e) => setNewFlockName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sheepCount">{t('dashboard.sheep_in_flock')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sheepCount"
                        type="number"
                        placeholder="0"
                        value={newSheepCount}
                        onChange={(e) => setNewSheepCount(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddFlock} size="sm">
                        {t('dashboard.add')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Flocks List */}
              {sheepData.flocks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="mb-2">{t('dashboard.no_flocks')}</p>
                  <p className="text-sm">{t('dashboard.create_first_flock')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sheepData.flocks.map((flock) => (
                    <div key={flock.id} className="p-3 border rounded-lg bg-background/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{flock.name}</h4>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(flock.id, flock.totalSheep)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFlock(flock.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingFlock === flock.id ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={editSheepCount}
                            onChange={(e) => setEditSheepCount(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateFlock(flock.id)}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">{flock.totalSheep}</p>
                            <p className="text-xs text-muted-foreground">{t('dashboard.total_sheep')}</p>
                          </div>
                          <div className="text-center text-emerald-600">
                            <p className="font-semibold">{flock.healthySheep}</p>
                            <p className="text-xs">{t('dashboard.healthy')}</p>
                          </div>
                          <div className="text-center text-red-600">
                            <p className="font-semibold">{flock.sickSheep}</p>
                            <p className="text-xs">{t('dashboard.sick')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          {sheepData.flocks.length > 0 && (
            <Card className="bg-card/80">
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('dashboard.last_updated')}:</span>
                    <Badge variant="secondary">{sheepData.lastCount}</Badge>
                  </div>
                  
                  {sheepData.alerts > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('dashboard.active_alerts')}:</span>
                      <Badge variant="destructive">{sheepData.alerts}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 flex flex-col items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.health_check')}</span>
            </Button>
            
            <Button variant="outline" className="h-12 flex flex-col items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">{t('dashboard.manage_flocks')}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};