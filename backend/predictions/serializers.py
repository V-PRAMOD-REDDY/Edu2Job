from rest_framework import serializers
from .models import JobPrediction, TrainingData

# 1. Prediction Data Serializer
class JobPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPrediction
        fields = '__all__'

# 2. Training Data Row Serializer
class TrainingDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingData
        fields = '__all__'

# 3. CSV File Upload Serializer (MISSING PART ADDED)
class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()