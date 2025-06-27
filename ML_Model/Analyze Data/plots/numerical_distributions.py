import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

def plot_numerical_distributions(df, numerical_cols, output_path):
    n_cols = 3
    n_rows = (len(numerical_cols) + n_cols - 1) // n_cols
    fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, 4*n_rows))
    axes = axes.flatten()
    for idx, col in enumerate(numerical_cols):
        sns.histplot(data=df, x=col, hue='label', multiple="stack", ax=axes[idx])
        axes[idx].set_title(f'Distribution of {col}')
        axes[idx].tick_params(axis='x', rotation=45)
    for idx in range(len(numerical_cols), len(axes)):
        axes[idx].set_visible(False)
    plt.tight_layout()
    plt.savefig(output_path / 'numerical_distributions.png')
    plt.close() 