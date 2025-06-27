"""
EO (Earth Observation) Data Analysis Module
-----------------------------------------
This module provides comprehensive analysis tools for processing and analyzing
Earth Observation data related to agricultural monitoring.

Key Features:
- Temperature analysis (temporal and spatial)
- Humidity patterns and anomaly detection
- Rainfall analysis and prediction
- Weather forecast integration
- Vegetation indices calculation
- Soil moisture analysis
"""

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
import xarray as xr
import rasterio
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple, Optional, Union
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EODataAnalyzer:
    """Main class for EO data analysis"""
    
    def __init__(self, data_path: str):
        """
        Initialize the EO Data Analyzer
        
        Args:
            data_path (str): Path to the EO data directory
        """
        self.data_path = data_path
        self.scaler = StandardScaler()
        self._initialize_analysis_components()
    
    def _initialize_analysis_components(self):
        """Initialize all analysis components"""
        self.temp_analyzer = TemperatureAnalyzer()
        self.humidity_analyzer = HumidityAnalyzer()
        self.rainfall_analyzer = RainfallAnalyzer()
        self.forecast_analyzer = ForecastAnalyzer()
        self.vegetation_analyzer = VegetationAnalyzer()
        
class TemperatureAnalyzer:
    """Temperature data analysis component"""
    
    def analyze_temperature_trends(
        self, 
        temp_data: pd.DataFrame,
        time_window: str = 'D'
    ) -> Dict[str, Union[float, pd.Series]]:
        """
        Analyze temperature trends over time
        
        Args:
            temp_data: DataFrame with temperature readings
            time_window: Resampling time window ('D' for daily, 'W' for weekly)
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Resample and calculate statistics
            daily_stats = temp_data.resample(time_window).agg({
                'temp': ['mean', 'min', 'max', 'std']
            })
            
            # Calculate trends
            trend = stats.linregress(
                np.arange(len(daily_stats)),
                daily_stats['temp']['mean']
            )
            
            # Detect anomalies
            anomalies = self._detect_temperature_anomalies(temp_data)
            
            return {
                'trend_slope': trend.slope,
                'trend_p_value': trend.pvalue,
                'daily_stats': daily_stats,
                'anomalies': anomalies
            }
        except Exception as e:
            logger.error(f"Error in temperature analysis: {str(e)}")
            raise
    
    def _detect_temperature_anomalies(
        self,
        temp_data: pd.DataFrame,
        contamination: float = 0.1
    ) -> pd.Series:
        """
        Detect anomalies in temperature data using Isolation Forest
        
        Args:
            temp_data: Temperature data
            contamination: Expected proportion of outliers
            
        Returns:
            Series indicating anomalous points
        """
        model = IsolationForest(contamination=contamination)
        return pd.Series(
            model.fit_predict(temp_data),
            index=temp_data.index
        )

class HumidityAnalyzer:
    """Humidity data analysis component"""
    
    def analyze_humidity_patterns(
        self,
        humidity_data: pd.DataFrame,
        correlation_threshold: float = 0.7
    ) -> Dict[str, Union[pd.DataFrame, List[str]]]:
        """
        Analyze humidity patterns and their relationships
        
        Args:
            humidity_data: DataFrame with humidity readings
            correlation_threshold: Threshold for correlation analysis
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Calculate daily patterns
            daily_patterns = self._calculate_daily_patterns(humidity_data)
            
            # Analyze seasonal components
            seasonal_decomposition = self._decompose_seasonal_patterns(
                humidity_data
            )
            
            # Find correlations with other variables
            correlations = self._analyze_humidity_correlations(
                humidity_data,
                correlation_threshold
            )
            
            return {
                'daily_patterns': daily_patterns,
                'seasonal_components': seasonal_decomposition,
                'correlations': correlations
            }
        except Exception as e:
            logger.error(f"Error in humidity analysis: {str(e)}")
            raise
    
    def _calculate_daily_patterns(
        self,
        humidity_data: pd.DataFrame
    ) -> pd.DataFrame:
        """Calculate daily humidity patterns"""
        return humidity_data.groupby(
            humidity_data.index.hour
        ).agg(['mean', 'std'])
    
    def _decompose_seasonal_patterns(
        self,
        humidity_data: pd.DataFrame
    ) -> Dict[str, pd.Series]:
        """Decompose humidity data into seasonal components"""
        from statsmodels.tsa.seasonal import seasonal_decompose
        
        decomposition = seasonal_decompose(
            humidity_data,
            period=24,  # 24 hours for daily seasonality
            extrapolate_trend=True
        )
        
        return {
            'trend': decomposition.trend,
            'seasonal': decomposition.seasonal,
            'residual': decomposition.resid
        }

class RainfallAnalyzer:
    """Rainfall data analysis component"""
    
    def analyze_rainfall_patterns(
        self,
        rainfall_data: pd.DataFrame,
        return_period: int = 10
    ) -> Dict[str, Union[float, pd.Series]]:
        """
        Analyze rainfall patterns and extreme events
        
        Args:
            rainfall_data: DataFrame with rainfall measurements
            return_period: Return period for extreme event analysis
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Calculate rainfall statistics
            rainfall_stats = self._calculate_rainfall_statistics(rainfall_data)
            
            # Analyze extreme events
            extreme_events = self._analyze_extreme_events(
                rainfall_data,
                return_period
            )
            
            # Calculate drought indices
            drought_indices = self._calculate_drought_indices(rainfall_data)
            
            return {
                'statistics': rainfall_stats,
                'extreme_events': extreme_events,
                'drought_indices': drought_indices
            }
        except Exception as e:
            logger.error(f"Error in rainfall analysis: {str(e)}")
            raise
    
    def _calculate_rainfall_statistics(
        self,
        rainfall_data: pd.DataFrame
    ) -> Dict[str, float]:
        """Calculate basic rainfall statistics"""
        return {
            'total_rainfall': rainfall_data.sum(),
            'max_daily': rainfall_data.resample('D').sum().max(),
            'rainy_days': (rainfall_data > 0).sum(),
            'dry_days': (rainfall_data == 0).sum()
        }
    
    def _analyze_extreme_events(
        self,
        rainfall_data: pd.DataFrame,
        return_period: int
    ) -> Dict[str, Union[float, pd.Series]]:
        """Analyze extreme rainfall events"""
        # Calculate return levels
        sorted_rainfall = rainfall_data.sort_values(ascending=False)
        return_level = sorted_rainfall.iloc[
            int(len(rainfall_data) / return_period)
        ]
        
        # Identify extreme events
        extreme_events = rainfall_data[rainfall_data > return_level]
        
        return {
            'return_level': return_level,
            'extreme_events': extreme_events
        }

class ForecastAnalyzer:
    """Weather forecast analysis component"""
    
    def analyze_forecast_accuracy(
        self,
        forecast_data: pd.DataFrame,
        actual_data: pd.DataFrame,
        forecast_horizon: int = 7
    ) -> Dict[str, Union[float, pd.DataFrame]]:
        """
        Analyze weather forecast accuracy
        
        Args:
            forecast_data: DataFrame with forecast data
            actual_data: DataFrame with actual measurements
            forecast_horizon: Forecast horizon in days
            
        Returns:
            Dictionary containing accuracy metrics
        """
        try:
            # Calculate forecast errors
            errors = self._calculate_forecast_errors(
                forecast_data,
                actual_data
            )
            
            # Analyze forecast bias
            bias = self._analyze_forecast_bias(errors)
            
            # Calculate skill scores
            skill_scores = self._calculate_skill_scores(
                forecast_data,
                actual_data
            )
            
            return {
                'errors': errors,
                'bias': bias,
                'skill_scores': skill_scores
            }
        except Exception as e:
            logger.error(f"Error in forecast analysis: {str(e)}")
            raise
    
    def _calculate_forecast_errors(
        self,
        forecast: pd.DataFrame,
        actual: pd.DataFrame
    ) -> Dict[str, float]:
        """Calculate various forecast error metrics"""
        errors = forecast - actual
        
        return {
            'mae': np.abs(errors).mean(),
            'rmse': np.sqrt((errors ** 2).mean()),
            'mape': np.abs(errors / actual).mean() * 100
        }
    
    def _analyze_forecast_bias(
        self,
        errors: pd.DataFrame
    ) -> Dict[str, float]:
        """Analyze systematic bias in forecasts"""
        return {
            'mean_bias': errors.mean(),
            'bias_std': errors.std(),
            'bias_skew': stats.skew(errors)
        }

class VegetationAnalyzer:
    """Vegetation indices analysis component"""
    
    def calculate_vegetation_indices(
        self,
        satellite_data: xr.Dataset
    ) -> Dict[str, xr.DataArray]:
        """
        Calculate various vegetation indices from satellite data
        
        Args:
            satellite_data: xarray Dataset with spectral bands
            
        Returns:
            Dictionary containing calculated indices
        """
        try:
            # Calculate NDVI
            ndvi = self._calculate_ndvi(
                satellite_data.nir,
                satellite_data.red
            )
            
            # Calculate EVI
            evi = self._calculate_evi(
                satellite_data.nir,
                satellite_data.red,
                satellite_data.blue
            )
            
            # Calculate NDWI
            ndwi = self._calculate_ndwi(
                satellite_data.nir,
                satellite_data.swir
            )
            
            return {
                'ndvi': ndvi,
                'evi': evi,
                'ndwi': ndwi
            }
        except Exception as e:
            logger.error(f"Error in vegetation analysis: {str(e)}")
            raise
    
    def _calculate_ndvi(
        self,
        nir: xr.DataArray,
        red: xr.DataArray
    ) -> xr.DataArray:
        """Calculate Normalized Difference Vegetation Index"""
        return (nir - red) / (nir + red)
    
    def _calculate_evi(
        self,
        nir: xr.DataArray,
        red: xr.DataArray,
        blue: xr.DataArray,
        L: float = 1,
        C1: float = 6,
        C2: float = 7.5,
        G: float = 2.5
    ) -> xr.DataArray:
        """Calculate Enhanced Vegetation Index"""
        return G * (nir - red) / (nir + C1 * red - C2 * blue + L)
    
    def _calculate_ndwi(
        self,
        nir: xr.DataArray,
        swir: xr.DataArray
    ) -> xr.DataArray:
        """Calculate Normalized Difference Water Index"""
        return (nir - swir) / (nir + swir)

def create_visualization(
    analysis_results: Dict,
    output_path: str,
    plot_type: str = 'all'
) -> None:
    """
    Create visualizations of analysis results
    
    Args:
        analysis_results: Dictionary containing analysis results
        output_path: Path to save visualizations
        plot_type: Type of plots to generate ('all' or specific type)
    """
    try:
        plt.style.use('seaborn')
        
        if plot_type in ['all', 'temperature']:
            _plot_temperature_analysis(analysis_results.get('temperature'))
            
        if plot_type in ['all', 'humidity']:
            _plot_humidity_analysis(analysis_results.get('humidity'))
            
        if plot_type in ['all', 'rainfall']:
            _plot_rainfall_analysis(analysis_results.get('rainfall'))
            
        if plot_type in ['all', 'forecast']:
            _plot_forecast_analysis(analysis_results.get('forecast'))
            
        plt.savefig(output_path)
        plt.close()
        
    except Exception as e:
        logger.error(f"Error in visualization creation: {str(e)}")
        raise

def _plot_temperature_analysis(temp_results: Dict) -> None:
    """Create temperature analysis plots"""
    if temp_results is None:
        return
        
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot daily statistics
    temp_results['daily_stats'].plot(ax=axes[0, 0])
    axes[0, 0].set_title('Daily Temperature Statistics')
    
    # Plot trend
    temp_results['trend'].plot(ax=axes[0, 1])
    axes[0, 1].set_title('Temperature Trend')
    
    # Plot anomalies
    sns.scatterplot(
        data=temp_results['anomalies'],
        ax=axes[1, 0]
    )
    axes[1, 0].set_title('Temperature Anomalies')
    
    # Plot distribution
    sns.histplot(
        data=temp_results['daily_stats']['mean'],
        ax=axes[1, 1]
    )
    axes[1, 1].set_title('Temperature Distribution')

if __name__ == "__main__":
    # Example usage
    data_path = "path/to/eo_data"
    analyzer = EODataAnalyzer(data_path)
    
    # Load your data here
    # temp_data = pd.read_csv("temperature.csv")
    # humidity_data = pd.read_csv("humidity.csv")
    # rainfall_data = pd.read_csv("rainfall.csv")
    
    # Perform analysis
    # temp_results = analyzer.temp_analyzer.analyze_temperature_trends(temp_data)
    # humidity_results = analyzer.humidity_analyzer.analyze_humidity_patterns(humidity_data)
    # rainfall_results = analyzer.rainfall_analyzer.analyze_rainfall_patterns(rainfall_data) 