import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api"; 
import DashboardLayout from "../components/DashboardLayout";
import { 
  Users, Database, BrainCircuit, FileText, 
  Loader2, ArrowRight, TrendingUp 
} from "lucide-react";

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Real Stats from Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/adminpanel/stats/");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{display:'flex', justifyContent:'center', marginTop: 100, color:'#6b7280', gap: 10}}>
          <Loader2 className="animate-spin" /> Loading Dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      
      {/* 1. Stats Overview Grid */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        
        {/* Total Students Card */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.8rem', fontWeight: 700}}>{stats?.total_users || 0}</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Total Students</span>
          </div>
        </div>

        {/* Predictions Card */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#ecfdf5', color: '#059669'}}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.8rem', fontWeight: 700}}>{stats?.total_predictions || 0}</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Predictions Run</span>
          </div>
        </div>

        {/* Training Data Card */}
        <div className="stat-box">
          <div className="stat-icon" style={{background: '#fef3c7', color: '#d97706'}}>
            <Database size={24} />
          </div>
          <div>
            <h3 style={{margin:0, fontSize:'1.8rem', fontWeight: 700}}>Active</h3>
            <span style={{color:'#6b7280', fontSize:'0.9rem'}}>ML Model Status</span>
          </div>
        </div>
      </div>

      <div className="content-split">
        
        {/* 2. Admin Quick Actions */}
        <div className="card">
          <h3>Admin Controls</h3>
          <p style={{color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
            Manage users, update datasets, and monitor system performance.
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <Link to="/admin/users" style={{textDecoration: 'none'}}>
              <div style={{
                padding: '1.2rem', border: '1px solid #e5e7eb', borderRadius: '10px', 
                textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'all 0.2s'
              }}>
                <Users size={28} style={{color: '#4f46e5', marginBottom: '8px'}} />
                <h4 style={{margin: 0, color: '#1f2937', fontSize: '0.95rem'}}>Manage Users</h4>
              </div>
            </Link>

            <Link to="/admin/training-data" style={{textDecoration: 'none'}}>
              <div style={{
                padding: '1.2rem', border: '1px solid #e5e7eb', borderRadius: '10px', 
                textAlign: 'center', cursor: 'pointer', background: '#f9fafb', transition: 'all 0.2s'
              }}>
                <Database size={28} style={{color: '#059669', marginBottom: '8px'}} />
                <h4 style={{margin: 0, color: '#1f2937', fontSize: '0.95rem'}}>Retrain Model</h4>
              </div>
            </Link>
          </div>
        </div>

        {/* 3. Recent Registrations Table */}
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
            <h3>New Students</h3>
            <Link to="/admin/users" style={{fontSize:'0.85rem', color:'#4f46e5', textDecoration:'none', fontWeight: 600}}>View All</Link>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
             {stats?.recent_users?.length > 0 ? (
               stats.recent_users.map((user: any) => (
                 <div key={user.id} style={{
                   display:'flex', justifyContent:'space-between', alignItems: 'center',
                   paddingBottom: '10px', borderBottom: '1px solid #f3f4f6'
                 }}>
                   <div style={{display:'flex', gap: '10px', alignItems: 'center'}}>
                     <div style={{width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.8rem'}}>
                       {user.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <span style={{fontWeight: 600, display: 'block', fontSize: '0.9rem', color: '#1f2937'}}>{user.username}</span>
                       <span style={{color:'#9ca3af', fontSize:'0.75rem'}}>{user.email}</span>
                     </div>
                   </div>
                   <span style={{fontSize:'0.75rem', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', color: '#6b7280'}}>
                     {user.date}
                   </span>
                 </div>
               ))
             ) : (
               <p style={{color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', padding: '20px'}}>No recent users found.</p>
             )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;