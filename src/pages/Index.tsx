import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { SheepDataDashboard } from "@/components/SheepDataDashboard";
import { HealthMonitor } from "@/components/HealthMonitor";
import { FlockCounter } from "@/components/FlockCounter";
import { GrazingMap } from "@/components/GrazingMap";
import { PlantsInsectsAlerts } from "@/components/PlantsInsectsAlerts";
import { TranslationProvider } from "@/hooks/useTranslation";
import { SheepDataProvider } from "@/contexts/SheepContext";

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <SheepDataDashboard />;
      case 'health':
        return <HealthMonitor />;
      case 'counter':
        return <FlockCounter />;
      case 'map':
        return <GrazingMap />;
      case 'plants':
        return <PlantsInsectsAlerts />;
      case 'settings':
        return <div className="p-8 text-center">Settings coming soon</div>;
      default:
        return <SheepDataDashboard />;
    }
  };

  return (
    <TranslationProvider>
      <SheepDataProvider>
        <MobileLayout 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        >
          {renderSection()}
        </MobileLayout>
      </SheepDataProvider>
    </TranslationProvider>
  );
};

export default Index;
