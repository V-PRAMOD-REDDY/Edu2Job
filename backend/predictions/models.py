from django.db import models
from django.conf import settings

# ==========================================
# 1. EXISTING PREDICTION MODELS
# ==========================================

class TrainingData(models.Model):
    degree = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    cgpa = models.FloatField()
    skills = models.TextField()
    job_role = models.CharField(max_length=100)
    source = models.CharField(max_length=50, default='manual')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.degree}-{self.branch} -> {self.job_role}"

class JobPrediction(models.Model):
    # Link to the User who made the prediction
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Input Data Columns (Stored individually for better Analytics)
    highest_degree = models.CharField(max_length=100, null=True, blank=True)
    branch = models.CharField(max_length=100, null=True, blank=True)
    cgpa = models.FloatField(null=True, blank=True)
    skills = models.TextField(null=True, blank=True)
    
    # Prediction Results
    predicted_role = models.CharField(max_length=100)
    confidence_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Fallback in case user is deleted or username is missing
        username = self.user.username if self.user else "Unknown User"
        return f"{username} - {self.predicted_role}"

# ==========================================
# 2. NEW CHAT & GROUPS MODELS (ADDED)
# ==========================================

class StudyGroup(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    # Optional: Owner/Creator of the group
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at'] # Oldest messages first
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}..."