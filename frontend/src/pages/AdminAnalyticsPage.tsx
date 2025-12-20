import React, { useEffect, useState } from "react";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Loader2, TrendingUp, PieChart as PieIcon } from "lucide-react";

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#8b5cf6'];

const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/adminpanel/analytics-data/");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100, gap: 10, color: '#6b7280' }}>
          <Loader2 className="animate-spin" /> Loading Analytics...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>System Analytics</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
            Data Source: <span style={{fontWeight: 600, color: '#4f46e5'}}>{data?.source}</span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Chart 1: Role Demand (Bar Chart) */}
          <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.1rem' }}>
              <TrendingUp size={20} color="#4f46e5" /> Top Job Roles
            </h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={data?.role_demand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="predicted_role" style={{ fontSize: '0.75rem' }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis style={{ fontSize: '0.8rem' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" fill="#4f46e5" name="Count" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Degree Distribution (Pie Chart) */}
          <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#1f2937', fontSize: '1.1rem' }}>
              <PieIcon size={20} color="#059669" /> Education Background
            </h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data?.degree_distribution}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="highest_degree"
                  >
                    {data?.degree_distribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;