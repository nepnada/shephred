import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Activity, MapPin, Shield } from "lucide-react";
import heroImage from "@/assets/sheep-flock-hero.jpg";
import { useTranslation } from "@/hooks/useTranslation";

export const HeroSection = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" className="text-lg px-8">
              {t('hero.cta')}
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('health.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('health.description')}</p>
            </Card>
            
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('flock.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('flock.description')}</p>
            </Card>
            
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('map.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('map.description')}</p>
            </Card>
            
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{t('security.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('security.description')}</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};