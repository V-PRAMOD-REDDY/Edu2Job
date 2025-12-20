from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model # <--- IMPORTANT FIX
from django.db.models import Q, Count
from profiles.models import UserProfile
from predictions.models import JobPrediction, TrainingData

# Get the active User model (accounts.User)
User = get_user_model()

# 1. ADMIN DASHBOARD STATS
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    total_users = User.objects.filter(is_staff=False).count()
    total_predictions = JobPrediction.objects.count()
    
    # Get last 5 registered students
    recent_users = User.objects.filter(is_staff=False).order_by('-date_joined')[:5]
    recent_data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "date": u.date_joined.strftime("%Y-%m-%d")
        } for u in recent_users
    ]

    return Response({
        "total_users": total_users,
        "total_predictions": total_predictions,
        "recent_users": recent_data
    })

# 2. ADVANCED USER LIST & FILTER
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users_list(request):
    # Get Filter Params
    search = request.GET.get('search', '')
    role = request.GET.get('role', '')
    college = request.GET.get('college', '')
    skill = request.GET.get('skill', '')
    min_cgpa = request.GET.get('min_cgpa', 0)
    status = request.GET.get('status', '') 

    # Efficient Query: Fetch Users + Profiles in one go
    users = User.objects.all().select_related('userprofile').order_by('-date_joined')

    # --- FILTER LOGIC ---
    if search:
        users = users.filter(Q(username__icontains=search) | Q(email__icontains=search))
    
    if role == 'ADMIN':
        users = users.filter(is_staff=True)
    elif role == 'USER':
        users = users.filter(is_staff=False)

    # Profile based filters
    if college:
        users = users.filter(userprofile__college__icontains=college)
    if skill:
        users = users.filter(userprofile__skills__icontains=skill)
    if min_cgpa:
        try:
            users = users.filter(userprofile__cgpa__gte=float(min_cgpa))
        except ValueError:
            pass 
    if status:
        users = users.filter(userprofile__recruitment_status=status)

    # --- DATA FORMATTING ---
    data = []
    for u in users:
        # Safely access profile
        p = getattr(u, 'userprofile', None)
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": "Admin" if u.is_staff else "Student",
            "college": p.college if p else "N/A",
            "degree": p.highest_degree if p else "N/A",
            "cgpa": p.cgpa if p else 0,
            "skills": p.skills if p else "",
            "status": p.recruitment_status if p else "PENDING",
            "joined_at": u.date_joined.strftime("%Y-%m-%d")
        })
        
    return Response(data)

# 3. UPDATE USER STATUS
@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_user_status(request, user_id):
    try:
        profile = UserProfile.objects.get(user_id=user_id)
        new_status = request.data.get('status')
        
        if new_status in ['SHORTLISTED', 'REJECTED', 'PENDING']:
            profile.recruitment_status = new_status
            profile.save()
            return Response({"message": f"User marked as {new_status}"})
        else:
            return Response({"error": "Invalid status"}, status=400)

    except UserProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

# 4. ANALYTICS DATA (With Fallback Logic)
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics_data(request):
    
    # --- A. ROLE DEMAND CHART LOGIC ---
    # Check if we have real predictions
    real_prediction_count = JobPrediction.objects.count()
    role_dist = []
    
    if real_prediction_count > 0:
        # Use Real Predictions
        queryset = JobPrediction.objects.values('predicted_role').annotate(count=Count('id')).order_by('-count')[:10]
        role_dist = list(queryset)
    else:
        # Fallback to CSV Training Data
        queryset = TrainingData.objects.values('job_role').annotate(count=Count('id')).order_by('-count')[:10]
        role_dist = [
            {'predicted_role': item['job_role'], 'count': item['count']} 
            for item in queryset
        ]

    # --- B. DEGREE DISTRIBUTION CHART LOGIC ---
    real_user_count = UserProfile.objects.exclude(highest_degree__isnull=True).exclude(highest_degree__exact='').count()
    degree_dist = []
    
    if real_user_count > 0:
        # Use Real User Data
        degree_dist = UserProfile.objects.values('highest_degree').annotate(count=Count('id'))
    else:
        # Fallback to CSV Data
        queryset = TrainingData.objects.values('degree').annotate(count=Count('id')).order_by('-count')[:6]
        degree_dist = [
            {'highest_degree': item['degree'], 'count': item['count']}
            for item in queryset
        ]

    return Response({
        "degree_distribution": degree_dist,
        "role_demand": role_dist,
        "source": "Real Data" if real_prediction_count > 0 else "Training Dataset (CSV)"
    })