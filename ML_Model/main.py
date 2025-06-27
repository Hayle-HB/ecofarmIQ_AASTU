import sys
from pathlib import Path
import logging
from datetime import datetime
import numpy as np
import joblib
import pandas as pd

# Add subfolders to sys.path for import
sys.path.append(str(Path(__file__).parent / 'Data Wrangling'))
sys.path.append(str(Path(__file__).parent / 'Analyze Data'))
sys.path.append(str(Path(__file__).parent / 'ML_Model'))
 
# Import our custom modules
from DataWrangling import load_and_clean_data
from AnalyzeData import analyze_data
from mode import crop_recommendation_model, test_model

def setup_logging():
    """Set up logging configuration"""
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create a log file with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_dir / f"crop_recommendation_{timestamp}.log"
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

def print_example_predictions():
    """Print a few example predictions from the test set."""
    results_dir = Path("model_results")
    model = joblib.load(results_dir.parent / "ML_Model/trained_model.pkl")
    data = np.load(results_dir / "test_data.npz", allow_pickle=True)
    X_test = data['X_test']
    y_test = data['y_test']
    # Convert to DataFrame for pretty printing
    X_test_df = pd.DataFrame(X_test, columns=[
        'n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'])
    y_pred = model.predict(X_test)
    print("\nSample predictions (first 5 test samples):")
    for i in range(5):
        features = X_test_df.iloc[i].to_dict()
        print(f"Input: {features}")
        print(f"  True Crop: {y_test[i]}, Predicted Crop: {y_pred[i]}")

def main():
    """Main function to orchestrate the entire workflow"""
    logger = setup_logging()
    
    try:
        # Define file paths
        input_file = Path("data/Crop_recommendation (2).csv")
        cleaned_file = Path("data/cleanCrop_rec_DataSet.csv")
        
        # Step 1: Data Wrangling
        logger.info("Starting data wrangling process...")
        load_and_clean_data(input_file, cleaned_file)
        logger.info("Data wrangling completed successfully!")
        
        # Step 2: Data Analysis
        logger.info("Starting data analysis...")
        analyze_data(cleaned_file)
        logger.info("Data analysis completed successfully!")
        
        # Step 3: Model Training
        logger.info("Starting model training...")
        model, X_test, y_test = crop_recommendation_model()
        logger.info("Model training completed successfully!")
        
        # Step 4: Model Testing and Output
        logger.info("Testing the trained model and saving results...")
        test_model()
        print_example_predictions()
        
        logger.info("All processes completed successfully!")
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
