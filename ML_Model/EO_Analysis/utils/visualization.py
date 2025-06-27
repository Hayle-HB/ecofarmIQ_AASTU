"""
Visualization utilities for EO data analysis
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import xarray as xr
from typing import Dict, List, Optional, Tuple, Union
import logging
from matplotlib.figure import Figure
import folium
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class EOVisualizer:
    """Class for creating visualizations of EO data analysis results"""
    
    def __init__(self, style: str = 'seaborn'):
        """
        Initialize visualizer
        
        Args:
            style: Matplotlib style to use
        """
        plt.style.use(style)
        self.default_figsize = (12, 8)
        self.default_cmap = 'viridis'
    
    def plot_temperature_analysis(
        self,
        results: Dict,
        output_path: Optional[str] = None
    ) -> Figure:
        """
        Create temperature analysis plots
        
        Args:
            results: Dictionary containing temperature analysis results
            output_path: Path to save the plot
            
        Returns:
            Matplotlib figure
        """
        try:
            fig, axes = plt.subplots(2, 2, figsize=self.default_figsize)
            
            # Plot time series
            self._plot_temperature_series(results['daily_stats'], axes[0, 0])
            
            # Plot trends
            self._plot_temperature_trends(results['trend'], axes[0, 1])
            
            # Plot anomalies
            self._plot_temperature_anomalies(results['anomalies'], axes[1, 0])
            
            # Plot distribution
            self._plot_temperature_distribution(
                results['daily_stats'],
                axes[1, 1]
            )
            
            plt.tight_layout()
            
            if output_path:
                plt.savefig(output_path, dpi=300, bbox_inches='tight')
            
            return fig
            
        except Exception as e:
            logger.error(f"Error in temperature visualization: {str(e)}")
            raise
    
    def plot_humidity_analysis(
        self,
        results: Dict,
        output_path: Optional[str] = None
    ) -> Figure:
        """Create humidity analysis plots"""
        try:
            fig, axes = plt.subplots(2, 2, figsize=self.default_figsize)
            
            # Plot daily patterns
            self._plot_humidity_patterns(
                results['daily_patterns'],
                axes[0, 0]
            )
            
            # Plot seasonal decomposition
            self._plot_seasonal_decomposition(
                results['seasonal_components'],
                axes[0, 1]
            )
            
            # Plot correlations
            self._plot_humidity_correlations(
                results['correlations'],
                axes[1, 0]
            )
            
            # Plot distribution
            self._plot_humidity_distribution(
                results['daily_patterns'],
                axes[1, 1]
            )
            
            plt.tight_layout()
            
            if output_path:
                plt.savefig(output_path, dpi=300, bbox_inches='tight')
            
            return fig
            
        except Exception as e:
            logger.error(f"Error in humidity visualization: {str(e)}")
            raise
    
    def plot_rainfall_analysis(
        self,
        results: Dict,
        output_path: Optional[str] = None
    ) -> Figure:
        """Create rainfall analysis plots"""
        try:
            fig, axes = plt.subplots(2, 2, figsize=self.default_figsize)
            
            # Plot rainfall patterns
            self._plot_rainfall_patterns(
                results['statistics'],
                axes[0, 0]
            )
            
            # Plot extreme events
            self._plot_extreme_events(
                results['extreme_events'],
                axes[0, 1]
            )
            
            # Plot drought indices
            self._plot_drought_indices(
                results['drought_indices'],
                axes[1, 0]
            )
            
            # Plot distribution
            self._plot_rainfall_distribution(
                results['statistics'],
                axes[1, 1]
            )
            
            plt.tight_layout()
            
            if output_path:
                plt.savefig(output_path, dpi=300, bbox_inches='tight')
            
            return fig
            
        except Exception as e:
            logger.error(f"Error in rainfall visualization: {str(e)}")
            raise
    
    def plot_vegetation_indices(
        self,
        indices: Dict[str, xr.DataArray],
        output_path: Optional[str] = None
    ) -> Figure:
        """Create vegetation indices plots"""
        try:
            n_indices = len(indices)
            fig, axes = plt.subplots(
                1,
                n_indices,
                figsize=(6*n_indices, 6)
            )
            
            if n_indices == 1:
                axes = [axes]
            
            for ax, (name, data) in zip(axes, indices.items()):
                im = data.plot(
                    ax=ax,
                    cmap=self.default_cmap,
                    add_colorbar=True
                )
                ax.set_title(f'{name} Index')
            
            plt.tight_layout()
            
            if output_path:
                plt.savefig(output_path, dpi=300, bbox_inches='tight')
            
            return fig
            
        except Exception as e:
            logger.error(f"Error in vegetation visualization: {str(e)}")
            raise
    
    def create_interactive_map(
        self,
        lat: float,
        lon: float,
        data: Dict[str, Union[float, pd.Series]],
        zoom: int = 13
    ) -> folium.Map:
        """Create interactive map with data overlay"""
        try:
            # Create base map
            m = folium.Map(
                location=[lat, lon],
                zoom_start=zoom,
                tiles='OpenStreetMap'
            )
            
            # Add data markers
            for name, value in data.items():
                if isinstance(value, (int, float)):
                    folium.CircleMarker(
                        location=[lat, lon],
                        radius=8,
                        popup=f'{name}: {value:.2f}',
                        color='red',
                        fill=True
                    ).add_to(m)
                elif isinstance(value, pd.Series):
                    # Create time series popup
                    popup_html = self._create_timeseries_popup(name, value)
                    folium.Popup(popup_html).add_to(
                        folium.CircleMarker(
                            location=[lat, lon],
                            radius=8,
                            color='blue',
                            fill=True
                        )
                    ).add_to(m)
            
            return m
            
        except Exception as e:
            logger.error(f"Error in map creation: {str(e)}")
            raise
    
    def _create_timeseries_popup(
        self,
        name: str,
        data: pd.Series
    ) -> str:
        """Create HTML popup for time series data"""
        # Create mini plot
        fig, ax = plt.subplots(figsize=(4, 3))
        data.plot(ax=ax)
        ax.set_title(name)
        
        # Convert plot to HTML
        from io import BytesIO
        import base64
        
        buf = BytesIO()
        fig.savefig(buf, format='png')
        plt.close(fig)
        
        data_url = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return f'<img src="data:image/png;base64,{data_url}"/>'
    
    def _plot_temperature_series(
        self,
        data: pd.DataFrame,
        ax: plt.Axes
    ) -> None:
        """Plot temperature time series"""
        data['mean'].plot(ax=ax)
        ax.fill_between(
            data.index,
            data['min'],
            data['max'],
            alpha=0.2
        )
        ax.set_title('Temperature Time Series')
        ax.set_xlabel('Date')
        ax.set_ylabel('Temperature (°C)')
    
    def _plot_temperature_trends(
        self,
        trend: pd.Series,
        ax: plt.Axes
    ) -> None:
        """Plot temperature trends"""
        trend.plot(ax=ax)
        ax.set_title('Temperature Trend')
        ax.set_xlabel('Date')
        ax.set_ylabel('Temperature (°C)')
    
    def _plot_temperature_anomalies(
        self,
        anomalies: pd.Series,
        ax: plt.Axes
    ) -> None:
        """Plot temperature anomalies"""
        sns.scatterplot(data=anomalies, ax=ax)
        ax.set_title('Temperature Anomalies')
        ax.set_xlabel('Date')
        ax.set_ylabel('Anomaly Score')
    
    def _plot_temperature_distribution(
        self,
        data: pd.DataFrame,
        ax: plt.Axes
    ) -> None:
        """Plot temperature distribution"""
        sns.histplot(data=data['mean'], ax=ax)
        ax.set_title('Temperature Distribution')
        ax.set_xlabel('Temperature (°C)')
        ax.set_ylabel('Count')
    
    def _plot_humidity_patterns(
        self,
        patterns: pd.DataFrame,
        ax: plt.Axes
    ) -> None:
        """Plot humidity daily patterns"""
        patterns['mean'].plot(ax=ax)
        ax.fill_between(
            patterns.index,
            patterns['mean'] - patterns['std'],
            patterns['mean'] + patterns['std'],
            alpha=0.2
        )
        ax.set_title('Daily Humidity Pattern')
        ax.set_xlabel('Hour')
        ax.set_ylabel('Relative Humidity (%)')
    
    def _plot_seasonal_decomposition(
        self,
        components: Dict[str, pd.Series],
        ax: plt.Axes
    ) -> None:
        """Plot seasonal decomposition"""
        components['seasonal'].plot(ax=ax)
        ax.set_title('Seasonal Component')
        ax.set_xlabel('Date')
        ax.set_ylabel('Relative Humidity (%)')
    
    def _plot_humidity_correlations(
        self,
        correlations: pd.DataFrame,
        ax: plt.Axes
    ) -> None:
        """Plot humidity correlations"""
        sns.heatmap(
            correlations,
            annot=True,
            cmap='coolwarm',
            center=0,
            ax=ax
        )
        ax.set_title('Variable Correlations')
    
    def _plot_humidity_distribution(
        self,
        data: pd.DataFrame,
        ax: plt.Axes
    ) -> None:
        """Plot humidity distribution"""
        sns.histplot(data=data['mean'], ax=ax)
        ax.set_title('Humidity Distribution')
        ax.set_xlabel('Relative Humidity (%)')
        ax.set_ylabel('Count')
    
    def _plot_rainfall_patterns(
        self,
        statistics: Dict[str, float],
        ax: plt.Axes
    ) -> None:
        """Plot rainfall patterns"""
        x = range(len(statistics))
        ax.bar(x, statistics.values())
        ax.set_xticks(x)
        ax.set_xticklabels(statistics.keys(), rotation=45)
        ax.set_title('Rainfall Statistics')
        ax.set_ylabel('Value')
    
    def _plot_extreme_events(
        self,
        events: pd.Series,
        ax: plt.Axes
    ) -> None:
        """Plot extreme rainfall events"""
        events.plot(kind='bar', ax=ax)
        ax.set_title('Extreme Rainfall Events')
        ax.set_xlabel('Date')
        ax.set_ylabel('Rainfall (mm)')
        plt.xticks(rotation=45)
    
    def _plot_drought_indices(
        self,
        indices: pd.Series,
        ax: plt.Axes
    ) -> None:
        """Plot drought indices"""
        indices.plot(ax=ax)
        ax.axhline(y=0, color='r', linestyle='--')
        ax.set_title('Drought Index')
        ax.set_xlabel('Date')
        ax.set_ylabel('Index Value') 