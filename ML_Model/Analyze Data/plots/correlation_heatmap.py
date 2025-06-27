import matplotlib.pyplot as plt
import seaborn as sns

def plot_correlation_heatmap(df, numerical_cols, output_path):
    plt.figure(figsize=(12, 10))
    correlation_matrix = df[numerical_cols].corr()
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, fmt='.2f')
    plt.title('Correlation Matrix of Numerical Features')
    plt.tight_layout()
    plt.savefig(output_path / 'correlation_heatmap.png')
    plt.close()
    return correlation_matrix 