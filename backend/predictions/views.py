# backend/predictions/views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import TrainingData, JobPrediction
from .serializers import TrainingDataSerializer, CSVUploadSerializer, JobPredictionSerializer

# --- MODULE 2 INTEGRATION ---
from .preprocessing import EducationPreprocessor

import pandas as pd
import joblib
import os
import numpy as np
from django.conf import settings
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

# ==========================================
# 1. ADMIN VIEWS (Training Data & Retraining)
# ==========================================

class TrainingDataListView(generics.ListAPIView):
    queryset = TrainingData.objects.all().order_by('-created_at')
    serializer_class = TrainingDataSerializer
    permission_classes = [IsAdminUser]

@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def upload_training_csv(request):
    serializer = CSVUploadSerializer(data=request.data)
    if serializer.is_valid():
        file = request.FILES['file']
        try:
            df = pd.read_csv(file)
            
            # Validation
            required = ['degree', 'branch', 'cgpa', 'skills', 'job_role']
            if not all(col in df.columns for col in required):
                return Response({"error": f"Missing columns. Required: {required}"}, status=400)

            # Bulk Create
            objs = [
                TrainingData(
                    degree=row['degree'], branch=row['branch'],
                    cgpa=row['cgpa'], skills=row['skills'],
                    job_role=row['job_role'], source='bulk_upload'
                )
                for _, row in df.iterrows()
            ]
            TrainingData.objects.bulk_create(objs)
            return Response({"message": f"Added {len(objs)} records successfully!"})
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def retrain_model(request):
    try:
        data = TrainingData.objects.all().values()
        if not data: return Response({"error": "No data found to retrain"}, status=400)
        
        df = pd.DataFrame(list(data))
        
        # --- ML Training Logic ---
        le_degree = LabelEncoder()
        df['degree_enc'] = le_degree.fit_transform(df['degree'])
        
        le_branch = LabelEncoder()
        df['branch_enc'] = le_branch.fit_transform(df['branch'])
        
        vectorizer = TfidfVectorizer(max_features=50)
        skills_vec = vectorizer.fit_transform(df['skills']).toarray()
        
        X = np.hstack((df[['degree_enc', 'branch_enc', 'cgpa']].values, skills_vec))
        y = df['job_role']
        
        clf = RandomForestClassifier(n_estimators=100)
        clf.fit(X, y)
        
        # --- SAVE MODELS (Naming must match Preprocessor) ---
        MODEL_DIR = os.path.join(settings.BASE_DIR, 'ml_models')
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        joblib.dump(clf, os.path.join(MODEL_DIR, 'career_model.pkl'))
        joblib.dump(vectorizer, os.path.join(MODEL_DIR, 'tfidf.pkl'))      
        joblib.dump(le_degree, os.path.join(MODEL_DIR, 'le_degree.pkl'))   
        joblib.dump(le_branch, os.path.join(MODEL_DIR, 'le_branch.pkl'))   
        
        return Response({"message": "Model retrained successfully & saved!"})
        
    except Exception as e:
        print("Retrain Error:", e)
        return Response({"error": str(e)}, status=500)

# ==========================================
# 2. STUDENT VIEWS (Prediction & History)
# ==========================================

class PredictJobView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Load Model
        model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'career_model.pkl')
        try:
            self.model = joblib.load(model_path)
            # Initialize Module 2: Preprocessor
            self.preprocessor = EducationPreprocessor()
        except Exception as e:
            print("Model Load Error:", e)
            self.model = None

    def post(self, request):
        if not self.model:
            return Response({"error": "ML Model not loaded. Contact Admin."}, status=503)

        data = request.data
        user = request.user

        # --- MODULE 2: DATA VALIDATION ---
        is_valid, message = self.preprocessor.validate_input(data)
        if not is_valid:
            return Response({"error": message}, status=400)

        try:
            # --- MODULE 2: ENCODING & NORMALIZATION ---
            final_features = self.preprocessor.preprocess(data)

            # --- MODULE 3: PREDICTION (UPDATED FOR TOP 3) ---
            
            # 1. Get probabilities for ALL classes (Jobs)
            probabilities = self.model.predict_proba(final_features)[0]
            
            # 2. Get indices of the top 3 scores (sorted descending)
            # argsort sorts ascending, so we take the last 3 and reverse them
            top3_indices = np.argsort(probabilities)[-3:][::-1]
            
            # 3. Get Class Names (Job Roles)
            classes = self.model.classes_
            
            top_matches = []
            for index in top3_indices:
                role = classes[index]
                score = probabilities[index] * 100
                if score > 0: # Only include valid predictions
                    top_matches.append({"role": role, "score": round(score, 2)})

            # If no matches found (rare), handle gracefully
            if not top_matches:
                 return Response({"error": "Could not determine a suitable role."}, status=400)

            # The Winner (Top 1)
            best_match = top_matches[0]['role']
            best_score = top_matches[0]['score']

            # Save to Database (We save the Best Match)
            JobPrediction.objects.create(
                user=user,
                highest_degree=data.get('highest_degree'),
                branch=data.get('branch'),
                cgpa=data.get('cgpa'),
                skills=data.get('skills'),
                predicted_role=best_match,
                confidence_score=best_score
            )

            # Return Top 1 + Alternatives
            return Response({
                "predicted_role": best_match,
                "confidence_score": best_score,
                "alternatives": top_matches[1:] # Sends 2nd and 3rd best as alternatives
            }, status=200)

        except Exception as e:
            print("Prediction Logic Error:", e)
            return Response({"error": "Prediction failed internally."}, status=500)

class UserPredictionHistoryView(generics.ListAPIView):
    serializer_class = JobPredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPrediction.objects.filter(user=self.request.user).order_by('-created_at')