import { LanguageSelector } from "./LanguageSelector";
import { Shield, Map, Activity, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('header.title')}</h1>
                <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => document.getElementById('health-monitor')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Activity className="h-4 w-4" />
              <span>{t('health.title')}</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => document.getElementById('flock-counter')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Shield className="h-4 w-4" />
              <span>{t('flock.title')}</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => document.getElementById('grazing-map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Map className="h-4 w-4" />
              <span>{t('map.title')}</span>
            </Button>
          </nav>

          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};