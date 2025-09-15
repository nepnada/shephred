import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bug, Leaf, MapPin, Calendar, ThermometerSun, CloudRain, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// Import plant images
import oleanderImg from "@/assets/plants/oleander.jpg";
import castorBeanImg from "@/assets/plants/castor-bean.jpg";
import wildLupineImg from "@/assets/plants/wild-lupine.jpg";
import astragalusImg from "@/assets/plants/astragalus-lusitanicus.jpg";
import hemlockImg from "@/assets/plants/hemlock.jpg";
import rhododendronImg from "@/assets/plants/rhododendron.jpg";

// Import insect images
import nasalBotFlyImg from "@/assets/insects/nasal-bot-fly.jpg";
import sheepTickImg from "@/assets/insects/sheep-tick.jpg";
import diseaseMosquitoImg from "@/assets/insects/disease-mosquito.jpg";
import barberPoleWormImg from "@/assets/insects/barber-pole-worm.jpg";
import liverFlukeImg from "@/assets/insects/liver-fluke.jpg";

export const PlantsInsectsAlerts = () => {
  const { t, language } = useTranslation();
  const [selectedCity, setSelectedCity] = useState("agadir");
  const [weatherData, setWeatherData] = useState<any>(null);
  const apiKey = 'a12ef7e32f352f46f53f907d8d0a2485';

  const cities = [
    { id: "agadir", name: "أكادير / Agadir", nameEn: "Agadir", lat: 30.4278, lon: -9.5981 },
    { id: "fes", name: "فاس / Fès", nameEn: "Fes", lat: 34.0181, lon: -5.0078 },
    { id: "casablanca", name: "الدار البيضاء / Casablanca", nameEn: "Casablanca", lat: 33.5731, lon: -7.5898 },
    { id: "marrakech", name: "مراكش / Marrakech", nameEn: "Marrakech", lat: 31.6295, lon: -7.9811 },
    { id: "ifrane", name: "إفران / Ifrane", nameEn: "Ifrane", lat: 33.5228, lon: -5.1106 }
  ];

  // Real data based on Moroccan geography and climate
  const cityData = {
    agadir: {
      dangerousPlants: [
        {
          name: { ar: "الدفلة", en: "Oleander", darija: "الدفلة" },
          image: oleanderImg,
          toxicity: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          symptoms: { ar: "قيء، إسهال، توقف القلب", en: "Vomiting, diarrhea, cardiac arrest", darija: "قيء، إسهال، توقف القلب" },
          locations: { ar: "المناطق الساحلية، الحدائق العامة", en: "Coastal areas, public gardens", darija: "المناطق الساحلية، الجنان العامة" }
        },
        {
          name: { ar: "الخروع", en: "Castor Bean", darija: "الخروع" },
          image: castorBeanImg,
          toxicity: "high", 
          season: { ar: "الصيف والخريف", en: "Summer & Fall", darija: "الصيف والخريف" },
          symptoms: { ar: "نزيف داخلي، فشل كلوي", en: "Internal bleeding, kidney failure", darija: "نزيف داخلي، فشل كلوي" },
          locations: { ar: "الأودية، المناطق المروية", en: "Valleys, irrigated areas", darija: "الأودية، المناطق المروية" }
        }
      ],
      seasonalInsects: [
        {
          name: { ar: "ذبابة الأنف", en: "Nasal Bot Fly", darija: "ذبابة الأنف" },
          image: nasalBotFlyImg,
          risk: "high",
          season: { ar: "الصيف", en: "Summer", darija: "الصيف" },
          prevention: { ar: "استخدام طارد الحشرات، فحص دوري للأنف", en: "Use repellents, regular nasal inspection", darija: "استخدام طارد الحشرات، فحص دوري للأنف" },
          locations: { ar: "المراعي الجافة، المناطق الدافئة", en: "Dry pastures, warm areas", darija: "المراعي الجافة، المناطق الدافئة" }
        },
        {
          name: { ar: "القراد", en: "Sheep Tick", darija: "القراد" },
          image: sheepTickImg,
          risk: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          prevention: { ar: "فحص يومي للصوف، أدوية مضادة للقراد", en: "Daily wool inspection, anti-tick medication", darija: "فحص يومي للصوف، أدوية مضادة للقراد" },
          locations: { ar: "الأعشاب الطويلة، الشجيرات", en: "Tall grass, shrubs", darija: "الأعشاب الطويلة، الشجيرات" }
        }
      ]
    },
    ifrane: {
      dangerousPlants: [
        {
          name: { ar: "استراجالوس لوسيتانيكوس", en: "Astragalus lusitanicus", darija: "استراجالوس" },
          image: astragalusImg,
          toxicity: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          symptoms: { ar: "تسمم عصبي، شلل، موت", en: "Neurological poisoning, paralysis, death", darija: "تسمم عصبي، شلل، موت" },
          locations: { ar: "المروج الجبلية، الأراضي العالية في الأطلس المتوسط", en: "Mountain meadows, high altitude areas in Middle Atlas", darija: "المروج الجبلية، الأراضي العالية ف الأطلس المتوسط" }
        },
        {
          name: { ar: "الشوكران المائي", en: "Poison Hemlock", darija: "الشوكران المائي" },
          image: hemlockImg,
          toxicity: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          symptoms: { ar: "شلل تدريجي، فشل تنفسي، موت خلال ساعات", en: "Progressive paralysis, respiratory failure, death within hours", darija: "شلل تدريجي، فشل تنفسي، موت خلال ساعات" },
          locations: { ar: "المناطق الرطبة، ضفاف الأنهار، الينابيع", en: "Wet areas, riverbanks, springs", darija: "المناطق الرطبة، ضفاف الأنهار، الينابيع" }
        },
        {
          name: { ar: "الرودودندرون", en: "Rhododendron", darija: "الرودودندرون" },
          image: rhododendronImg,
          toxicity: "high",
          season: { ar: "الربيع", en: "Spring", darija: "الربيع" },
          symptoms: { ar: "قيء، إسهال، تسمم القلب", en: "Vomiting, diarrhea, cardiac toxicity", darija: "قيء، إسهال، تسمم القلب" },
          locations: { ar: "غابات الأرز، المناطق المظللة الباردة", en: "Cedar forests, cool shaded areas", darija: "غابات الأرز، المناطق المظللة الباردة" }
        },
        {
          name: { ar: "الحلبة البرية", en: "Wild Lupine", darija: "الحلبة البرية" },
          image: wildLupineImg,
          toxicity: "medium",
          season: { ar: "الربيع", en: "Spring", darija: "الربيع" },
          symptoms: { ar: "تشنجات عضلية، صعوبة التنفس", en: "Muscle spasms, breathing difficulties", darija: "تشنجات عضلية، صعوبة التنفس" },
          locations: { ar: "الغابات الجبلية، المروج العالية", en: "Mountain forests, high meadows", darija: "الغابات الجبلية، المروج العالية" }
        }
      ],
      seasonalInsects: [
        {
          name: { ar: "الدودة البرقطية", en: "Barber Pole Worm", darija: "الدودة البرقطية" },
          image: barberPoleWormImg,
          risk: "high",
          season: { ar: "الخريف والشتاء", en: "Fall & Winter", darija: "الخريف والشتاء" },
          prevention: { ar: "فحص البراز، أدوية مضادة للديدان، تناوب المراعي", en: "Fecal testing, deworming medication, pasture rotation", darija: "فحص البراز، أدوية مضادة للديدان، تناوب المراعي" },
          locations: { ar: "المراعي الرطبة، المناطق المروية", en: "Wet pastures, irrigated areas", darija: "المراعي الرطبة، المناطق المروية" }
        },
        {
          name: { ar: "الكبدية المنبسطة", en: "Liver Fluke", darija: "الكبدية المنبسطة" },
          image: liverFlukeImg,
          risk: "high",
          season: { ar: "الصيف والخريف", en: "Summer & Fall", darija: "الصيف والخريف" },
          prevention: { ar: "تجنب المراعي المبللة، فحص الكبد، أدوية مضادة للكبديات", en: "Avoid wet pastures, liver examination, anti-fluke medication", darija: "تجنب المراعي المبللة، فحص الكبد، أدوية مضادة للكبديات" },
          locations: { ar: "الأراضي الرطبة، المستنقعات، بجانب الأنهار", en: "Wetlands, marshes, near streams", darija: "الأراضي الرطبة، المستنقعات، بجانب الأنهار" }
        }
      ]
    },
    fes: {
      dangerousPlants: [
        {
          name: { ar: "الدفلة", en: "Oleander", darija: "الدفلة" },
          image: oleanderImg,
          toxicity: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          symptoms: { ar: "قيء، إسهال، توقف القلب", en: "Vomiting, diarrhea, cardiac arrest", darija: "قيء، إسهال، توقف القلب" },
          locations: { ar: "المدينة القديمة، الحدائق", en: "Old medina, gardens", darija: "المدينة القديمة، الجنان" }
        }
      ],
      seasonalInsects: [
        {
          name: { ar: "القراد", en: "Sheep Tick", darija: "القراد" },
          image: sheepTickImg,
          risk: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          prevention: { ar: "فحص يومي للصوف، أدوية مضادة للقراد", en: "Daily wool inspection, anti-tick medication", darija: "فحص يومي للصوف، أدوية مضادة للقراد" },
          locations: { ar: "المراعي حول المدينة", en: "Pastures around the city", darija: "المراعي حول المدينة" }
        }
      ]
    },
    casablanca: {
      dangerousPlants: [
        {
          name: { ar: "الخروع", en: "Castor Bean", darija: "الخروع" },
          image: castorBeanImg,
          toxicity: "high", 
          season: { ar: "الصيف والخريف", en: "Summer & Fall", darija: "الصيف والخريف" },
          symptoms: { ar: "نزيف داخلي، فشل كلوي", en: "Internal bleeding, kidney failure", darija: "نزيف داخلي، فشل كلوي" },
          locations: { ar: "المناطق الصناعية، الأراضي المهجورة", en: "Industrial areas, abandoned lands", darija: "المناطق الصناعية، الأراضي المهجورة" }
        }
      ],
      seasonalInsects: [
        {
          name: { ar: "ذبابة الأنف", en: "Nasal Bot Fly", darija: "ذبابة الأنف" },
          image: nasalBotFlyImg,
          risk: "medium",
          season: { ar: "الصيف", en: "Summer", darija: "الصيف" },
          prevention: { ar: "استخدام طارد الحشرات، فحص دوري للأنف", en: "Use repellents, regular nasal inspection", darija: "استخدام طارد الحشرات، فحص دوري للأنف" },
          locations: { ar: "المناطق الحضرية، الضواحي", en: "Urban areas, suburbs", darija: "المناطق الحضرية، الضواحي" }
        }
      ]
    },
    marrakech: {
      dangerousPlants: [
        {
          name: { ar: "الدفلة", en: "Oleander", darija: "الدفلة" },
          image: oleanderImg,
          toxicity: "high",
          season: { ar: "الربيع والصيف", en: "Spring & Summer", darija: "الربيع والصيف" },
          symptoms: { ar: "قيء، إسهال، توقف القلب", en: "Vomiting, diarrhea, cardiac arrest", darija: "قيء، إسهال، توقف القلب" },
          locations: { ar: "النخيل، الحدائق", en: "Palm groves, gardens", darija: "النخيل، الجنان" }
        }
      ],
      seasonalInsects: [
        {
          name: { ar: "ذبابة الأنف", en: "Nasal Bot Fly", darija: "ذبابة الأنف" },
          image: nasalBotFlyImg,
          risk: "high",
          season: { ar: "الصيف", en: "Summer", darija: "الصيف" },
          prevention: { ar: "استخدام طارد الحشرات، فحص دوري للأنف", en: "Use repellents, regular nasal inspection", darija: "استخدام طارد الحشرات، فحص دوري للأنف" },
          locations: { ar: "الصحراء، الواحات", en: "Desert, oases", darija: "الصحراء، الواحات" }
        }
      ]
    }
  };

  const currentData = cityData[selectedCity] || cityData.agadir;

  const fetchWeather = async () => {
    try {
      const city = cities.find(c => c.id === selectedCity);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      
      if (response.ok) {
        setWeatherData({
          temperature: `${Math.round(data.main.temp)}°C`,
          humidity: `${data.main.humidity}%`,
          windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`,
          precipitation: data.rain ? `${Math.round(data.rain['1h'] || 0)}mm` : "0mm",
          description: data.weather[0].description
        });
      } else {
        // Fallback to mock weather data if API fails
        const mockWeather = {
          agadir: { temp: 22, humidity: 65, wind: 12, desc: "sunny" },
          fes: { temp: 18, humidity: 70, wind: 8, desc: "partly cloudy" },
          casablanca: { temp: 20, humidity: 75, wind: 15, desc: "overcast" },
          marrakech: { temp: 25, humidity: 45, wind: 10, desc: "clear" },
          ifrane: { temp: 12, humidity: 80, wind: 6, desc: "cloudy" }
        };
        
        const mock = mockWeather[selectedCity] || mockWeather.agadir;
        setWeatherData({
          temperature: `${mock.temp}°C`,
          humidity: `${mock.humidity}%`,
          windSpeed: `${mock.wind} km/h`,
          precipitation: "0mm",
          description: mock.desc
        });
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Use mock data on error
      setWeatherData({
        temperature: "20°C",
        humidity: "65%",
        windSpeed: "10 km/h",
        precipitation: "0mm",
        description: "Clear sky"
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [selectedCity]);

  const getToxicityColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive";
      case "medium": return "bg-caution";
      case "low": return "bg-safe";
      default: return "bg-muted";
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive";
      case "medium": return "bg-caution";
      case "low": return "bg-safe";
      default: return "bg-muted";
    }
  };

  return (
    <section className="py-6 px-4 bg-gradient-landscape/5 min-h-screen">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('plants.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('plants.description')}
          </p>
        </div>

        {/* City Selector - Mobile Optimized */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {t('plants.select_city')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-2">
              {cities.map((city) => (
                <Button
                  key={city.id}
                  variant={selectedCity === city.id ? "default" : "outline"}
                  onClick={() => setSelectedCity(city.id)}
                  className="justify-start text-sm h-12"
                  size="lg"
                >
                  {city.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Info - Mobile Optimized */}
        {weatherData && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ThermometerSun className="h-5 w-5 text-primary" />
                {t('plants.weather_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-orange-500" />
                  <span>{weatherData.temperature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span>{weatherData.precipitation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span>{weatherData.humidity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">💨</span>
                  <span>{weatherData.windSpeed}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 capitalize">
                {weatherData.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plants & Insects Cards - Mobile Stack */}
        <div className="space-y-6">
          {/* Dangerous Plants */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-destructive" />
                {t('plants.poisonous')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {currentData.dangerousPlants.map((plant, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-background/50">
                    <div className="flex gap-3">
                      <img 
                        src={plant.image} 
                        alt={plant.name[language] || plant.name.en}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {plant.name[language] || plant.name.en}
                          </h4>
                          <Badge className={`${getToxicityColor(plant.toxicity)} text-xs`}>
                            {t(`plants.${plant.toxicity}_toxicity`)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {plant.season[language] || plant.season.en}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{t('plants.symptoms')}: </span>
                            {plant.symptoms[language] || plant.symptoms.en}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Insects */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bug className="h-5 w-5 text-caution" />
                {t('plants.insects')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {currentData.seasonalInsects.map((insect, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-background/50">
                    <div className="flex gap-3">
                      <img 
                        src={insect.image} 
                        alt={insect.name[language] || insect.name.en}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {insect.name[language] || insect.name.en}
                          </h4>
                          <Badge className={`${getRiskColor(insect.risk)} text-xs`}>
                            {insect.risk === 'high' ? t('plants.high_toxicity') : 
                             insect.risk === 'medium' ? t('plants.medium_toxicity') : 
                             t('plants.low_toxicity')}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {insect.season[language] || insect.season.en}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{t('plants.prevention')}: </span>
                            {insect.prevention[language] || insect.prevention.en}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};