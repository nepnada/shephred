import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, AlertTriangle, CheckCircle, X, Activity, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSheepData } from "@/contexts/SheepContext";

export const HealthMonitor = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addSickSheep } = useSheepData();

  // API Configuration
  const API_BASE_URL = 'https://3545dfda8ae6.ngrok-free.app';

  // Check model status on component mount
  useEffect(() => {
    checkModelStatus();
  }, []);

  const checkModelStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (file: File) => {
    if (modelStatus === 'offline') {
      toast({
        title: "Model Offline",
        description: "The AI model is currently unavailable. Please try again later.",
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('file', file);

      // Call the FastAPI predict endpoint
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform API response to match UI expectations
      const analysisResult = {
        health: result.label, // 'sick' or 'healthy'
        confidence: Math.round(result.confidence * 100), // Convert 0-1 to percentage
        issues: result.label === 'sick' ? ['Health concerns detected in image'] : [],
        recommendations: result.label === 'sick' ? [
          'Consult with a veterinarian immediately',
          'Monitor sheep closely for symptoms',
          'Isolate if necessary to prevent spread'
        ] : [
          'Continue regular health monitoring',
          'Maintain proper nutrition and hydration',
          'Schedule routine veterinary checkups'
        ]
      };

      setAnalysisResult(analysisResult);
      
      // Automatically add to sick sheep count if health issues detected
      if (result.label === 'sick') {
        addSickSheep();
      }
      
      toast({
        title: "Analysis Complete",
        description: `Sheep appears ${result.label} with ${Math.round(result.confidence * 100)}% confidence`,
        variant: result.label === 'healthy' ? 'default' : 'destructive',
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please check your connection and try again.",
        variant: 'destructive',
      });
      setModelStatus('offline');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <section id="health-monitor" className="py-16 bg-gradient-landscape/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('health.title')}</h2>
            <p className="text-lg text-muted-foreground mb-2">
              {t('health.description')}
            </p>
            
            {/* Model Status Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {modelStatus === 'online' ? (
                <>
                  <Wifi className="h-4 w-4 text-safe" />
                  <span className="text-sm text-safe">AI Model Online</span>
                </>
              ) : modelStatus === 'offline' ? (
                <>
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">AI Model Offline</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
                  <span className="text-sm text-muted-foreground">Checking AI Model...</span>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={checkModelStatus}
                className="h-6 px-2 text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                {!selectedImage ? (
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('health.upload_title')}</h3>
                    <p className="text-muted-foreground mb-6">
                      {t('health.upload_instruction')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {t('health.upload_photo')}
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {t('health.take_photo')}
                      </Button>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Uploaded sheep" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={resetAnalysis}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('health.analysis_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">{t('health.analyzing')}</p>
                    </div>
                    <Progress value={66} className="w-full" />
                  </div>
                )}

                {analysisResult && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      {analysisResult.health === 'healthy' ? (
                        <CheckCircle className="h-8 w-8 text-safe" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">
                          {analysisResult.health === 'healthy' ? t('health.healthy') : t('health.issues')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t('health.confidence')}: {analysisResult.confidence}%
                        </p>
                      </div>
                    </div>

                    {analysisResult.issues.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-destructive mb-2">{t('health.issues_found')}</h4>
                        <ul className="space-y-1">
                          {analysisResult.issues.map((issue: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">{t('health.recommendations')}:</h4>
                      <ul className="space-y-1">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-safe" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={resetAnalysis}
                    >
                      {t('health.another')}
                    </Button>
                  </div>
                )}

                {!selectedImage && !isAnalyzing && (
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('health.upload_instruction_start')}</p>
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