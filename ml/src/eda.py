import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

def generate_eda():
    processed_path = "ml/data/processed/cleaned_placement_data.csv"
    figures_dir = "ml/outputs/figures"
    os.makedirs(figures_dir, exist_ok=True)

    df = pd.read_csv(processed_path)
    sns.set_theme(style="whitegrid", palette="muted")

    # 1. Target Distribution
    plt.figure(figsize=(6, 4))
    ax = sns.countplot(data=df, x='status', hue='status', legend=False, palette=['#10B981', '#EF4444'])
    plt.title("Placement Outcome Distribution", fontsize=14, fontweight='bold', pad=15)
    plt.xlabel("Status", fontweight='semibold')
    plt.ylabel("Count", fontweight='semibold')
    for p in ax.patches:
        height = int(p.get_height())
        if height > 0:
            ax.annotate(f'{height} ({height/len(df)*100:.1f}%)',
                        (p.get_x() + p.get_width() / 2., height / 2),
                        ha='center', va='center', fontsize=11, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "target_distribution.png"), dpi=150)
    plt.close()

    # 2. Academic Distributions Boxplot
    academic_cols = ['ssc_p', 'hsc_p', 'degree_p', 'etest_p', 'mba_p']
    plt.figure(figsize=(10, 5))
    df_melt = df.melt(id_vars=['status'], value_vars=academic_cols, var_name='Academic Metric', value_name='Percentage')
    sns.boxplot(data=df_melt, x='Academic Metric', y='Percentage', hue='status', palette=['#10B981', '#EF4444'])
    plt.title("Academic Percentages by Placement Status", fontsize=14, fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "academic_distributions.png"), dpi=150)
    plt.close()

    # 3. Work Experience vs Placement
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x='workex', hue='status', palette=['#10B981', '#EF4444'])
    plt.title("Placement Status by Work Experience", fontsize=14, fontweight='bold', pad=15)
    plt.xlabel("Work Experience", fontweight='semibold')
    plt.ylabel("Count", fontweight='semibold')
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "workex_placement.png"), dpi=150)
    plt.close()

    # 4. MBA Specialization vs Placement
    plt.figure(figsize=(7, 4))
    sns.countplot(data=df, x='specialisation', hue='status', palette=['#10B981', '#EF4444'])
    plt.title("Placement Status by MBA Specialization", fontsize=14, fontweight='bold', pad=15)
    plt.xlabel("Specialization", fontweight='semibold')
    plt.ylabel("Count", fontweight='semibold')
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "specialisation_placement.png"), dpi=150)
    plt.close()

    # 5. Correlation Heatmap (Numeric features)
    plt.figure(figsize=(8, 6))
    df_num = df.select_dtypes(include=[np.number]).copy()
    df_num['target'] = (df['status'] == 'Placed').astype(int)
    corr = df_num.corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, vmin=-1, vmax=1)
    plt.title("Feature Correlation Heatmap", fontsize=14, fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(figures_dir, "correlation_heatmap.png"), dpi=150)
    plt.close()

    print(f"EDA figures successfully saved to {figures_dir}")

if __name__ == "__main__":
    generate_eda()
