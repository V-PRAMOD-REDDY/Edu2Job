import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { BrainCircuit, Loader2, Target, Briefcase, AlertTriangle, Search } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
// 1. IMPORT THE NEW COMPONENT
import LearningSection from "../components/prediction/LearningSection";

const JobPredictionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Get User Profile Data
      const profileRes = await api.get("/profile/me/");
      const profile = profileRes.data;

      // Validation: Check if basic fields are filled
      if (!profile.highest_degree || !profile.skills) {
        setError("Please update your profile with Degree and Skills before predicting.");
        setLoading(false);
        return;
      }

      // 2. Send to ML Model
      const res = await api.post("/predict/", {
        highest_degree: profile.highest_degree,
        branch: profile.branch,
        cgpa: profile.cgpa,
        skills: profile.skills
      });

      setResult(res.data);

    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to open Job Search
  const handleJobSearch = () => {
    if (result?.predicted_role) {
      const query = encodeURIComponent(result.predicted_role);
      window.open(`https://www.linkedin.com/jobs/search/?keywords=${query}`, '_blank');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Intro Card */}
        <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: 80, height: 80, background: '#e0e7ff', color: '#4f46e5', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', margin: '0 auto 1.5rem auto' 
          }}>
             <BrainCircuit size={40} />
          </div>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#1f2937' }}>
            AI Career Predictor
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Our Machine Learning model analyzes your academic background (Degree, CGPA) 
            and technical skills to predict the most suitable job role for you.
          </p>
          
          <button 
            onClick={handlePredict} 
            disabled={loading}
            style={{ 
              fontSize: '1.1rem', padding: '14px 32px', 
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
              color: 'white', border: 'none', borderRadius: '12px', 
              cursor: loading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontWeight: 600, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'transform 0.2s', opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
            {loading ? "Analyzing Profile..." : "Run Prediction Analysis"}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{ 
              marginTop: '20px', padding: '12px', background: '#fef2f2', 
              color: '#dc2626', borderRadius: '8px', display: 'inline-flex', 
              alignItems: 'center', gap: '8px', border: '1px solid #fee2e2'
            }}>
              <AlertTriangle size={18} /> {error} 
              {error.includes("update") && <Link to="/profile" style={{color: '#dc2626', fontWeight: 600, marginLeft: '5px'}}>Update Now</Link>}
            </div>
          )}
        </div>

        {/* Prediction Result Section */}
        {result && (
          <div style={{ animation: "fadeIn 0.5s ease-in-out" }}>
            
            {/* 1. Main Result Card */}
            <div className="card" style={{ border: '2px solid #4f46e5', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', 
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)'
              }}></div>
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Top Recommendation
                </h3>
                
                <h2 style={{ fontSize: '2.5rem', color: '#1f2937', margin: '1rem 0', fontWeight: 800 }}>
                  {result.predicted_role}
                </h2>
                
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#ecfdf5', color: '#059669', padding: '6px 16px', 
                  borderRadius: '99px', fontWeight: 600, fontSize: '1rem'
                }}>
                  <Target size={18} /> {result.confidence_score}% Match Score
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                  <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                    Based on your skills and academic history, this role offers the best career trajectory for you.
                  </p>
                  
                  <button 
                    onClick={handleJobSearch}
                    style={{
                      background: 'white', color: '#4f46e5', border: '1px solid #4f46e5',
                      padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#eef2ff'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Briefcase size={18} /> Find Jobs on LinkedIn
                  </button>
                </div>
              </div>
            </div>

            {/* 2. LEARNING PATH SECTION (New Integration) */}
            <div style={{ marginTop: '2rem' }}>
              <LearningSection role={result.predicted_role} />
            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default JobPredictionPage;