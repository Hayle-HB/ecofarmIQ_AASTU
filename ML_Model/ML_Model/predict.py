import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

def main():
    # Load input data from command line argument
    input_json = sys.argv[1]
    data = json.loads(input_json)
    
    # Create a DataFrame with proper feature names (lowercase)
    features = pd.DataFrame([[
        data["n"], 
        data["p"], 
        data["k"], 
        data["temperature"], 
        data["humidity"], 
        data["ph"], 
        data["rainfall"]
    ]], columns=['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'])
    
    # Get the absolute path to the model file
    current_dir = Path(__file__).parent
    model_path = current_dir / "trained_model.pkl"
    
    try:
        # Load model
        model = joblib.load(model_path)
        
        # Predict
        pred = model.predict(features)
        
        # Return prediction
        print(json.dumps({"recommended_crop": pred[0]}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
