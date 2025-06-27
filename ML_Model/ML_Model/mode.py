import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
from pathlib import Path
import os
import matplotlib.pyplot as plt
import seaborn as sns

def crop_recommendation_model():
    # Load the cleaned dataset
    data_path = Path("data/cleanCrop_rec_DataSet.csv")
    df = pd.read_csv(data_path)
    
    # Separate features and target
    X = df.drop('label', axis=1)  # Features
    y = df['label']  # Target variable
    
    # Split the data into training and testing sets (80-20 split)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.2, 
        random_state=42,  # For reproducibility
        stratify=y  # Ensure balanced class distribution in splits
    )
    
    # Initialize and train the Random Forest classifier
    rf_classifier = RandomForestClassifier(
        n_estimators=100,  # Number of trees
        random_state=42,   # For reproducibility
        n_jobs=-1          # Use all available cores
    )
    
    # Train the model
    rf_classifier.fit(X_train, y_train)
    
    # Make predictions
    y_pred = rf_classifier.predict(X_test)
    
    # Print model performance metrics
    print("\nModel Performance Metrics:")
    print("=" * 50)
    print("\nAccuracy Score:", accuracy_score(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Print feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': rf_classifier.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nFeature Importance:")
    print("=" * 50)
    print(feature_importance)
    
    # Save the trained model as .pkl
    model_path = Path("ML_Model/trained_model.pkl")
    joblib.dump(rf_classifier, model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Save test data for later testing
    test_data_path = Path("model_results/test_data.npz")
    test_data_path.parent.mkdir(exist_ok=True)
    np.savez(test_data_path, X_test=X_test, y_test=y_test)
    
    return rf_classifier, X_test, y_test

def test_model():
    """
    Loads the trained model and test data, evaluates, and saves results to model_results folder.
    """
    results_dir = Path("model_results")
    results_dir.mkdir(exist_ok=True)
    
    # Load model and test data
    model = joblib.load(results_dir.parent / "ML_Model/trained_model.pkl")
    data = np.load(results_dir / "test_data.npz", allow_pickle=True)
    X_test = data['X_test']
    y_test = data['y_test']
    
    # Predict
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    # Save results to text file
    with open(results_dir / "test_report.txt", "w") as f:
        f.write(f"Accuracy: {acc:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(report + "\n")
        f.write("Confusion Matrix:\n")
        f.write(np.array2string(cm))
    
    # Save confusion matrix as image
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(results_dir / "confusion_matrix.png")
    plt.close()
    print(f"\nTest results saved to {results_dir}/")
    print(f"Accuracy: {acc:.4f}")

def main():
    model_path = Path("ML_Model/trained_model.pkl")
    test_data_path = Path("model_results/test_data.npz")
    results_dir = Path("model_results")
    results_dir.mkdir(exist_ok=True)

    if model_path.exists() and test_data_path.exists():
        print("Model and test data found. Skipping training.")
        # Load model and test data, generate report/plots
        model = joblib.load(model_path)
        data = np.load(test_data_path, allow_pickle=True)
        X_test = data['X_test']
        y_test = data['y_test']
        # Generate test report and confusion matrix
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        # Save results to text file
        with open(results_dir / "test_report.txt", "w") as f:
            f.write(f"Accuracy: {acc:.4f}\n\n")
            f.write("Classification Report:\n")
            f.write(report + "\n")
            f.write("Confusion Matrix:\n")
            f.write(np.array2string(cm))
        # Save confusion matrix as image
        plt.figure(figsize=(12, 10))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.tight_layout()
        plt.savefig(results_dir / "confusion_matrix.png")
        plt.close()
        print(f"Test results saved to {results_dir}/")
        print(f"Accuracy: {acc:.4f}")
    else:
        print("Training model as no saved model/test data found.")
        model, X_test, y_test = crop_recommendation_model()
        # Optionally, call test_model() here if you want to regenerate reports

if __name__ == "__main__":
    main()
