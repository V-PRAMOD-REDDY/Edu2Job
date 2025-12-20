# backend/predictions/preprocessing.py

import numpy as np
import joblib
import os
from django.conf import settings

class EducationPreprocessor:
    def __init__(self):
        # Path to your saved ML artifacts
        # We assume these were saved during training in 'backend/ml_models/'
        model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        
        try:
            self.le_degree = joblib.load(os.path.join(model_path, 'le_degree.pkl'))
            self.le_branch = joblib.load(os.path.join(model_path, 'le_branch.pkl'))
            self.tfidf = joblib.load(os.path.join(model_path, 'tfidf.pkl'))
        except FileNotFoundError:
            print("⚠️ Warning: Encoder files not found. Ensure train_model.py has run.")

    def validate_input(self, data):
        """
        Requirements: Input Data & Data Evaluation
        """
        degree = data.get('highest_degree')
        branch = data.get('branch')
        cgpa = data.get('cgpa')
        skills = data.get('skills')

        # 1. Check for missing values
        if not all([degree, branch, cgpa, skills]):
            return False, "Missing required fields: Degree, Branch, CGPA, or Skills."

        # 2. Evaluate CGPA (Data Evaluation)
        try:
            cgpa_val = float(cgpa)
            if not (0.0 <= cgpa_val <= 10.0):
                return False, "CGPA must be between 0.0 and 10.0"
        except ValueError:
            return False, "CGPA must be a valid number."

        return True, "Data is valid."

    def preprocess(self, data):
        """
        Requirements: Data encoding and normalization
        """
        degree = data.get('highest_degree')
        branch = data.get('branch')
        cgpa = float(data.get('cgpa'))
        skills = data.get('skills')

        # --- A. Data Encoding (Label Encoding) ---
        # Converts "B.Tech" -> 0, "M.Tech" -> 1, etc.
        try:
            # Helper to handle unseen labels safely
            degree_encoded = self.le_degree.transform([degree])[0] if degree in self.le_degree.classes_ else 0
        except:
            degree_encoded = 0

        try:
            branch_encoded = self.le_branch.transform([branch])[0] if branch in self.le_branch.classes_ else 0
        except:
            branch_encoded = 0

        # --- B. Feature Normalization (Vectorization) ---
        # Converts "Python, Java" -> [0.1, 0.5, 0.0, ...]
        skills_vectorized = self.tfidf.transform([skills]).toarray()

        # --- C. Feature Stacking ---
        # Combine [Degree, Branch, CGPA] + [Skills Vector]
        features = np.hstack((
            [[degree_encoded, branch_encoded, cgpa]], 
            skills_vectorized
        ))

        return features