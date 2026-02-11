from rest_framework import serializers
from .models import JobPrediction, TrainingData, StudyGroup, GroupMessage

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

# 3. CSV File Upload Serializer
class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

# --- 4. NEW CHAT SERIALIZERS (ADDED) ---

class StudyGroupSerializer(serializers.ModelSerializer):
    # Members count ni future lo dynamic cheyochu, ippatiki dummy/calc pettachu
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description', 'members_count', 'created_at']

    def get_members_count(self, obj):
        # Example: Count distinct users who messaged in this group
        return obj.messages.values('user').distinct().count()

class GroupMessageSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # User ID kakunda User Name vastundi
    timestamp = serializers.DateTimeField(source='created_at', format="%I:%M %p", read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'group', 'user', 'content', 'timestamp']