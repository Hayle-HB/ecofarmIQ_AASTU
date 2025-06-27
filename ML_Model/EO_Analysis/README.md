# Earth Observation (EO) Data Analysis Module

## Overview

This module provides comprehensive analysis tools for processing and analyzing Earth Observation data for agricultural monitoring. It includes components for analyzing temperature, humidity, rainfall, weather forecasts, and vegetation indices.

## Features

### 1. Temperature Analysis

- Temporal trend analysis
- Anomaly detection
- Daily/weekly/monthly statistics
- Heat stress analysis for crops

### 2. Humidity Analysis

- Pattern recognition
- Seasonal decomposition
- Correlation with other variables
- Dew point calculation

### 3. Rainfall Analysis

- Precipitation patterns
- Extreme event detection
- Drought indices
- Seasonal distribution

### 4. Weather Forecast Analysis

- Forecast accuracy assessment
- Bias correction
- Skill score calculation
- Ensemble forecast processing

### 5. Vegetation Analysis

- NDVI (Normalized Difference Vegetation Index)
- EVI (Enhanced Vegetation Index)
- NDWI (Normalized Difference Water Index)
- Time series analysis

## Directory Structure

```
EO_Analysis/
├── __init__.py
├── eo_analysis.py        # Main analysis module
├── requirements.txt      # Dependencies
├── utils/
│   ├── __init__.py
│   ├── preprocessing.py  # Data preprocessing utilities
│   ├── visualization.py  # Plotting functions
│   └── validation.py     # Data validation tools
...

```

## Installation

1. Create a virtual environment:

```bash
python -m venv eo_env
source eo_env/bin/activate  # Linux/Mac
eo_env\Scripts\activate     # Windows
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage Example

```python
from eo_analysis import EODataAnalyzer

# Initialize analyzer
analyzer = EODataAnalyzer(data_path="path/to/eo_data")

# Analyze temperature trends
temp_results = analyzer.temp_analyzer.analyze_temperature_trends(temp_data)

# Analyze humidity patterns
humidity_results = analyzer.humidity_analyzer.analyze_humidity_patterns(humidity_data)

# Analyze rainfall patterns
rainfall_results = analyzer.rainfall_analyzer.analyze_rainfall_patterns(rainfall_data)

# Analyze forecast accuracy
forecast_results = analyzer.forecast_analyzer.analyze_forecast_accuracy(
    forecast_data,
    actual_data
)

# Calculate vegetation indices
veg_indices = analyzer.vegetation_analyzer.calculate_vegetation_indices(satellite_data)
```

## Data Format Requirements

### Temperature Data

- Time series data in CSV or NetCDF format
- Required columns: timestamp, temperature
- Optional: location_id, sensor_id

### Humidity Data

- Time series data in CSV or NetCDF format
- Required columns: timestamp, relative_humidity
- Optional: temperature, dew_point

### Rainfall Data

- Time series data in CSV or NetCDF format
- Required columns: timestamp, precipitation
- Optional: intensity, duration

### Satellite Data

- NetCDF or GeoTIFF format
- Required bands: NIR, Red, Blue (for NDVI/EVI)
- Optional: SWIR (for NDWI)

## Output Formats

### Analysis Results

- JSON or CSV format
- Statistical summaries
- Time series predictions
- Anomaly detection results

### Visualizations

- PNG/PDF plots
- Interactive HTML plots (optional)
- GeoTIFF for spatial analyses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
