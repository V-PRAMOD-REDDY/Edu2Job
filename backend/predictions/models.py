from django.db import models
from django.conf import settings

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