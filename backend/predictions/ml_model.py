import joblib
import os
import numpy as np
from scipy.sparse import hstack

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'model_artifacts')

model = None
encoder = None
skills_vec = None

def load_artifacts():
    global model, encoder, skills_vec
    if model is None:
        model = joblib.load(os.path.join(MODEL_DIR, 'model.joblib'))
        encoder = joblib.load(os.path.join(MODEL_DIR, 'encoder.joblib'))
        skills_vec = joblib.load(os.path.join(MODEL_DIR, 'skills_vectorizer.joblib'))

def predict_jobs(profile):
    load_artifacts()

    degree = profile.highest_degree
    branch = profile.branch
    cgpa = profile.cgpa
    skills = profile.skills or ""

    X_cat = encoder.transform([[degree, branch]])
    X_cgpa = np.array([[cgpa]])
    X_sk = skills_vec.transform([skills])

    X = hstack([X_cat, X_cgpa, X_sk])
    proba = model.predict_proba(X)[0]
    classes = model.classes_

    top_indices = proba.argsort()[::-1][:3]
    top_roles = [
        {"role": classes[i], "score": float(proba[i])}
        for i in top_indices
    ]
    return top_roles
