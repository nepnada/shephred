import { createContext, useContext, useState, ReactNode } from 'react';

interface FlockData {
  id: string;
  name: string;
  totalSheep: number;
  healthySheep: number;
  sickSheep: number;
  lastCount: string;
}

interface SheepData {
  flocks: FlockData[];
  totalSheep: number;
  healthySheep: number;
  sickSheep: number;
  lastCount: string;
  alerts: number;
}

interface SheepContextType {
  sheepData: SheepData;
  addFlock: (name: string, sheepCount: number) => void;
  updateFlockSheepCount: (flockId: string, count: number) => void;
  deleteFlock: (flockId: string) => void;
  addSickSheep: (flockId?: string) => void;
  setSheepData: (data: SheepData) => void;
}

const SheepContext = createContext<SheepContextType | undefined>(undefined);

export const useSheepData = () => {
  const context = useContext(SheepContext);
  if (!context) {
    throw new Error('useSheepData must be used within a SheepDataProvider');
  }
  return context;
};

export const SheepDataProvider = ({ children }: { children: ReactNode }) => {
  const [sheepData, setSheepData] = useState<SheepData>({
    flocks: [],
    totalSheep: 0,
    healthySheep: 0,
    sickSheep: 0,
    lastCount: "Never",
    alerts: 0
  });

  const calculateTotals = (flocks: FlockData[]) => {
    const totals = flocks.reduce((acc, flock) => ({
      totalSheep: acc.totalSheep + flock.totalSheep,
      healthySheep: acc.healthySheep + flock.healthySheep,
      sickSheep: acc.sickSheep + flock.sickSheep
    }), { totalSheep: 0, healthySheep: 0, sickSheep: 0 });
    
    return totals;
  };

  const addFlock = (name: string, sheepCount: number) => {
    const healthy = Math.floor(sheepCount * 0.9);
    const sick = sheepCount - healthy;
    
    const newFlock: FlockData = {
      id: Date.now().toString(),
      name,
      totalSheep: sheepCount,
      healthySheep: healthy,
      sickSheep: sick,
      lastCount: new Date().toLocaleString()
    };
    
    setSheepData(prev => {
      const newFlocks = [...prev.flocks, newFlock];
      const totals = calculateTotals(newFlocks);
      
      return {
        flocks: newFlocks,
        ...totals,
        lastCount: new Date().toLocaleString(),
        alerts: totals.sickSheep > 0 ? 1 : 0
      };
    });
  };

  const updateFlockSheepCount = (flockId: string, count: number) => {
    const healthy = Math.floor(count * 0.9);
    const sick = count - healthy;
    
    setSheepData(prev => {
      const updatedFlocks = prev.flocks.map(flock =>
        flock.id === flockId
          ? { ...flock, totalSheep: count, healthySheep: healthy, sickSheep: sick, lastCount: new Date().toLocaleString() }
          : flock
      );
      
      const totals = calculateTotals(updatedFlocks);
      
      return {
        flocks: updatedFlocks,
        ...totals,
        lastCount: new Date().toLocaleString(),
        alerts: totals.sickSheep > 0 ? 1 : 0
      };
    });
  };

  const deleteFlock = (flockId: string) => {
    setSheepData(prev => {
      const updatedFlocks = prev.flocks.filter(flock => flock.id !== flockId);
      const totals = calculateTotals(updatedFlocks);
      
      return {
        flocks: updatedFlocks,
        ...totals,
        lastCount: new Date().toLocaleString(),
        alerts: totals.sickSheep > 0 ? 1 : 0
      };
    });
  };

  const addSickSheep = (flockId?: string) => {
    setSheepData(prev => {
      let updatedFlocks = prev.flocks;
      
      if (flockId) {
        updatedFlocks = prev.flocks.map(flock =>
          flock.id === flockId && flock.healthySheep > 0
            ? { 
                ...flock, 
                sickSheep: flock.sickSheep + 1, 
                healthySheep: flock.healthySheep - 1,
                lastCount: new Date().toLocaleString()
              }
            : flock
        );
      } else if (prev.flocks.length > 0) {
        // Add to first flock if no specific flock specified
        const firstFlock = prev.flocks[0];
        if (firstFlock.healthySheep > 0) {
          updatedFlocks = prev.flocks.map(flock =>
            flock.id === firstFlock.id
              ? { 
                  ...flock, 
                  sickSheep: flock.sickSheep + 1, 
                  healthySheep: flock.healthySheep - 1,
                  lastCount: new Date().toLocaleString()
                }
              : flock
          );
        }
      }
      
      const totals = calculateTotals(updatedFlocks);
      
      return {
        flocks: updatedFlocks,
        ...totals,
        lastCount: new Date().toLocaleString(),
        alerts: totals.sickSheep > 0 ? 1 : 0
      };
    });
  };

  return (
    <SheepContext.Provider value={{
      sheepData,
      addFlock,
      updateFlockSheepCount,
      deleteFlock,
      addSickSheep,
      setSheepData
    }}>
      {children}
    </SheepContext.Provider>
  );
};