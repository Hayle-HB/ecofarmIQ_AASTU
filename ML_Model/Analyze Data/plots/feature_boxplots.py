import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

def plot_feature_boxplots(df, numerical_cols, output_path):
    plt.figure(figsize=(15, 10))
    df_melted = pd.melt(df, id_vars=['label'], value_vars=numerical_cols)
    sns.boxplot(x='label', y='value', hue='variable', data=df_melted)
    plt.title('Distribution of Features by Crop Type')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig(output_path / 'feature_boxplots.png')
    plt.close() 