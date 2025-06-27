import pandas as pd
import numpy as np
from pathlib import Path

def load_and_clean_data(input_file, output_file):
    """
    Load and clean the crop recommendation dataset.
    
    Args:
        input_file (str): Path to the input CSV file
        output_file (str): Path to save the cleaned CSV file
    """
    try:
        # Read the dataset
        df = pd.read_csv(input_file)
        
        # Display initial information
        print("Initial dataset shape:", df.shape)
        print("\nInitial missing values:")
        print(df.isnull().sum())
        
        # Handle missing values
        # For numerical columns, fill with median
        numerical_columns = df.select_dtypes(include=[np.number]).columns
        for col in numerical_columns:
            df[col] = df[col].fillna(df[col].median())
        
        # For categorical columns, fill with mode
        categorical_columns = df.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            df[col] = df[col].fillna(df[col].mode()[0])
        
        # Remove duplicates
        initial_rows = len(df)
        df = df.drop_duplicates()
        removed_rows = initial_rows - len(df)
        print(f"\nRemoved {removed_rows} duplicate rows")
        
        # Check for and handle outliers using IQR method
        for col in numerical_columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Replace outliers with bounds
            df[col] = df[col].clip(lower=lower_bound, upper=upper_bound)
        
        # Ensure all column names are clean (lowercase, no spaces)
        df.columns = df.columns.str.lower().str.replace(' ', '_')
        
        # Save the cleaned dataset
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_file, index=False)
        
        print("\nFinal dataset shape:", df.shape)
        print("\nFinal missing values:")
        print(df.isnull().sum())
        print(f"\nCleaned dataset saved to: {output_file}")
        
        return df
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

if __name__ == "__main__":
    # Define input and output file paths
    input_file = "data/Crop_recommendation (2).csv"
    output_file = "data/cleanCrop_rec_DataSet.csv"
    
    # Run the cleaning process
    cleaned_df = load_and_clean_data(input_file, output_file)
    
    if cleaned_df is not None:
        print("\nSample of cleaned data:")
        print(cleaned_df.head())
