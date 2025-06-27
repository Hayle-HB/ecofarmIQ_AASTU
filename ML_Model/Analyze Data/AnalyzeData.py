import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Import modular plotting functions
from plots.class_distribution import plot_class_distribution
from plots.numerical_distributions import plot_numerical_distributions
from plots.correlation_heatmap import plot_correlation_heatmap
from plots.feature_boxplots import plot_feature_boxplots

import matplotlib.pyplot as plt
import seaborn as sns

def analyze_data(input_file, output_dir="analysis_results"):
    """
    Perform comprehensive analysis of the crop recommendation dataset.
    
    Args:
        input_file (str): Path to the cleaned CSV file
        output_dir (str): Directory to save analysis plots
    """
    try:
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Read the cleaned dataset
        df = pd.read_csv(input_file)
        print("Dataset Shape:", df.shape)
        print("\nDataset Info:")
        print(df.info())
        
        # 1. Class Distribution Analysis
        class_counts = plot_class_distribution(df, output_path)
        print("\nClass Distribution:")
        print(class_counts)
        print("\nClass Balance Metrics:")
        print(f"Number of unique classes: {len(class_counts)}")
        print(f"Most common class: {class_counts.index[0]} ({class_counts.iloc[0]} samples)")
        print(f"Least common class: {class_counts.index[-1]} ({class_counts.iloc[-1]} samples)")
        
        # 2. Numerical Features Analysis
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        numerical_cols = [col for col in numerical_cols if col != 'label']
        plot_numerical_distributions(df, numerical_cols, output_path)
        
        # 3. Correlation Analysis
        correlation_matrix = plot_correlation_heatmap(df, numerical_cols, output_path)
        
        # 4. Box Plots for each numerical feature by crop type
        plot_feature_boxplots(df, numerical_cols, output_path)
        
        # 5. Statistical Summary
        print("\nStatistical Summary of Numerical Features:")
        print(df[numerical_cols].describe())
        
        # 6. Pairplot for top correlated features
        # Get top 5 most correlated feature pairs
        corr_pairs = correlation_matrix.unstack().sort_values(ascending=False)
        top_corr_pairs = corr_pairs[corr_pairs < 1.0].head(5)
        top_features = list(set([pair[0] for pair in top_corr_pairs.index] + 
                              [pair[1] for pair in top_corr_pairs.index]))
        
        plt.figure(figsize=(12, 10))
        sns.pairplot(df[top_features + ['label']], hue='label', diag_kind='kde')
        plt.savefig(output_path / 'feature_pairplot.png')
        plt.close()
        
        print("\nTop 5 Most Correlated Feature Pairs:")
        print(top_corr_pairs)
        
        # 7. Save summary statistics to CSV
        summary_stats = df.groupby('label')[numerical_cols].agg(['mean', 'std', 'min', 'max'])
        summary_stats.to_csv(output_path / 'crop_statistics.csv')
        
        print(f"\nAnalysis complete! Results saved to {output_dir}/")
        
    except Exception as e:
        print(f"An error occurred during analysis: {str(e)}")

if __name__ == "__main__":
    input_file = "data/cleanCrop_rec_DataSet.csv"
    analyze_data(input_file)
