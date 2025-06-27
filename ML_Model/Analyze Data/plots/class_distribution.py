import matplotlib.pyplot as plt
import seaborn as sns

def plot_class_distribution(df, output_path):
    plt.figure(figsize=(12, 6))
    class_counts = df['label'].value_counts()
    sns.barplot(x=class_counts.index, y=class_counts.values)
    plt.title('Distribution of Crop Types')
    plt.xticks(rotation=45, ha='right')
    plt.xlabel('Crop Type')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig(output_path / 'class_distribution.png')
    plt.close()
    return class_counts 