from rest_framework import generics
from .models import UserProfile
from .serializers import UserProfileSerializer

class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
