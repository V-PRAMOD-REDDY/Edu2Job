from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ['user']
        
        # IMPORTANT: Ee setting lekapothe empty URL pampinappudu error vastundi
        extra_kwargs = {
            'github': {'allow_blank': True},
            'linkedin': {'allow_blank': True},
            'phone': {'allow_blank': True},
            'highest_degree': {'allow_blank': True},
            'branch': {'allow_blank': True},
            'college': {'allow_blank': True},
            'state': {'allow_blank': True},
        }