import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, BrainCircuit, Loader2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api";

const UserDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    jobsApplied: 0,
    profileScore: 0, 
    predictions: 0
  });
  const [recentJob, setRecentJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Predictions Count
        const predRes = await api.get("/my-predictions/");
        const predictionCount = predRes.data.length;

        // 2. Fetch Profile Details (To calculate Score)
        let calculatedScore = 20; // Base score for just registering
        try {
          const profileRes = await api.get("/profile/"); 
          const p = profileRes.data;

          // Logic: Add points if fields are filled
          if (p.degree && p.degree.trim() !== "") calculatedScore += 20;
          if (p.branch && p.branch.trim() !== "") calculatedScore += 10;
          if (p.skills && p.skills.length > 0) calculatedScore += 20;
          
        } catch (err) {
          console.warn("Profile incomplete or fetch failed");
        }

        // 3. Add Bonus for Activity (Running at least one prediction)
        if (predictionCount > 0) {
          calculatedScore += 30;
        }

        // Cap score at 100
        if (calculatedScore > 100) calculatedScore = 100;

        // 4. Update State
        setStats({
          jobsApplied: 0, // Static for now
          profileScore: calculatedScore,
          predictions: predictionCount
        });

        // 5. Get Recent Prediction for "Recommended Jobs"
        if (predictionCount > 0) {
          setRecentJob(predRes.data[0]); // Get the latest one
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
          <Loader2 className="animate-spin" color="#4f46e5" />
        </div>
      </DashboardLayout>
    );
  }

  // Helper to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // Green (Excellent)
    if (score >= 50) return '#d97706'; // Orange (Good)
    return '#dc2626'; // Red (Poor)
  };

  return (
    <DashboardLayout>
      {/* Stats Row */}
      <div className="stats-row">
        
        {/* Jobs Applied */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}>
            <Briefcase size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem'}}>{stats.jobsApplied}</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Jobs Applied</span>
          </div>
        </div>
        
        {/* Profile Score (DYNAMIC NOW) */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#ecfdf5', color: getScoreColor(stats.profileScore)}}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem', color: getScoreColor(stats.profileScore)}}>
              {stats.profileScore}%
            </h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Profile Score</span>
          </div>
        </div>

        {/* Predictions Run */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem'}}>{stats.predictions}</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Predictions Run</span>
          </div>
        </div>
      </div>

      {/* Split Content */}
      <div className="content-split">
        
        {/* Recommended Jobs Section */}
        <div className="card">
          <h3>Recommended Jobs</h3>
          {stats.predictions > 0 && recentJob ? (
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'1rem', borderBottom:'1px solid #f3f4f6'}}>
                 <div>
                   <div style={{fontWeight:600, fontSize: '1.1rem', color: '#1f2937'}}>
                     {recentJob.predicted_role || "Software Engineer"}
                   </div>
                   <div style={{fontSize:'0.85rem', color:'#6b7280'}}>Based on your recent analysis</div>
                 </div>
                 <span style={{background:'#ecfdf5', color:'#059669', fontSize:'0.8rem', padding:'4px 8px', borderRadius:'4px', fontWeight:600}}>
                   {recentJob.confidence_score ? `${recentJob.confidence_score}% Match` : "High Match"}
                 </span>
               </div>
               
               <p style={{fontSize: '0.9rem', color: '#6b7280'}}>
                 Explore more opportunities for <b>{recentJob.predicted_role}</b>.
               </p>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
              <p>Profile score low? Complete your profile and run a prediction!</p>
            </div>
          )}

          <div style={{marginTop:'1.5rem'}}>
            <Link to="/predict" style={{color:'#4f46e5', fontWeight:600, textDecoration:'none', fontSize:'0.9rem'}}>
              {stats.predictions > 0 ? "Run new prediction →" : "Start your first prediction →"}
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <Link to="/profile" style={{textDecoration:'none'}}>
              <button style={{width:'100%', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>
                {stats.profileScore < 100 ? "Complete Profile (+Score)" : "Update Profile"}
              </button>
            </Link>
            <Link to="/predict" style={{textDecoration:'none'}}>
              <button style={{width:'100%', padding:'10px', background:'white', color:'#4f46e5', border:'1px solid #4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>
                Predict Role
              </button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardPage;