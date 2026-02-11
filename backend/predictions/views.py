from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated

# --- UPDATED IMPORTS (Included StudyGroup, GroupMessage & New Serializers) ---
from .models import TrainingData, JobPrediction, StudyGroup, GroupMessage
from .serializers import (
    TrainingDataSerializer, 
    CSVUploadSerializer, 
    JobPredictionSerializer,
    StudyGroupSerializer,      # New
    GroupMessageSerializer     # New
)

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
    """
    Robust CSV Upload:
    - FIX: Handles commas inside quotes (e.g., "Python, Java") using skipinitialspace.
    """
    serializer = CSVUploadSerializer(data=request.data)
    if serializer.is_valid():
        file = request.FILES['file']
        try:
            # FIX: skipinitialspace=True handles ' "Python' correctly
            df = pd.read_csv(file, skipinitialspace=True, on_bad_lines='skip')
            
            # 1. Clean Column Names
            df.columns = [c.strip().lower() for c in df.columns]

            # 2. Check Missing Columns
            required = ['degree', 'branch', 'cgpa', 'skills', 'job_role']
            missing = [col for col in required if col not in df.columns]
            
            if missing:
                return Response({
                    "error": f"Missing required columns: {', '.join(missing)}"
                }, status=400)

            # 3. Handle Extra Columns
            df = df[required]

            # 4. Bulk Create
            objs = [
                TrainingData(
                    degree=row['degree'],
                    branch=row['branch'],
                    cgpa=row['cgpa'],
                    skills=row['skills'],
                    job_role=row['job_role'],
                    source='bulk_upload'
                )
                for _, row in df.iterrows()
            ]
            TrainingData.objects.bulk_create(objs)
            
            return Response({"message": f"Successfully added {len(objs)} records!"})
            
        except Exception as e:
            return Response({"error": f"Error processing file: {str(e)}"}, status=500)
            
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
        
        # Combine Features
        X = np.hstack((df[['degree_enc', 'branch_enc', 'cgpa']].values, skills_vec))
        y = df['job_role']
        
        # Train Random Forest
        clf = RandomForestClassifier(n_estimators=100)
        clf.fit(X, y)
        
        # --- SAVE MODELS ---
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
            self.preprocessor = EducationPreprocessor()
        except Exception as e:
            print("Model Load Error:", e)
            self.model = None

    def post(self, request):
        if not self.model:
            return Response({"error": "ML Model not loaded. Contact Admin."}, status=503)

        data = request.data
        user = request.user

        # Validation
        is_valid, message = self.preprocessor.validate_input(data)
        if not is_valid:
            return Response({"error": message}, status=400)

        try:
            # Preprocessing
            final_features = self.preprocessor.preprocess(data)

            # Prediction
            probabilities = self.model.predict_proba(final_features)[0]
            top3_indices = np.argsort(probabilities)[-3:][::-1]
            classes = self.model.classes_
            
            top_matches = []
            for index in top3_indices:
                role = classes[index]
                score = probabilities[index] * 100
                if score > 0:
                    top_matches.append({"role": role, "score": round(score, 2)})

            if not top_matches:
                 return Response({"error": "Could not determine a suitable role."}, status=400)

            best_match = top_matches[0]['role']
            best_score = top_matches[0]['score']

            # Save History
            JobPrediction.objects.create(
                user=user,
                highest_degree=data.get('highest_degree'),
                branch=data.get('branch'),
                cgpa=data.get('cgpa'),
                skills=data.get('skills'),
                predicted_role=best_match,
                confidence_score=best_score
            )

            return Response({
                "predicted_role": best_match,
                "confidence_score": best_score,
                "alternatives": top_matches[1:]
            }, status=200)

        except Exception as e:
            print("Prediction Logic Error:", e)
            return Response({"error": "Prediction failed internally."}, status=500)

class UserPredictionHistoryView(generics.ListAPIView):
    serializer_class = JobPredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPrediction.objects.filter(user=self.request.user).order_by('-created_at')

# ==========================================
# 3. CHAT & GROUPS VIEWS (NEWLY ADDED)
# ==========================================

class GroupListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns list of all study groups.
    POST: Creates a new study group.
    """
    queryset = StudyGroup.objects.all().order_by('-created_at')
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the creator as the logged-in user
        serializer.save(created_by=self.request.user)

class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns messages for a specific group (?group_id=1).
    POST: Sends a message to a specific group.
    """
    serializer_class = GroupMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter messages by Group ID passed in URL
        group_id = self.request.query_params.get('group_id')
        if group_id:
            return GroupMessage.objects.filter(group_id=group_id).order_by('created_at')
        return GroupMessage.objects.none()

    def perform_create(self, serializer):
        # Automatically set the sender as the logged-in user
        serializer.save(user=self.request.user)