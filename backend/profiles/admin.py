from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "highest_degree", "branch", "college", "cgpa")
    search_fields = ("user__email", "college", "branch")
