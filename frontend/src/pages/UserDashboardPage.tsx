import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, TrendingUp, BrainCircuit } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout"; // Import Layout

const UserDashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}>
            <Briefcase size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem'}}>12</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Jobs Applied</span>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#ecfdf5', color: '#059669'}}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem'}}>85%</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Profile Score</span>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.5rem'}}>4</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Predictions Run</span>
          </div>
        </div>
      </div>

      {/* Split Content */}
      <div className="content-split">
        {/* Recommended Jobs */}
        <div className="card">
          <h3>Recommended Jobs</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
             {/* Job 1 */}
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'1rem', borderBottom:'1px solid #f3f4f6'}}>
                <div>
                  <div style={{fontWeight:600}}>Data Scientist</div>
                  <div style={{fontSize:'0.85rem', color:'#6b7280'}}>Google • Hyderabad</div>
                </div>
                <span style={{background:'#ecfdf5', color:'#059669', fontSize:'0.8rem', padding:'4px 8px', borderRadius:'4px', fontWeight:600}}>98% Match</span>
             </div>
             {/* Job 2 */}
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:600}}>React Developer</div>
                  <div style={{fontSize:'0.85rem', color:'#6b7280'}}>Swiggy • Bangalore</div>
                </div>
                <span style={{background:'#ecfdf5', color:'#059669', fontSize:'0.8rem', padding:'4px 8px', borderRadius:'4px', fontWeight:600}}>92% Match</span>
             </div>
          </div>
          <div style={{marginTop:'1.5rem'}}>
            <Link to="/predict" style={{color:'#4f46e5', fontWeight:600, textDecoration:'none', fontSize:'0.9rem'}}>
              Run new prediction →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            <Link to="/profile" style={{textDecoration:'none'}}>
              <button style={{width:'100%', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600}}>
                Update Profile
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