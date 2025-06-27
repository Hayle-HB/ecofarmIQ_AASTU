"""
EO Analysis Package
------------------
A comprehensive package for analyzing Earth Observation data
"""

from .eo_analysis import EODataAnalyzer
from .utils.preprocessing import clean_time_series, process_satellite_data
from .utils.visualization import EOVisualizer
from .utils.validation import DataValidator

__version__ = '0.1.0'
__author__ = 'EcoFarmIQ Team'

__all__ = [
    'EODataAnalyzer',
    'clean_time_series',
    'process_satellite_data',
    'EOVisualizer',
    'DataValidator'
] 