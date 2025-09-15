from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import pandas as pd
import os
from datetime import datetime, timedelta
import json
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Global variables
model = None
model_loaded = False
env_data = None

class SimpleNetwork(nn.Module):
    """Recreate the exact same network architecture from your training code"""
    def __init__(self, state_dim, action_dim, hidden_dim=32):
        super(SimpleNetwork, self).__init__()

        # Must match your training code exactly
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU()
        )

        self.actor = nn.Linear(hidden_dim // 2, action_dim)
        self.critic = nn.Linear(hidden_dim // 2, 1)

    def forward(self, state):
        features = self.shared(state)
        return features

    def get_action_probs(self, state):
        features = self.forward(state)
        logits = self.actor(features)
        return F.softmax(logits, dim=-1)

    def get_value(self, state):
        features = self.forward(state)
        return self.critic(features)


class EnvironmentalDataManager:
    """Manages environmental data similar to the testing system"""
    
    def __init__(self, data_folder='grazing_data'):
        self.data_folder = data_folder
        self.constraints = None
        self.vegetation_df = None
        self.weather_df = None
        self.zone_usage_history = {}
        self.load_or_generate_data()
        
    def load_or_generate_data(self):
        """Load data or generate if missing, matching your testing system"""
        try:
            # Try to load actual data
            with open(f'{self.data_folder}/grazing_constraints.json', 'r') as f:
                self.constraints = json.load(f)
            
            self.vegetation_df = pd.read_csv(f'{self.data_folder}/vegetation_data.csv')
            self.vegetation_df['date'] = pd.to_datetime(self.vegetation_df['date'])
            
            self.weather_df = pd.read_csv(f'{self.data_folder}/weather_data.csv')
            self.weather_df['date'] = pd.to_datetime(self.weather_df['date'])
            
            print("✅ Environmental data loaded from files")
            
        except Exception as e:
            print(f"⚠️ Could not load data files, generating realistic data: {e}")
            self.generate_realistic_data()
    
    def generate_realistic_data(self):
        """Generate realistic environmental data matching your model's expectations"""
        # Constraints from your training system
        self.constraints = {
            "zone_restrictions": {
                "protected_areas": [],
                "seasonal_closures": {},
                "weather_based": {
                    "flood_prone": {"zones": [9], "trigger": "rainfall > 25mm"}
                }
            },
            "carrying_capacity_limits": {
                "max_consecutive_days": 14,
                "recovery_period_days": 3
            }
        }
        
        # Generate dates (weekly data for past year + future)
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 12, 31)
        dates = pd.date_range(start_date, end_date, freq='W')
        
        # Generate vegetation data with seasonal patterns
        veg_data = []
        for date in dates:
            day_of_year = date.timetuple().tm_yday
            # Seasonal NDVI pattern - higher in spring/summer, lower in winter
            seasonal_factor = 0.3 + 0.4 * (1 + np.cos(2 * np.pi * (day_of_year - 120) / 365)) / 2
            
            for zone in range(1, 11):  # 10 zones
                # Different base quality for different zones
                if zone == 9:  # Flood prone zone
                    base_ndvi = 0.2 + np.random.normal(0, 0.05)
                elif zone in [1, 4, 6]:  # High quality zones
                    base_ndvi = 0.7 + seasonal_factor + np.random.normal(0, 0.1)
                elif zone in [5, 8, 10]:  # Poor quality zones  
                    base_ndvi = 0.3 + seasonal_factor * 0.5 + np.random.normal(0, 0.08)
                else:  # Medium quality zones
                    base_ndvi = 0.5 + seasonal_factor * 0.8 + np.random.normal(0, 0.1)
                
                ndvi = max(0.15, min(0.95, base_ndvi))
                
                veg_data.append({
                    'date': date,
                    'zone_id': zone,
                    'ndvi': ndvi,
                    'biomass_kg_per_hectare': ndvi * 1200,
                    'carrying_capacity_sheep_per_hectare': ndvi * 12,
                    'accessible': np.random.random() > 0.05  # 95% usually accessible
                })
        
        self.vegetation_df = pd.DataFrame(veg_data)
        
        # Generate weather data with realistic patterns
        weather_data = []
        for date in dates:
            day_of_year = date.timetuple().tm_yday
            # Seasonal temperature pattern
            base_temp = 18 + 8 * np.cos(2 * np.pi * (day_of_year - 200) / 365)
            temperature = base_temp + np.random.normal(0, 4)
            
            # Seasonal rainfall pattern (more in winter/spring)
            seasonal_rain_factor = 1.5 + 0.8 * np.cos(2 * np.pi * (day_of_year - 60) / 365)
            rainfall = max(0, np.random.exponential(3) * seasonal_rain_factor)
            
            weather_data.append({
                'date': date,
                'temperature': temperature,
                'humidity': 65 + np.random.normal(0, 15),
                'rainfall': rainfall
            })
        
        self.weather_df = pd.DataFrame(weather_data)
        print("✅ Generated realistic environmental data")
    
    def get_zone_quality(self, zone_id, current_date):
        """Get zone quality for a specific date, matching your testing system"""
        # Find closest vegetation data
        veg_data = self.vegetation_df[
            (self.vegetation_df['zone_id'] == zone_id + 1) &
            (abs((self.vegetation_df['date'] - current_date).dt.days) <= 7)
        ]
        
        if len(veg_data) > 0:
            veg_row = veg_data.iloc[0]
            ndvi = veg_row['ndvi']
            carrying_capacity = veg_row['carrying_capacity_sheep_per_hectare']
            accessible = veg_row['accessible']
        else:
            # Fallback values
            ndvi = 0.6
            carrying_capacity = 7.0
            accessible = True
        
        # Find closest weather data
        weather_data = self.weather_df[
            abs((self.weather_df['date'] - current_date).dt.days) <= 3
        ]
        
        if len(weather_data) > 0:
            weather_row = weather_data.iloc[0]
            temperature = weather_row['temperature']
            rainfall = weather_row['rainfall']
            humidity = weather_row['humidity']
        else:
            temperature = 18
            rainfall = 2
            humidity = 65
        
        # Determine quality categories
        if not accessible:
            quality = 'restricted'
            risk = 'high'
        elif ndvi < 0.3:
            quality = 'poor'
            risk = 'high'
        elif ndvi < 0.5:
            quality = 'fair' 
            risk = 'medium'
        elif ndvi < 0.7:
            quality = 'good'
            risk = 'low'
        else:
            quality = 'excellent'
            risk = 'low'
        
        # Check for flood risk
        if (zone_id + 1) in self.constraints["zone_restrictions"]["weather_based"]["flood_prone"]["zones"]:
            if rainfall > 25:
                quality = 'restricted'
                risk = 'high'
        
        return {
            'ndvi': ndvi,
            'carrying_capacity': carrying_capacity,
            'temperature': temperature,
            'rainfall': rainfall,
            'humidity': humidity,
            'quality': quality,
            'risk': risk,
            'accessible': accessible and quality != 'restricted'
        }
    
    def get_all_zones_data(self, current_date):
        """Get data for all zones at current date"""
        zones_data = []
        for zone_id in range(10):
            zone_data = self.get_zone_quality(zone_id, current_date)
            zone_data['zone_id'] = zone_id
            zones_data.append(zone_data)
        return zones_data
    
    def is_zone_accessible(self, zone_id, current_date):
        """Check if zone is accessible with constraints"""
        zone_quality = self.get_zone_quality(zone_id, current_date)
        
        if not zone_quality['accessible']:
            return False, "Environmental restrictions", -20
        
        # Check flood risk
        if ((zone_id + 1) in self.constraints["zone_restrictions"]["weather_based"]["flood_prone"]["zones"] and
            zone_quality["rainfall"] > 25):
            return False, "Flood risk", -20
        
        # Check consecutive days limit
        max_days = self.constraints["carrying_capacity_limits"]["max_consecutive_days"]
        if zone_id in self.zone_usage_history:
            if self.zone_usage_history[zone_id] >= max_days:
                return False, "Needs recovery period", -10
        
        return True, "Accessible", 0
    
    def build_state_vector(self, current_zone, current_day, herd_health, days_in_zone, cumulative_reward=0):
        """Build state vector exactly as your model expects"""
        current_date = datetime(2024, 1, 1) + timedelta(days=current_day)
        zone_quality = self.get_zone_quality(current_zone, current_date)
        
        return [
            current_zone / 9.0,  # Current zone (0-1)
            current_day / 365.0,  # Day of year (0-1)
            min(max(zone_quality['temperature'] / 30.0, 0), 1),  # Temperature (0-1)
            min(zone_quality['rainfall'] / 30.0, 1),  # Rainfall (0-1)
            zone_quality['ndvi'],  # Vegetation quality (0-1)
            min(zone_quality['carrying_capacity'] / 15.0, 1),  # Capacity (0-1)
            herd_health / 100.0,  # Herd health (0-1)
            min(days_in_zone / 20.0, 1),  # Days in zone (0-1)
            min(max(cumulative_reward / 500.0, -1), 1),  # Cumulative reward (-1 to 1)
            min(len(self.zone_usage_history) / 10.0, 1),  # Zone diversity (0-1)
            np.sin(2 * np.pi * current_day / 365),  # Seasonal cycle
            (current_day % 7) / 7.0  # Week cycle
        ]


def load_model():
    """Load the trained model"""
    global model, model_loaded

    model_path = 'simple_model_final.pth'

    if not os.path.exists(model_path):
        print(f"❌ Model file '{model_path}' not found!")
        print("Make sure you have:")
        print("1. Trained your model and saved it as 'simple_model_final.pth'")
        print("2. Placed the model file in the same directory as this server")
        model_loaded = False
        return False

    try:
        # Create model with same parameters as training
        model = SimpleNetwork(state_dim=12, action_dim=10, hidden_dim=32)

        # Load the saved state
        checkpoint = torch.load("simple_model_final.pth", map_location="cpu", weights_only=False)

        # Handle different save formats
        if isinstance(checkpoint, dict) and 'policy_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['policy_state_dict'])
            print("✅ Loaded model from checkpoint format")
        else:
            model.load_state_dict(checkpoint)
            print("✅ Loaded model from direct state_dict format")

        model.eval()  # Set to evaluation mode
        model_loaded = True

        print("🎯 Model loaded successfully!")
        return True

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model_loaded = False
        return False


def predict_action(state_vector):
    """Use the trained model to predict the best action"""
    global model

    if not model_loaded or model is None:
        raise Exception("Model not loaded")

    try:
        # Convert to tensor
        state_tensor = torch.tensor(state_vector, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            # Get action probabilities
            action_probs = model.get_action_probs(state_tensor)
            state_value = model.get_value(state_tensor)

            # Get the recommended action (highest probability)
            recommended_action = torch.argmax(action_probs, dim=1).item()
            confidence = action_probs[0][recommended_action].item()

            return {
                'recommended_action': int(recommended_action),
                'confidence': float(confidence),
                'action_probabilities': [float(x) for x in action_probs[0].tolist()],
                'state_value': float(state_value.item()),
                'expected_reward': float(state_value.item())
            }

    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")


# Initialize environmental data manager
env_data = EnvironmentalDataManager()

# Routes
@app.route('/')
def home():
    """Serve the enhanced interface"""
    # Your existing HTML with some modifications will go here
    # For brevity, I'll include the key JavaScript changes below
    return render_template_string(get_enhanced_html())

@app.route('/status')
def status():
    """Health + model status endpoint"""
    global model_loaded, env_data
    info = {
        'model_loaded': bool(model_loaded),
        'env_data_loaded': env_data is not None,
        'timestamp': datetime.utcnow().isoformat() + 'Z',
    }
    if model_loaded:
        info['model_info'] = {
            'state_dim': 12,
            'action_dim': 10,
            'hidden_dim': 32,
        }
    return jsonify(info), 200

@app.route('/zones/<int:current_day>')
def get_zones_data(current_day):
    """Get current environmental data for all zones"""
    try:
        current_date = datetime(2024, 1, 1) + timedelta(days=current_day)
        zones_data = env_data.get_all_zones_data(current_date)
        
        # Add geographical coordinates (you can adjust these)
        coordinates = [
            {"lat": 33.533, "lng": -5.11},
            {"lat": 33.535, "lng": -5.105},
            {"lat": 33.537, "lng": -5.115},
            {"lat": 33.539, "lng": -5.108},
            {"lat": 33.541, "lng": -5.112},
            {"lat": 33.531, "lng": -5.102},
            {"lat": 33.529, "lng": -5.118},
            {"lat": 33.543, "lng": -5.105},
            {"lat": 33.527, "lng": -5.108},
            {"lat": 33.545, "lng": -5.118}
        ]
        
        for i, zone in enumerate(zones_data):
            zone.update(coordinates[i])
            zone['display_id'] = i + 1
        
        return jsonify({
            'zones': zones_data,
            'current_date': current_date.isoformat(),
            'weather_summary': {
                'avg_temp': np.mean([z['temperature'] for z in zones_data]),
                'avg_rainfall': np.mean([z['rainfall'] for z in zones_data])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Enhanced prediction endpoint with environmental context"""
    try:
        if not model_loaded:
            load_model()
        if not model_loaded:
            return jsonify({'error': 'Model not loaded'}), 503

        data = request.get_json() or {}
        
        # Extract parameters
        current_zone = data.get('current_zone', 0)
        current_day = data.get('current_day', 150)
        herd_health = data.get('herd_health', 85.0)
        days_in_zone = data.get('days_in_zone', 1)
        cumulative_reward = data.get('cumulative_reward', 0.0)
        
        # Build state vector using environmental data
        state_vector = env_data.build_state_vector(
            current_zone, current_day, herd_health, days_in_zone, cumulative_reward
        )
        
        # Get prediction
        result = predict_action(state_vector)
        
        # Add environmental context
        current_date = datetime(2024, 1, 1) + timedelta(days=current_day)
        recommended_zone_quality = env_data.get_zone_quality(result['recommended_action'], current_date)
        current_zone_quality = env_data.get_zone_quality(current_zone, current_date)
        
        # Check accessibility
        accessible, reason, penalty = env_data.is_zone_accessible(result['recommended_action'], current_date)
        
        result.update({
            'environmental_context': {
                'current_zone_quality': current_zone_quality,
                'recommended_zone_quality': recommended_zone_quality,
                'accessible': accessible,
                'accessibility_reason': reason,
                'date': current_date.isoformat()
            },
            'state_vector_used': state_vector,
            'meta': {
                'received_at': datetime.utcnow().isoformat() + 'Z'
            }
        })
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/simulate_day', methods=['POST'])
def simulate_day():
    """Simulate moving to next day with environmental changes"""
    try:
        data = request.get_json() or {}
        current_day = data.get('current_day', 150)
        selected_zone = data.get('selected_zone', 0)
        
        # Update zone usage history
        env_data.zone_usage_history[selected_zone] = env_data.zone_usage_history.get(selected_zone, 0) + 1
        
        # Calculate new day and get updated environmental conditions
        new_day = (current_day + 1) % 365
        new_date = datetime(2024, 1, 1) + timedelta(days=new_day)
        
        zones_data = env_data.get_all_zones_data(new_date)
        
        return jsonify({
            'new_day': new_day,
            'new_date': new_date.isoformat(),
            'zones': zones_data,
            'zone_usage_history': dict(env_data.zone_usage_history)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_enhanced_html():
    """Return enhanced HTML with environmental data integration"""
    # This would be your enhanced HTML - for brevity, I'm showing the key changes
    return '''
    <!-- Your existing HTML head and body structure -->
    <!-- Key JavaScript changes: -->
    <script>
        // Enhanced variables to track environmental state
        let environmentalData = null;
        let currentDay = 150;
        let zoneUsageHistory = {};
        
        // Load environmental data for current day
        async function loadEnvironmentalData(day = currentDay) {
            try {
                const response = await fetch(`/zones/${day}`);
                const data = await response.json();
                environmentalData = data;
                updateZoneDisplay(data.zones);
                updateWeatherInfo(data.weather_summary);
            } catch (error) {
                console.error('Error loading environmental data:', error);
            }
        }
        
        // Update zone circles with real environmental data
        function updateZoneDisplay(zones) {
            // Clear existing circles
            zoneCircles.forEach(circle => map.removeLayer(circle));
            zoneCircles = [];
            
            zones.forEach((zone, index) => {
                let color, fillColor, fillOpacity;
                
                // Use actual quality from environmental data
                switch(zone.quality) {
                    case 'excellent':
                        color = '#28a745';
                        fillOpacity = 0.4;
                        break;
                    case 'good':
                        color = '#28a745';
                        fillOpacity = 0.25;
                        break;
                    case 'fair':
                        color = '#ffc107';
                        fillOpacity = 0.3;
                        break;
                    case 'poor':
                        color = '#fd7e14';
                        fillOpacity = 0.3;
                        break;
                    case 'restricted':
                        color = '#dc3545';
                        fillOpacity = 0.4;
                        break;
                }
                
                const circle = L.circle([zone.lat, zone.lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: fillOpacity,
                    radius: 200
                }).addTo(map);
                
                // Enhanced popup with real data
                circle.bindPopup(`
                    <div style="text-align: center;">
                        <h4>Zone ${zone.display_id} ${zone.risk === 'high' ? '⚠️' : zone.risk === 'medium' ? '⚡' : '✅'}</h4>
                        <p><strong>Quality:</strong> ${zone.quality}</p>
                        <p><strong>NDVI:</strong> ${zone.ndvi.toFixed(2)}</p>
                        <p><strong>Temperature:</strong> ${zone.temperature.toFixed(1)}°C</p>
                        <p><strong>Rainfall:</strong> ${zone.rainfall.toFixed(1)}mm</p>
                        <p><strong>Carrying Capacity:</strong> ${zone.carrying_capacity.toFixed(1)} sheep/ha</p>
                        ${!zone.accessible ? '<p style="color: red;"><strong>⚠️ RESTRICTED ACCESS</strong></p>' : ''}
                    </div>
                `);
                
                zoneCircles.push(circle);
            });
        }
        
        // Enhanced prediction function with environmental context
        async function getPrediction() {
            try {
                document.getElementById('predict-btn').disabled = true;
                document.getElementById('predict-btn').textContent = 'Processing...';
                
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        current_zone: currentZone,
                        current_day: currentDay,
                        herd_health: herdHealth,
                        days_in_zone: daysInZone,
                        cumulative_reward: cumulativeReward
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                
                const result = await response.json();
                displayEnhancedPrediction(result);
                
            } catch (error) {
                console.error('Prediction error:', error);
                // Error handling
            } finally {
                document.getElementById('predict-btn').disabled = false;
                document.getElementById('predict-btn').textContent = 'Get AI Recommendation';
            }
        }
        
        // Display prediction with environmental context
        function displayEnhancedPrediction(result) {
            const env_ctx = result.environmental_context;
            const current_quality = env_ctx.current_zone_quality;
            const recommended_quality = env_ctx.recommended_zone_quality;
            
            document.getElementById('route-suggestions').style.display = 'block';
            document.getElementById('prediction-result').innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <h4>Recommended Zone: ${result.recommended_action + 1}</h4>
                    <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>Expected Reward:</strong> ${result.expected_reward.toFixed(1)}</p>
                    <p><strong>Accessibility:</strong> ${env_ctx.accessible ? '✅ Accessible' : '❌ ' + env_ctx.accessibility_reason}</p>
                </div>
                <div class="route-step">
                    <span class="step-zone">Current: Zone ${currentZone + 1}</span>
                    <span class="step-quality quality-${current_quality.quality}">
                        NDVI: ${current_quality.ndvi.toFixed(2)}, ${current_quality.temperature.toFixed(1)}°C
                    </span>
                </div>
                <div class="route-step">
                    <span class="step-zone">→ Recommended: Zone ${result.recommended_action + 1}</span>
                    <span class="step-quality quality-${recommended_quality.quality}">
                        NDVI: ${recommended_quality.ndvi.toFixed(2)}, ${recommended_quality.temperature.toFixed(1)}°C
                    </span>
                </div>
            `;
            
            // Update route visualization
            updateRouteVisualization(result);
        }
        
        // Simulate advancing to next day
        async function advanceDay() {
            try {
                const response = await fetch('/simulate_day', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        current_day: currentDay,
                        selected_zone: currentZone
                    })
                });
                
                const result = await response.json();
                currentDay = result.new_day;
                zoneUsageHistory = result.zone_usage_history;
                
                // Update display
                document.getElementById('current-day').textContent = `Day ${currentDay}`;
                updateZoneDisplay(result.zones);
                
            } catch (error) {
                console.error('Error advancing day:', error);
            }
        }
        
        // Initialize with environmental data
        document.addEventListener('DOMContentLoaded', function() {
            initMap();
            loadEnvironmentalData();
            checkServerStatus();
            setInterval(checkServerStatus, 5000);
        });
    </script>
    '''

if __name__ == '__main__':
    # Load model and initialize
    load_model()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)