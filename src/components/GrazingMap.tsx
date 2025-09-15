import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Cloud, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle,
  Leaf,
  Mountain,
  Trees,
  Eye,
  Route,
  Trash2,
  Play,
  Brain
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const GrazingMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [grazingAreas, setGrazingAreas] = useState<any[]>([]);
  const [routePath, setRoutePath] = useState<L.Polyline | null>(null);
  const [userMarker, setUserMarker] = useState<L.CircleMarker | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'active' | 'offline'>('loading');
  const [config, setConfig] = useState({ herdSize: 150, planningDays: 14, season: 'summer' });
  const [zones, setZones] = useState<any[]>([]);
  const [currentRoute, setCurrentRoute] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState({ visible: false, steps: [] as any[] });

  // Backend API configuration
  const API_BASE_URL = 'http://127.0.0.1:5000';

  // Enhanced environmental data state
  const [environmentalData, setEnvironmentalData] = useState({
    zones: [] as any[],
    currentDay: 150,
    modelLoaded: false,
    lastPrediction: null as any,
    zoneUsageHistory: {} as Record<number, number>
  });

  // AI Model Configuration
  const [aiModelConfig, setAiModelConfig] = useState({
    enabled: true,
    currentZone: 0,
    herdHealth: 85,
    daysInZone: 1,
    cumulativeReward: 0
  });

  const qualityColors = {
    'excellent': '#27ae60',
    'good': '#f39c12', 
    'fair': '#e67e22',
    'poor': '#e74c3c',
    'restricted': '#95a5a6'
  };

  // Backend API functions
  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setEnvironmentalData(prev => ({ ...prev, modelLoaded: data.model_loaded }));
      setModelStatus(data.model_loaded ? 'active' : 'loading');
      console.log('Backend status:', data);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setModelStatus('offline');
    }
  };

  const loadEnvironmentalData = async (day = environmentalData.currentDay) => {
    try {
      const response = await fetch(`${API_BASE_URL}/zones/${day}`);
      const data = await response.json();
      
      const zones = data.zones.map((zone: any, index: number) => ({
        id: zone.display_id,
        lat: zone.lat,
        lng: zone.lng,
        quality: zone.quality,
        ndvi: zone.ndvi,
        name: `Zone ${zone.display_id}`,
        risk: zone.risk,
        temperature: zone.temperature,
        rainfall: zone.rainfall,
        carryingCapacity: zone.carrying_capacity,
        accessible: zone.accessible,
        accessibility: zone.accessible,
        constraints: {
          flood_risk: zone.risk === 'high',
          protected_area: false
        }
      }));
      
      setEnvironmentalData(prev => ({ ...prev, zones }));
      console.log('Environmental data loaded:', data);
    } catch (error) {
      console.error('Failed to load environmental data:', error);
      // Fallback to demo data
      loadDemoData();
    }
  };

  // Load configuration and zones from JSON files
  const loadConfiguration = async () => {
    try {
      const configResponse = await fetch('/config.json');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setConfig(configData);
      }
    } catch (error) {
      console.log('Using default configuration');
    }

    try {
      const zonesResponse = await fetch('/zones.json');
      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json();
        setZones(zonesData);
        // Convert zones format for compatibility
        const convertedZones = zonesData.map((zone: any) => ({
          id: zone.id,
          lat: zone.center[0],
          lng: zone.center[1],
          quality: zone.quality,
          ndvi: zone.ndvi,
          name: zone.name,
          risk: zone.accessible ? 'low' : 'high',
          temperature: 22,
          rainfall: 2,
          carryingCapacity: zone.ndvi * 10,
          accessible: zone.accessible,
          accessibility: zone.accessible,
          constraints: {
            flood_risk: !zone.accessible,
            protected_area: !zone.accessible
          }
        }));
        setEnvironmentalData(prev => ({ ...prev, zones: convertedZones }));
        
        // Automatically show zones when they're loaded and map is ready
        if (map) {
          showGrazingAreas();
        }
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.log('Using default zones');
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    const demoZones = [
      { id: 1, lat: 33.540, lng: -5.120, quality: 'excellent', ndvi: 0.82, name: 'North Valley', risk: 'low', temperature: 22, rainfall: 2, carryingCapacity: 8.2, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } },
      { id: 2, lat: 33.545, lng: -5.115, quality: 'excellent', ndvi: 0.75, name: 'Upper Meadow', risk: 'low', temperature: 24, rainfall: 8, carryingCapacity: 7.5, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } },
      { id: 3, lat: 33.535, lng: -5.105, quality: 'good', ndvi: 0.68, name: 'East Ridge', risk: 'low', temperature: 20, rainfall: 1, carryingCapacity: 6.8, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } },
      { id: 4, lat: 33.520, lng: -5.100, quality: 'restricted', ndvi: 0.45, name: 'South Reserve', risk: 'high', temperature: 26, rainfall: 1.5, carryingCapacity: 4.5, accessible: false, accessibility: false, constraints: { flood_risk: false, protected_area: true } },
      { id: 5, lat: 33.525, lng: -5.125, quality: 'good', ndvi: 0.58, name: 'Central Plains', risk: 'low', temperature: 21, rainfall: 2.5, carryingCapacity: 5.8, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } },
      { id: 6, lat: 33.550, lng: -5.110, quality: 'fair', ndvi: 0.35, name: 'Lower Field', risk: 'medium', temperature: 18, rainfall: 4, carryingCapacity: 3.5, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } },
      { id: 7, lat: 33.530, lng: -5.090, quality: 'excellent', ndvi: 0.72, name: 'Mountain Pasture', risk: 'low', temperature: 23, rainfall: 2, carryingCapacity: 7.2, accessible: true, accessibility: true, constraints: { flood_risk: false, protected_area: false } }
    ];
    setEnvironmentalData(prev => ({ ...prev, zones: demoZones }));
    
    // Automatically show zones when they're loaded and map is ready
    if (map) {
      showGrazingAreas();
    }
  };

  const advanceDay = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/simulate_day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_day: environmentalData.currentDay,
          selected_zone: aiModelConfig.currentZone
        })
      });

      if (!response.ok) {
        throw new Error(`Day simulation failed: ${response.status}`);
      }

      const result = await response.json();
      setEnvironmentalData(prev => ({
        ...prev,
        currentDay: result.new_day,
        zoneUsageHistory: result.zone_usage_history
      }));
      
      // Update environmental data
      await loadEnvironmentalData(result.new_day);
      
      // Refresh grazing areas if shown
      if (grazingAreas.length > 0) {
        clearGrazingAreas();
        showGrazingAreas();
      }
      
      console.log('Advanced to day:', result.new_day);
    } catch (error) {
      console.error('Failed to advance day:', error);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const mapInstance = L.map(mapRef.current).setView([33.533, -5.11], 13);

    // Add satellite tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }).addTo(mapInstance);

    setMap(mapInstance);
    
    // Wait for map to be ready before adding elements
    mapInstance.whenReady(() => {
      // Set default location after map is ready
      handleSetUserLocation(33.533, -5.11, mapInstance);
      
      // Initialize backend connection and load data
      checkBackendStatus();
      loadConfiguration();
    });

    // Set up periodic backend status checks
    const interval = setInterval(checkBackendStatus, 30000);

    return () => {
      clearInterval(interval);
      mapInstance.remove();
    };
  }, []);

  const handleSetUserLocation = (lat: number, lng: number, mapInstance?: L.Map) => {
    const currentMap = mapInstance || map;
    if (!currentMap) return;
    
    const location = { lat, lng };
    setUserLocation(location);
    
    if (userMarker) {
      currentMap.removeLayer(userMarker);
    }

    // Add user location marker with pulsing animation
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(currentMap);

    marker.bindPopup(`
      <div style="text-align: center;">
        <h4>Your Current Location</h4>
        <p>Ifrane, Morocco</p>
        <p>Shepherd Position</p>
      </div>
    `);
    
    currentMap.setView([lat, lng], 13);
    setUserMarker(marker);
    
    // Automatically show zones after setting location
    if (environmentalData.zones.length > 0) {
      showGrazingAreas(currentMap);
    }
  };

  const handleFindLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleSetUserLocation(position.coords.latitude, position.coords.longitude);
        },
        () => {
          handleSetUserLocation(33.533, -5.11);
          alert('Using default location (Ifrane). Enable location services for accurate positioning.');
        }
      );
    } else {
      handleSetUserLocation(33.533, -5.11);
      alert('Geolocation not supported. Using default location (Ifrane).');
    }
  };

  const getZoneQuality = (ndvi: number) => {
    if (ndvi >= 0.8) return 'excellent';
    if (ndvi >= 0.6) return 'good';
    if (ndvi >= 0.4) return 'fair';
    return 'poor';
  };

  const showGrazingAreas = (mapInstance?: L.Map) => {
    const currentMap = mapInstance || map;
    if (!currentMap) return;
    
    clearGrazingAreas(currentMap);
    const areas: any[] = [];
    
    environmentalData.zones.forEach(zone => {
      const quality = zone.quality || getZoneQuality(zone.ndvi);
      const color = qualityColors[quality as keyof typeof qualityColors];
      
      const circle = L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: zone.accessible ? 0.6 : 0.3,
        radius: 300,
        weight: zone.accessible ? 3 : 1,
        dashArray: zone.accessible ? undefined : '5, 5'
      }).addTo(currentMap);

      const marker = L.marker([zone.lat, zone.lng], {
        icon: L.divIcon({
          className: 'zone-marker',
          html: `<div style="
            background: ${color}; 
            color: white; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            opacity: ${zone.accessible ? 1 : 0.5};
          ">${zone.id}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(currentMap);

      const qualityText = zone.accessible ? 
        `<span style="color: ${color}; font-weight: bold;">${quality.toUpperCase()}</span>` :
        `<span style="color: ${color}; font-weight: bold;">RESTRICTED</span>`;
      
      const popupContent = `
        <div style="text-align: center; padding: 10px;">
          <h4>Zone ${zone.id}: ${zone.name}</h4>
          <div style="font-size: 16px; font-weight: bold; margin: 10px 0;">${qualityText}</div>
          <p><strong>NDVI:</strong> ${zone.ndvi.toFixed(2)}</p>
          <p><strong>Temperature:</strong> ${zone.temperature?.toFixed(1) || 'N/A'}°C</p>
          <p><strong>Rainfall:</strong> ${zone.rainfall?.toFixed(1) || 'N/A'}mm</p>
          <p><strong>Capacity:</strong> ${zone.carryingCapacity?.toFixed(1) || 'N/A'} sheep/ha</p>
          <p><strong>Status:</strong> ${zone.accessible ? '✅ Accessible' : '❌ Restricted'}</p>
          <p><strong>Risk Level:</strong> ${zone.risk || 'low'}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      circle.bindPopup(popupContent);

      areas.push({ zone, circle, marker });
    });
    
    setGrazingAreas(areas);
  };

  const clearGrazingAreas = (mapInstance?: L.Map) => {
    const currentMap = mapInstance || map;
    if (!currentMap) return;
    
    grazingAreas.forEach(area => {
      currentMap.removeLayer(area.circle);
      currentMap.removeLayer(area.marker);
    });
    setGrazingAreas([]);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateOptimalRoute = async () => {
    if (!userLocation || !map) {
      alert('Please find your location first!');
      return;
    }

    if (grazingAreas.length === 0) {
      alert('Please show grazing areas first!');
      return;
    }

    setLoading(true);

    try {
      if (routePath) {
        map.removeLayer(routePath);
      }

      const optimalSequence = await calculateOptimalRoute();
      drawRoute(optimalSequence);
      setSelectedRoute(optimalSequence);
    } catch (error) {
      console.error('Route generation failed:', error);
      alert('Failed to generate route. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalRoute = async () => {
    if (aiModelConfig.enabled && environmentalData.modelLoaded) {
      return await calculateAIOptimalRoute();
    } else {
      return calculateHeuristicRoute();
    }
  };

  const calculateAIOptimalRoute = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_zone: aiModelConfig.currentZone,
          current_day: environmentalData.currentDay,
          herd_health: aiModelConfig.herdHealth,
          days_in_zone: aiModelConfig.daysInZone,
          cumulative_reward: aiModelConfig.cumulativeReward
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      setEnvironmentalData(prev => ({ ...prev, lastPrediction: result }));

      // Get recommended zone and create route
      const recommendedZone = environmentalData.zones.find(z => z.id === result.recommended_action + 1);
      if (!recommendedZone) {
        throw new Error('Recommended zone not found');
      }

      const route = [userLocation, recommendedZone];
      
      // Add additional zones based on action probabilities
      const sortedProbs = result.action_probabilities
        .map((prob: number, index: number) => ({ prob, zone: environmentalData.zones.find(z => z.id === index + 1) }))
        .filter((item: any) => item.zone && item.zone.accessible)
        .sort((a: any, b: any) => b.prob - a.prob)
        .slice(1, 4); // Take next 3 best zones

      sortedProbs.forEach((item: any) => route.push(item.zone));
      
      return route;
    } catch (error) {
      console.error('AI route calculation failed:', error);
      return calculateHeuristicRoute();
    }
  };

  const calculateHeuristicRoute = () => {
    if (!userLocation) return [];
    
    const accessibleZones = environmentalData.zones.filter(zone => zone.accessible);
    
    const rankedZones = accessibleZones
      .map(zone => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, zone.lat, zone.lng);
        const score = (zone.ndvi * 100) - (distance * 2) - (zone.risk === 'high' ? 30 : zone.risk === 'medium' ? 15 : 0);
        return { ...zone, distance, score, quality: getZoneQuality(zone.ndvi) };
      })
      .sort((a, b) => b.score - a.score);

    const selectedZones = rankedZones.slice(0, 5);
    const orderedRoute = [userLocation];
    let currentPos = userLocation;
    let remainingZones = [...selectedZones];

    while (remainingZones.length > 0) {
      let nearestZone = remainingZones[0];
      let minDistance = calculateDistance(currentPos.lat, currentPos.lng, nearestZone.lat, nearestZone.lng);

      remainingZones.forEach(zone => {
        const dist = calculateDistance(currentPos.lat, currentPos.lng, zone.lat, zone.lng);
        if (dist < minDistance) {
          nearestZone = zone;
          minDistance = dist;
        }
      });

      orderedRoute.push(nearestZone);
      currentPos = nearestZone;
      remainingZones = remainingZones.filter(z => z.id !== nearestZone.id);
    }

    return orderedRoute;
  };

  const drawRoute = (routeSequence: any[]) => {
    if (!map) return;
    
    const latlngs = routeSequence.map(point => [point.lat, point.lng]);
    
    const path = L.polyline(latlngs, {
      color: '#ef4444',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map);

    map.fitBounds(path.getBounds(), { padding: [20, 20] });
    setRoutePath(path);
  };

  const clearMap = () => {
    if (!map) return;
    
    clearGrazingAreas();
    if (routePath) {
      map.removeLayer(routePath);
      setRoutePath(null);
    }
    setSelectedRoute(null);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-safe';
      case 'good': return 'text-caution';
      case 'fair': return 'text-orange-600';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRouteQuality = (routeSequence: any[]) => {
    const zones = routeSequence.slice(1); // Remove starting location
    if (zones.length === 0) return 'N/A';
    
    const avgNDVI = zones.reduce((sum, zone) => sum + (zone.ndvi || 0.5), 0) / zones.length;
    const accessibleCount = zones.filter(zone => zone.accessible).length;
    const lowRiskCount = zones.filter(zone => zone.risk === 'low').length;
    
    if (avgNDVI > 0.8 && accessibleCount === zones.length && lowRiskCount > zones.length * 0.7) {
      return '🌟 Excellent';
    } else if (avgNDVI > 0.6 && accessibleCount > zones.length * 0.8) {
      return '👍 Good';
    } else if (avgNDVI > 0.4) {
      return '⚠️ Fair';
    } else {
      return '❌ Poor';
    }
  };

  const getModelStatusIcon = () => {
    return <Shield className="h-4 w-4 text-green-500" />;
  };

  const getModelStatusText = () => {
    return 'AI Model: Online';
  };

  // AI route suggestion with loading simulation
  const suggestRoute = async () => {
    if (!userLocation || !map) {
      alert('Please find your location first!');
      return;
    }

    setLoading(true);
    setRouteInfo({ ...routeInfo, visible: false });

    try {
      // Clear existing route
      if (routePath) {
        map.removeLayer(routePath);
      }

      // Remove existing route markers
      map.eachLayer(layer => {
        if ((layer as any).options && (layer as any).options.icon && (layer as any).options.icon.options.className === 'route-step-marker') {
          map.removeLayer(layer);
        }
      });

      // Simulate AI processing time
      setTimeout(() => {
        const newRoute = simulateModelPrediction(config.herdSize, config.planningDays, config.season);
        setCurrentRoute(newRoute);
        drawNewRoute(newRoute);
        displayRouteInfo(newRoute);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Route generation failed:', error);
      setLoading(false);
    }
  };

  const simulateModelPrediction = (herdSize: number, days: number, season: string) => {
    const accessibleZones = environmentalData.zones.filter(z => z.accessible);
    const sortedByQuality = accessibleZones.sort((a, b) => b.ndvi - a.ndvi);
    
    let route = [];
    let currentZone = sortedByQuality[0];
    
    for (let day = 0; day < days; day++) {
      if (day % (season === 'winter' ? 2 : 3) === 0 || currentZone.ndvi < 0.4) {
        const availableZones = sortedByQuality.filter(z => z.id !== currentZone.id);
        currentZone = availableZones[Math.floor(Math.random() * Math.min(3, availableZones.length))];
      }
      
      route.push({
        day: day + 1,
        zone: currentZone.id,
        quality: currentZone.quality,
        ndvi: currentZone.ndvi,
        reason: day === 0 ? 'Starting location' : 
               currentZone.ndvi > 0.7 ? 'Excellent vegetation' :
               currentZone.ndvi > 0.5 ? 'Good vegetation' : 'Moving to better area'
      });
    }
    
    return route;
  };

  const drawNewRoute = (route: any[]) => {
    if (!map) return;

    const routeCoords = route.map(step => {
      const zone = environmentalData.zones.find(z => z.id === step.zone);
      return zone ? [zone.lat, zone.lng] as [number, number] : null;
    }).filter((coord): coord is [number, number] => coord !== null);

    if (routeCoords.length > 0) {
      const polyline = L.polyline(routeCoords, {
        color: '#2980b9',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(map);
      
      setRoutePath(polyline);

      // Add route step markers
      route.forEach((step, index) => {
        if (index < route.length - 1) {
          const zone = environmentalData.zones.find(z => z.id === step.zone);
          if (zone) {
            L.marker([zone.lat, zone.lng], {
              icon: L.divIcon({
                className: 'route-step-marker',
                html: `<div style="
                  background: #2980b9; 
                  color: white; 
                  border-radius: 50%; 
                  width: 20px; 
                  height: 20px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  font-size: 10px;
                  font-weight: bold;
                  border: 2px solid white;
                ">${step.day}</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            }).addTo(map);
          }
        }
      });

      map.fitBounds(L.latLngBounds(routeCoords), { padding: [20, 20] });
    }
  };

  const displayRouteInfo = (route: any[]) => {
    const displaySteps = route.slice(0, 7);
    setRouteInfo({
      visible: true,
      steps: displaySteps
    });
  };

  const resetView = () => {
    if (!map) return;
    
    map.setView([33.533, -5.11], 13);
    
    if (routePath) {
      map.removeLayer(routePath);
      setRoutePath(null);
    }
    
    // Remove route markers
    map.eachLayer(layer => {
      if ((layer as any).options && (layer as any).options.icon && (layer as any).options.icon.options.className === 'route-step-marker') {
        map.removeLayer(layer);
      }
    });
    
    setRouteInfo({ visible: false, steps: [] });
    setCurrentRoute([]);
  };

  return (
    <div className="h-full flex" style={{ 
      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-foreground)) 100%)' 
    }}>
      {/* Sidebar */}
      <div className="w-96 bg-background/95 backdrop-blur-md p-5 overflow-y-auto shadow-2xl border-r">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-1">🐑 AI Shepherd</h1>
          <p className="text-sm text-muted-foreground">Intelligent Grazing Route Optimization</p>
        </div>

        {/* AI Route Optimization Panel */}
        <Card className="mb-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">AI Route Optimization</CardTitle>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded border-l-4 border-primary">
                <span className="text-xs font-medium text-muted-foreground">Herd Size:</span>
                <span className="text-xs font-semibold">{config.herdSize} sheep</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded border-l-4 border-primary">
                <span className="text-xs font-medium text-muted-foreground">Planning Period:</span>
                <span className="text-xs font-semibold">{config.planningDays} days</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded border-l-4 border-primary">
                <span className="text-xs font-medium text-muted-foreground">Season:</span>
                <span className="text-xs font-semibold capitalize">{config.season}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={suggestRoute} className="w-full" disabled={loading}>
              {loading ? 'Suggesting Route...' : 'Suggest Route'}
            </Button>
            <Button onClick={() => showGrazingAreas()} variant="outline" className="w-full">
              Show/Update Zones
            </Button>
            <Button onClick={resetView} variant="outline" className="w-full">
              Reset View
            </Button>
          </CardContent>
        </Card>

        {/* Zone Quality Legend */}
        <Card className="mb-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Zone Quality Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#27ae60' }}></div>
              <span className="text-xs">Excellent (NDVI: 0.7-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#f39c12' }}></div>
              <span className="text-xs">Good (NDVI: 0.5-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#e67e22' }}></div>
              <span className="text-xs">Fair (NDVI: 0.3-0.5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#e74c3c' }}></div>
              <span className="text-xs">Poor (NDVI: 0.2-0.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded" style={{ background: '#95a5a6' }}></div>
              <span className="text-xs">Restricted</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="mb-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold">Ifrane, Morocco</span>
              </div>
              <div className="flex justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground">Weather</span>
                <span className="font-semibold">22°C, Clear</span>
              </div>
              <div className="flex justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground">Available Zones</span>
                <span className="font-semibold">{environmentalData.zones.filter(z => z.accessible).length}/{environmentalData.zones.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Zone</span>
                <span className="font-semibold">
                  {environmentalData.zones.length > 0 
                    ? `Zone ${environmentalData.zones.filter(z => z.accessible).sort((a, b) => b.ndvi - a.ndvi)[0]?.id} (NDVI: ${environmentalData.zones.filter(z => z.accessible).sort((a, b) => b.ndvi - a.ndvi)[0]?.ndvi.toFixed(2)})`
                    : 'Loading...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Zones - Preserved functionality */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Nearby Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {environmentalData.zones.length === 0 ? (
                <p className="text-xs text-muted-foreground">Loading zones...</p>
              ) : (
                environmentalData.zones.map(zone => (
                  <div key={zone.id} className="p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ background: qualityColors[zone.quality as keyof typeof qualityColors] }}
                      ></div>
                      <div className="flex-1">
                        <strong className="text-xs">Zone {zone.id}: {zone.name}</strong>
                        <div className="text-xs text-muted-foreground">
                          NDVI: {zone.ndvi.toFixed(2)} | {zone.quality} | {zone.temperature?.toFixed(1) || 'N/A'}°C
                        </div>
                        <div className="text-xs">
                          <span className={zone.accessible ? 'text-green-600' : 'text-red-600'}>
                            {zone.accessible ? '✓ Accessible' : '✗ Restricted'}
                          </span>
                          {' | '}
                          <span className={zone.risk === 'low' ? 'text-green-600' : zone.risk === 'medium' ? 'text-yellow-600' : 'text-red-600'}>
                            {zone.risk === 'low' ? '🟢 Low Risk' : zone.risk === 'medium' ? '🟡 Medium Risk' : '🔴 High Risk'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-[1000] rounded-xl">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {/* Route Info Panel */}
        {routeInfo.visible && (
          <div className="absolute top-5 right-5 bg-background/95 backdrop-blur-md p-4 rounded-xl shadow-xl max-w-xs z-[1000] border">
            <h4 className="text-sm font-semibold text-foreground mb-3">🎯 Suggested Route</h4>
            <div className="space-y-2">
              {routeInfo.steps.map((step, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-xs">
                  <span>Day {step.day}: Zone {step.zone}</span>
                  <span style={{ color: qualityColors[step.quality] }} className="font-medium">
                    {step.quality}
                  </span>
                </div>
              ))}
              {currentRoute.length > 7 && (
                <div className="text-center text-xs text-muted-foreground">
                  +{currentRoute.length - 7} more days...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};