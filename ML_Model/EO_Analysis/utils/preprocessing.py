"""
Preprocessing utilities for EO data analysis
"""

import numpy as np
import pandas as pd
import xarray as xr
from typing import Union, Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

def clean_time_series(
    data: pd.DataFrame,
    timestamp_col: str = 'timestamp',
    value_cols: List[str] = None,
    max_gap: str = '1D',
    interpolation_method: str = 'linear'
) -> pd.DataFrame:
    """
    Clean time series data by handling missing values and outliers
    
    Args:
        data: Input DataFrame
        timestamp_col: Name of timestamp column
        value_cols: List of value columns to clean
        max_gap: Maximum gap to interpolate
        interpolation_method: Method for interpolation
        
    Returns:
        Cleaned DataFrame
    """
    try:
        # Convert timestamp to datetime if needed
        if not pd.api.types.is_datetime64_any_dtype(data[timestamp_col]):
            data[timestamp_col] = pd.to_datetime(data[timestamp_col])
            
        # Set timestamp as index
        data = data.set_index(timestamp_col)
        
        # Sort index
        data = data.sort_index()
        
        # Handle missing values
        data = handle_missing_values(
            data,
            value_cols,
            max_gap,
            interpolation_method
        )
        
        # Remove outliers
        data = remove_outliers(data, value_cols)
        
        return data
        
    except Exception as e:
        logger.error(f"Error in clean_time_series: {str(e)}")
        raise

def handle_missing_values(
    data: pd.DataFrame,
    value_cols: List[str],
    max_gap: str,
    interpolation_method: str
) -> pd.DataFrame:
    """Handle missing values in time series data"""
    
    # Create regular time index
    full_index = pd.date_range(
        start=data.index.min(),
        end=data.index.max(),
        freq=pd.infer_freq(data.index)
    )
    
    # Reindex data
    data = data.reindex(full_index)
    
    # Interpolate within max_gap
    for col in value_cols:
        # Find gaps larger than max_gap
        gaps = data[col].isna()
        gap_starts = gaps[gaps].index[gaps.index[1:] - gaps.index[:-1] > pd.Timedelta(max_gap)]
        
        # Interpolate only within max_gap
        data[col] = data[col].interpolate(
            method=interpolation_method,
            limit=pd.Timedelta(max_gap) // pd.Timedelta('1H')
        )
    
    return data

def remove_outliers(
    data: pd.DataFrame,
    value_cols: List[str],
    std_threshold: float = 3
) -> pd.DataFrame:
    """Remove statistical outliers from data"""
    
    for col in value_cols:
        # Calculate z-scores
        z_scores = np.abs((data[col] - data[col].mean()) / data[col].std())
        
        # Mark outliers as NaN
        data.loc[z_scores > std_threshold, col] = np.nan
        
        # Interpolate outliers
        data[col] = data[col].interpolate(method='linear')
    
    return data

def process_satellite_data(
    data: xr.Dataset,
    cloud_mask: Optional[xr.DataArray] = None,
    resolution: Optional[float] = None
) -> xr.Dataset:
    """
    Process satellite imagery data
    
    Args:
        data: Input xarray Dataset
        cloud_mask: Cloud mask array
        resolution: Target resolution in meters
        
    Returns:
        Processed Dataset
    """
    try:
        # Apply cloud mask if provided
        if cloud_mask is not None:
            data = data.where(~cloud_mask)
        
        # Resample to target resolution if provided
        if resolution is not None:
            data = resample_satellite_data(data, resolution)
        
        # Apply atmospheric correction
        data = apply_atmospheric_correction(data)
        
        return data
        
    except Exception as e:
        logger.error(f"Error in process_satellite_data: {str(e)}")
        raise

def resample_satellite_data(
    data: xr.Dataset,
    target_resolution: float
) -> xr.Dataset:
    """Resample satellite data to target resolution"""
    
    # Calculate resampling factor
    current_res = data.rio.resolution()[0]
    factor = target_resolution / current_res
    
    # Resample using bilinear interpolation
    data = data.rio.reproject(
        data.rio.crs,
        resolution=target_resolution,
        resampling=rasterio.enums.Resampling.bilinear
    )
    
    return data

def apply_atmospheric_correction(
    data: xr.Dataset
) -> xr.Dataset:
    """Apply basic atmospheric correction to satellite data"""
    
    # Simple Dark Object Subtraction (DOS)
    for band in data.data_vars:
        # Find darkest pixel value
        dark_value = float(data[band].quantile(0.01))
        
        # Subtract dark value
        data[band] = data[band] - dark_value
        
        # Clip negative values
        data[band] = data[band].clip(min=0)
    
    return data

def calculate_indices(
    data: xr.Dataset,
    indices: List[str]
) -> Dict[str, xr.DataArray]:
    """
    Calculate various spectral indices
    
    Args:
        data: Input Dataset with spectral bands
        indices: List of indices to calculate
        
    Returns:
        Dictionary of calculated indices
    """
    results = {}
    
    for index in indices:
        if index.upper() == 'NDVI':
            results['NDVI'] = (data.nir - data.red) / (data.nir + data.red)
            
        elif index.upper() == 'EVI':
            results['EVI'] = 2.5 * (data.nir - data.red) / (
                data.nir + 6 * data.red - 7.5 * data.blue + 1
            )
            
        elif index.upper() == 'NDWI':
            results['NDWI'] = (data.nir - data.swir) / (data.nir + data.swir)
    
    return results

def validate_data_format(
    data: Union[pd.DataFrame, xr.Dataset],
    data_type: str
) -> bool:
    """
    Validate data format requirements
    
    Args:
        data: Input data
        data_type: Type of data ('temperature', 'humidity', 'rainfall', 'satellite')
        
    Returns:
        True if valid, raises ValueError if invalid
    """
    try:
        if data_type == 'temperature':
            required_cols = ['timestamp', 'temperature']
            _validate_dataframe_columns(data, required_cols)
            
        elif data_type == 'humidity':
            required_cols = ['timestamp', 'relative_humidity']
            _validate_dataframe_columns(data, required_cols)
            
        elif data_type == 'rainfall':
            required_cols = ['timestamp', 'precipitation']
            _validate_dataframe_columns(data, required_cols)
            
        elif data_type == 'satellite':
            required_bands = ['nir', 'red', 'blue']
            _validate_dataset_bands(data, required_bands)
            
        return True
        
    except Exception as e:
        logger.error(f"Data validation error: {str(e)}")
        raise ValueError(f"Invalid data format: {str(e)}")

def _validate_dataframe_columns(
    data: pd.DataFrame,
    required_cols: List[str]
) -> None:
    """Validate required columns in DataFrame"""
    missing_cols = set(required_cols) - set(data.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

def _validate_dataset_bands(
    data: xr.Dataset,
    required_bands: List[str]
) -> None:
    """Validate required bands in Dataset"""
    missing_bands = set(required_bands) - set(data.data_vars)
    if missing_bands:
        raise ValueError(f"Missing required bands: {missing_bands}") 