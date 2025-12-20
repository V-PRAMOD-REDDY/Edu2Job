# train_model.py
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

# 1. Create Dummy Data (Education + Skills -> Job Role)
data = {
    'degree': ['B.Tech', 'B.Tech', 'B.Sc', 'MCA', 'B.Tech', 'M.Tech', 'B.Tech', 'B.Com'],
    'branch': ['CSE', 'ECE', 'Maths', 'Computer Applications', 'Mechanical', 'CSE', 'Civil', 'Commerce'],
    'cgpa': [8.5, 7.2, 9.0, 7.8, 6.5, 8.8, 7.0, 8.0],
    'skills': [
        'Python, Django, React, SQL', 
        'Embedded Systems, C, IoT', 
        'Statistics, R, Python', 
        'Java, Spring Boot, SQL', 
        'AutoCAD, SolidWorks', 
        'Machine Learning, Python, Deep Learning',
        'AutoCAD, Construction Management',
        'Accounting, Tally, Excel'
    ],
    'job_role': [
        'Full Stack Developer', 
        'Embedded Engineer', 
        'Data Analyst', 
        'Java Developer', 
        'Mechanical Design Engineer', 
        'AI/ML Engineer',
        'Civil Engineer',
        'Accountant'
    ]
}

# Convert to DataFrame
df = pd.DataFrame(data)

# 2. Preprocessing
# A. Encode Categorical Data (Degree, Branch)
le_degree = LabelEncoder()
df['degree_enc'] = le_degree.fit_transform(df['degree'])

le_branch = LabelEncoder()
df['branch_enc'] = le_branch.fit_transform(df['branch'])

# B. Vectorize Skills (Text -> Numbers)
vectorizer = TfidfVectorizer(max_features=50) # Taking top 50 words
skills_matrix = vectorizer.fit_transform(df['skills']).toarray()

# C. Combine Features (Degree + Branch + CGPA + Skills Vector)
# Inputs (X)
X = np.hstack((
    df[['degree_enc', 'branch_enc', 'cgpa']].values, 
    skills_matrix
))

# Target (Y)
y = df['job_role']

# 3. Train Model
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)

# 4. Save Everything (Serialization)
import os
if not os.path.exists('ml_models'):
    os.makedirs('ml_models')

print("Saving models...")
joblib.dump(clf, 'ml_models/job_model.pkl')
joblib.dump(vectorizer, 'ml_models/skills_vectorizer.pkl')
joblib.dump(le_degree, 'ml_models/degree_encoder.pkl')
joblib.dump(le_branch, 'ml_models/branch_encoder.pkl')

print("✅ Model Trained & Saved in 'ml_models/' folder!")