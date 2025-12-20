import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Loader2, History, TrendingUp, Calendar, ArrowRight } from "lucide-react";

// Types
type TopRole = { role: string; score: number };
type Item = {
  id: number;
  created_at: string;
  predicted_role: string; // Ensure backend sends this or derive from top_roles
  confidence_score: number;
  top_roles: TopRole[];
};

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const UserAnalyticsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, topRole: "N/A" });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/my-predictions/"); // Make sure this endpoint exists
        const data = res.data;
        setItems(data);

        // Calculate Stats
        if (data.length > 0) {
          // 1. Prepare Chart Data (Role Frequency)
          const roleCounts: Record<string, number> = {};
          data.forEach((item: any) => {
            // Support both direct field or top_roles array
            const role = item.predicted_role || (item.top_roles && item.top_roles[0]?.role) || "Unknown";
            roleCounts[role] = (roleCounts[role] || 0) + 1;
          });

          const chart = Object.keys(roleCounts).map(role => ({
            name: role,
            count: roleCounts[role]
          })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5
          
          setChartData(chart);

          // 2. Set Summary Stats
          setStats({
            total: data.length,
            topRole: chart.length > 0 ? chart[0].name : "N/A"
          });
        }

      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Loader2 className="animate-spin" size={30} color="#4f46e5" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1f2937', margin: 0 }}>My Analytics</h2>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>Track your career prediction history and trends.</p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <History size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#374151' }}>No Predictions Yet</h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Run your first analysis to see insights here.
            </p>
            <Link to="/predict" style={{ 
              background: '#4f46e5', color: 'white', padding: '10px 20px', 
              borderRadius: '8px', textDecoration: 'none', fontWeight: 600 
            }}>
              Go to Prediction
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '10px' }}>
                  <History size={24} color="#4f46e5" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Total Predictions</p>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>{stats.total}</h3>
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '10px' }}>
                  <TrendingUp size={24} color="#10b981" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Most Frequent Role</p>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1f2937' }}>{stats.topRole}</h3>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Chart Section */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151' }}>Role Frequency Trend</h3>
                <div style={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} style={{ fontSize: '0.8rem' }} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History List */}
              <div className="card" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} /> Recent History
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((it) => (
                    <div key={it.id} style={{ 
                      padding: '12px', border: '1px solid #f3f4f6', borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#f9fafb'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '0.95rem' }}>
                          {it.predicted_role || it.top_roles?.[0]?.role || "Prediction"}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {new Date(it.created_at).toLocaleDateString()} at {new Date(it.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      
                      {/* Score Badge */}
                      <div style={{ textAlign: 'right' }}>
                         <span style={{ 
                           background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', 
                           borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
                         }}>
                           {/* Handle different backend field names */}
                           {it.confidence_score ? `${it.confidence_score}%` : (it.top_roles?.[0]?.score ? `${(it.top_roles[0].score * 100).toFixed(0)}%` : 'N/A')}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAnalyticsPage;