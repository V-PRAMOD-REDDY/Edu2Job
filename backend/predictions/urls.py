from django.urls import path
from .views import (
    TrainingDataListView,
    upload_training_csv,
    retrain_model,
    PredictJobView,
    UserPredictionHistoryView,
    # New Views
    GroupListCreateView,
    MessageListCreateView
)

urlpatterns = [
    # --- Admin URLs ---
    path('training-data/', TrainingDataListView.as_view(), name='training-data-list'),
    path('upload-csv/', upload_training_csv, name='upload-training-csv'),
    path('retrain/', retrain_model, name='retrain-model'),

    # --- Student Prediction URLs ---
    path('predict/', PredictJobView.as_view(), name='predict-job'),
    path('my-predictions/', UserPredictionHistoryView.as_view(), name='my-predictions'),

    # --- NEW CHAT URLs ---
    path('groups/', GroupListCreateView.as_view(), name='groups-list-create'),
    path('messages/', MessageListCreateView.as_view(), name='messages-list-create'),
]