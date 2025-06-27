"""
Validation utilities for EO data analysis
"""

import numpy as np
import pandas as pd
import xarray as xr
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DataValidator:
    """Class for validating EO data"""
    
    def __init__(self):
        """Initialize validator with default parameters"""
        self.temperature_range = (-50, 60)  # °C
        self.humidity_range = (0, 100)  # %
        self.rainfall_range = (0, 2000)  # mm/day
        self.required_columns = {
            'temperature': ['timestamp', 'temperature'],
            'humidity': ['timestamp', 'relative_humidity'],
            'rainfall': ['timestamp', 'precipitation']
        }
        self.required_bands = {
            'vegetation': ['nir', 'red', 'blue'],
            'water': ['nir', 'swir']
        }
    
    def validate_temperature_data(
        self,
        data: pd.DataFrame,
        strict: bool = True
    ) -> Dict[str, Union[bool, List[str]]]:
        """
        Validate temperature data
        
        Args:
            data: Input DataFrame
            strict: Whether to raise errors or return warnings
            
        Returns:
            Dictionary with validation results
        """
        try:
            issues = []
            
            # Check required columns
            missing_cols = self._check_required_columns(
                data,
                self.required_columns['temperature']
            )
            if missing_cols:
                msg = f"Missing columns: {missing_cols}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check data types
            if not pd.api.types.is_datetime64_any_dtype(data['timestamp']):
                msg = "timestamp column must be datetime type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            if not pd.api.types.is_numeric_dtype(data['temperature']):
                msg = "temperature column must be numeric type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check value ranges
            temp_range = self.temperature_range
            invalid_temps = data[
                (data['temperature'] < temp_range[0]) |
                (data['temperature'] > temp_range[1])
            ]
            if not invalid_temps.empty:
                msg = f"Temperature values outside valid range {temp_range}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check for duplicates
            duplicates = data[data.duplicated(['timestamp'])]
            if not duplicates.empty:
                msg = "Duplicate timestamps found"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in temperature validation: {str(e)}")
            raise
    
    def validate_humidity_data(
        self,
        data: pd.DataFrame,
        strict: bool = True
    ) -> Dict[str, Union[bool, List[str]]]:
        """Validate humidity data"""
        try:
            issues = []
            
            # Check required columns
            missing_cols = self._check_required_columns(
                data,
                self.required_columns['humidity']
            )
            if missing_cols:
                msg = f"Missing columns: {missing_cols}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check data types
            if not pd.api.types.is_datetime64_any_dtype(data['timestamp']):
                msg = "timestamp column must be datetime type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            if not pd.api.types.is_numeric_dtype(data['relative_humidity']):
                msg = "relative_humidity column must be numeric type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check value ranges
            humidity_range = self.humidity_range
            invalid_humidity = data[
                (data['relative_humidity'] < humidity_range[0]) |
                (data['relative_humidity'] > humidity_range[1])
            ]
            if not invalid_humidity.empty:
                msg = f"Humidity values outside valid range {humidity_range}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in humidity validation: {str(e)}")
            raise
    
    def validate_rainfall_data(
        self,
        data: pd.DataFrame,
        strict: bool = True
    ) -> Dict[str, Union[bool, List[str]]]:
        """Validate rainfall data"""
        try:
            issues = []
            
            # Check required columns
            missing_cols = self._check_required_columns(
                data,
                self.required_columns['rainfall']
            )
            if missing_cols:
                msg = f"Missing columns: {missing_cols}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check data types
            if not pd.api.types.is_datetime64_any_dtype(data['timestamp']):
                msg = "timestamp column must be datetime type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            if not pd.api.types.is_numeric_dtype(data['precipitation']):
                msg = "precipitation column must be numeric type"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check value ranges
            rainfall_range = self.rainfall_range
            invalid_rainfall = data[
                (data['precipitation'] < rainfall_range[0]) |
                (data['precipitation'] > rainfall_range[1])
            ]
            if not invalid_rainfall.empty:
                msg = f"Rainfall values outside valid range {rainfall_range}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check for negative values
            negative_rainfall = data[data['precipitation'] < 0]
            if not negative_rainfall.empty:
                msg = "Negative rainfall values found"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in rainfall validation: {str(e)}")
            raise
    
    def validate_satellite_data(
        self,
        data: xr.Dataset,
        data_type: str,
        strict: bool = True
    ) -> Dict[str, Union[bool, List[str]]]:
        """Validate satellite data"""
        try:
            issues = []
            
            # Check required bands
            missing_bands = self._check_required_bands(
                data,
                self.required_bands[data_type]
            )
            if missing_bands:
                msg = f"Missing bands: {missing_bands}"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check for NaN values
            for band in data.data_vars:
                if np.isnan(data[band]).any():
                    msg = f"NaN values found in band {band}"
                    if strict:
                        raise ValueError(msg)
                    issues.append(msg)
            
            # Check coordinates
            if not all(coord in data.coords for coord in ['x', 'y']):
                msg = "Missing spatial coordinates (x, y)"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            # Check CRS
            if not hasattr(data, 'rio'):
                msg = "Missing CRS information"
                if strict:
                    raise ValueError(msg)
                issues.append(msg)
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in satellite data validation: {str(e)}")
            raise
    
    def _check_required_columns(
        self,
        data: pd.DataFrame,
        required_cols: List[str]
    ) -> List[str]:
        """Check for required columns in DataFrame"""
        return list(set(required_cols) - set(data.columns))
    
    def _check_required_bands(
        self,
        data: xr.Dataset,
        required_bands: List[str]
    ) -> List[str]:
        """Check for required bands in Dataset"""
        return list(set(required_bands) - set(data.data_vars))
    
    def validate_time_consistency(
        self,
        data: pd.DataFrame,
        timestamp_col: str = 'timestamp',
        max_gap: str = '1D',
        min_gap: str = '1H'
    ) -> Dict[str, Union[bool, List[Dict]]]:
        """
        Validate time series consistency
        
        Args:
            data: Input DataFrame
            timestamp_col: Name of timestamp column
            max_gap: Maximum allowed gap between measurements
            min_gap: Minimum allowed gap between measurements
            
        Returns:
            Dictionary with validation results
        """
        try:
            issues = []
            
            # Sort by timestamp
            data = data.sort_values(timestamp_col)
            
            # Check for gaps
            time_diff = data[timestamp_col].diff()
            
            # Find large gaps
            large_gaps = time_diff[time_diff > pd.Timedelta(max_gap)]
            if not large_gaps.empty:
                for idx in large_gaps.index:
                    issues.append({
                        'type': 'large_gap',
                        'start': data.loc[idx-1, timestamp_col],
                        'end': data.loc[idx, timestamp_col],
                        'duration': time_diff[idx]
                    })
            
            # Find too frequent measurements
            frequent = time_diff[time_diff < pd.Timedelta(min_gap)]
            if not frequent.empty:
                for idx in frequent.index:
                    issues.append({
                        'type': 'too_frequent',
                        'timestamp': data.loc[idx, timestamp_col],
                        'gap': time_diff[idx]
                    })
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in time consistency validation: {str(e)}")
            raise
    
    def validate_spatial_consistency(
        self,
        data: xr.Dataset,
        max_gap_pixels: int = 10
    ) -> Dict[str, Union[bool, List[Dict]]]:
        """
        Validate spatial consistency of satellite data
        
        Args:
            data: Input Dataset
            max_gap_pixels: Maximum allowed gap in pixels
            
        Returns:
            Dictionary with validation results
        """
        try:
            issues = []
            
            # Check for gaps in spatial coverage
            for band in data.data_vars:
                # Find contiguous regions of NaN
                nan_regions = np.isnan(data[band])
                if nan_regions.any():
                    from scipy import ndimage
                    
                    # Label connected components of NaN regions
                    labeled, num_features = ndimage.label(nan_regions)
                    
                    # Check size of each NaN region
                    for region_id in range(1, num_features + 1):
                        region_size = (labeled == region_id).sum()
                        if region_size > max_gap_pixels:
                            issues.append({
                                'type': 'large_spatial_gap',
                                'band': band,
                                'region_id': region_id,
                                'size_pixels': int(region_size)
                            })
            
            return {
                'valid': len(issues) == 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Error in spatial consistency validation: {str(e)}")
            raise 