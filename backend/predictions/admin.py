from django.contrib import admin
from .models import TrainingData, JobPrediction

@admin.register(TrainingData)
class TrainingDataAdmin(admin.ModelAdmin):
    list_display = ('degree', 'branch', 'job_role', 'cgpa', 'source', 'created_at')
    list_filter = ('job_role', 'degree', 'source')
    search_fields = ('skills', 'job_role')

@admin.register(JobPrediction)
class JobPredictionAdmin(admin.ModelAdmin):
    # Old field 'is_flagged' tesesi, kotha fields add chesamu
    list_display = ('user', 'predicted_role', 'confidence_score', 'created_at')
    list_filter = ('predicted_role', 'created_at')
    search_fields = ('user__username', 'predicted_role', 'skills')
    readonly_fields = ('created_at',)