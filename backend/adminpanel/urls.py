from django.urls import path
from .views import (
    admin_stats, 
    admin_users_list, 
    update_user_status, 
    admin_analytics_data
)

urlpatterns = [
    path('stats/', admin_stats, name='admin_stats'),
    path('users/', admin_users_list, name='admin_users_list'),
    path('user/<int:user_id>/status/', update_user_status, name='update_user_status'), # New
    path('analytics-data/', admin_analytics_data, name='admin_analytics_data'), # New
]