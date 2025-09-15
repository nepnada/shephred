import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Users, AlertTriangle, TrendingUp, Shield, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

export const FlockCounter = () => {
  const { t } = useTranslation();
  const [isCounting, setIsCounting] = useState(false);
  const [countResult, setCountResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const { toast } = useToast();

  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const response = await fetch('https://3545dfda8ae6.ngrok-free.app/');
      if (response.ok) {
        setModelStatus('online');
      } else {
        setModelStatus('offline');
      }
    } catch (error) {
      setModelStatus('offline');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      analyzeImage(file);
    }
  };

  const analyzeImage = async (imageFile: File) => {
    if (modelStatus === 'offline') {
      toast({
        title: t('health.model_offline'),
        description: t('health.model_offline_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsCounting(true);
    setCountResult(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('https://3545dfda8ae6.ngrok-free.app/detect_predators', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const result = {
        currentCount: data.sheep_count,
        previousCount: 95, // You might want to store this in context or local storage
        difference: data.sheep_count - 95,
        confidence: 95, // YOLOv8 doesn't return overall confidence, using default
        predators: data.predators_detected || [],
        detections: data.detections || [],
        timestamp: new Date().toLocaleString()
      };

      setCountResult(result);
      
      if (result.predators.length > 0) {
        toast({
          title: t('flock.predators_detected'),
          description: `${result.predators.length} predator(s) detected`,
          variant: "destructive",
        });
      } else if (result.difference < 0) {
        toast({
          title: t('flock.missing'),
          description: `${Math.abs(result.difference)} sheep missing`,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('success'),
          description: `${result.currentCount} sheep counted successfully`,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: t('health.analysis_failed'),
        description: t('health.analysis_failed_desc'),
        variant: "destructive",
      });
    } finally {
      setIsCounting(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setCountResult(null);
  };

  return (
    <section id="flock-counter" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('flock.title')}</h2>
            <p className="text-lg text-muted-foreground mb-2">
              {t('flock.description')}
            </p>
            <div className="flex items-center gap-2 justify-center">
              <div className={`w-2 h-2 rounded-full ${
                modelStatus === 'online' ? 'bg-safe animate-pulse' : 
                modelStatus === 'offline' ? 'bg-destructive' : 'bg-caution'
              }`} />
              <span className="text-sm text-muted-foreground">
                AI Model: {modelStatus === 'online' ? 'Online' : modelStatus === 'offline' ? 'Offline' : 'Checking...'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={checkModelStatus}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  {t('live')} {t('camera')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-64 flex items-center justify-center mb-6 relative overflow-hidden">
                  {isCounting ? (
                    <div className="text-center">
                      <div className="animate-pulse text-primary text-2xl font-bold mb-2">
                        Analyzing Image...
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="h-3 w-3 bg-primary rounded-full animate-pulse" 
                               style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Detecting sheep and predators...</p>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={URL.createObjectURL(selectedImage)} 
                        alt="Selected sheep image" 
                        className="w-full h-full object-cover rounded-lg"
                        id="detection-image"
                      />
                      {countResult && countResult.detections && countResult.detections.length > 0 && (
                        <svg 
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          {countResult.detections.map((detection: any, index: number) => {
                            const isShiep = detection.class === 'sheep' || detection.class === 'mouton';
                            const color = isShiep ? '#22c55e' : '#ef4444'; // green for sheep, red for predators
                            
                            return (
                              <g key={index}>
                                <rect
                                  x={detection.x}
                                  y={detection.y}
                                  width={detection.width}
                                  height={detection.height}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="0.8"
                                  rx="1"
                                />
                                <rect
                                  x={detection.x}
                                  y={detection.y}
                                  width={Math.max(15, detection.class.length * 2)}
                                  height="4"
                                  fill={color}
                                />
                                <text
                                  x={detection.x + 1}
                                  y={detection.y + 2.8}
                                  fontSize="2.5"
                                  fill="white"
                                  fontWeight="bold"
                                >
                                  {detection.class} {Math.round(detection.confidence * 100)}%
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={resetAnalysis}
                        className="absolute top-2 right-2"
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">Upload sheep image for counting</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG supported</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <label className="flex-1">
                    <Button 
                      disabled={isCounting || modelStatus === 'offline'}
                      className="w-full"
                      asChild
                    >
                      <span>
                        {isCounting ? 'Analyzing...' : selectedImage ? 'Change Image' : 'Upload Image'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isCounting}
                    />
                  </label>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Mode
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('flock.count')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {countResult ? (
                  <div className="space-y-6">
                    {/* Results only - no image */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {countResult.currentCount}
                      </div>
                      <p className="text-muted-foreground">Moutons Détectés</p>
                      <Badge variant="secondary" className="mt-2">
                        {countResult.confidence}% Confiance
                      </Badge>
                    </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-accent rounded-lg">
                          <div className="text-2xl font-bold text-muted-foreground">
                            {countResult.previousCount}
                          </div>
                          <p className="text-sm text-muted-foreground">Previous Count</p>
                        </div>
                        <div className={`text-center p-4 rounded-lg ${
                          countResult.difference >= 0 ? 'bg-safe/20' : 'bg-destructive/20'
                        }`}>
                          <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                            countResult.difference >= 0 ? 'text-safe' : 'text-destructive'
                          }`}>
                            {countResult.difference >= 0 ? '+' : ''}
                            {countResult.difference}
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground">Difference</p>
                        </div>
                      </div>

                      {countResult.predators && countResult.predators.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <h4 className="font-semibold text-destructive">Predators Detected!</h4>
                          </div>
                          <div className="space-y-2">
                            {countResult.predators.map((predator: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm font-medium capitalize">{predator.name}</span>
                                <Badge variant="destructive">
                                  {Math.round(predator.confidence * 100)}% confidence
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {countResult.difference < 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <h4 className="font-semibold text-destructive">Missing Sheep Alert</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.abs(countResult.difference)} sheep appear to be missing from the flock
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground text-center">
                        Last counted: {countResult.timestamp}
                      </div>
                    </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('flock.start_counting')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};