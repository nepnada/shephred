import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Activity, Camera, MapPin, Leaf, Settings } from "lucide-react";
import { Header } from "@/components/Header";
import { useTranslation } from "@/hooks/useTranslation";

interface MobileLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const MobileLayout = ({ children, activeSection, onSectionChange }: MobileLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('menu.dashboard'), icon: Home },
    { id: 'health', label: t('menu.health'), icon: Activity },
    { id: 'counter', label: t('menu.counter'), icon: Camera },
    { id: 'map', label: t('menu.map'), icon: MapPin },
    { id: 'plants', label: t('menu.plants'), icon: Leaf },
    { id: 'settings', label: t('menu.settings'), icon: Settings },
  ];

  const handleMenuClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Menu Trigger */}
      <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="ml-2 text-sm">{t('menu.title')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="py-6">
                <div className="px-6 mb-6">
                  <h2 className="text-lg font-semibold">{t('header.title')}</h2>
                  <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
                </div>
                
                <nav className="space-y-1 px-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "secondary" : "ghost"}
                        className="w-full justify-start h-12"
                        onClick={() => handleMenuClick(item.id)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="text-sm font-medium">
            {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>
    </div>
  );
};