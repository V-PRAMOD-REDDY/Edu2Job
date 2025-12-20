# backend/predictions/urls.py

from django.urls import path
from .views import (
    TrainingDataListView,
    upload_training_csv,
    retrain_model,
    PredictJobView,            # New Class-Based View
    UserPredictionHistoryView  # New Class-Based View
)

urlpatterns = [
    # --- Admin URLs ---
    path('training-data/', TrainingDataListView.as_view(), name='training-data-list'),
    path('upload-csv/', upload_training_csv, name='upload-training-csv'),
    path('retrain/', retrain_model, name='retrain-model'),

    # --- Student URLs ---
    # We use .as_view() because these are now Class-Based Views
    path('predict/', PredictJobView.as_view(), name='predict-job'),
    path('my-predictions/', UserPredictionHistoryView.as_view(), name='my-predictions'),
]