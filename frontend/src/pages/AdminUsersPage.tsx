import React, { useEffect, useState } from "react";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Search, Filter, CheckCircle, XCircle, Loader2, Download } from "lucide-react";

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    college: "",
    skill: "",
    status: "", // PENDING, SHORTLISTED, REJECTED
  });

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build Query String
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.college) params.append("college", filters.college);
      if (filters.skill) params.append("skill", filters.skill);
      if (filters.status) params.append("status", filters.status);

      const res = await api.get(`/adminpanel/users/?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & Filter Change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [filters]);

  // Handle Accept/Reject
  const updateStatus = async (userId: number, newStatus: string) => {
    try {
      await api.post(`/adminpanel/user/${userId}/status/`, { status: newStatus });
      // Update UI locally to reflect change instantly
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.8rem" }}>Manage Students</h2>
            <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Filter candidates and shortlist them for jobs.</p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: "8px", background: "white", 
            border: "1px solid #d1d5db", padding: "10px 15px", borderRadius: "8px", cursor: "pointer"
          }}>
            <Download size={18} /> Export CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af' }} />
            <input 
              placeholder="Search Name or Email..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ width: '100%', padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <input 
            placeholder="Filter by College" 
            value={filters.college}
            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />

          <input 
            placeholder="Filter by Skill (e.g. Python)" 
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
          />

          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white' }}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
          </select>

        </div>

        {/* Users Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}><Loader2 className="animate-spin" /> Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "15px" }}>Student</th>
                  <th style={{ padding: "15px" }}>Education</th>
                  <th style={{ padding: "15px" }}>Skills</th>
                  <th style={{ padding: "15px" }}>CGPA</th>
                  <th style={{ padding: "15px" }}>Status</th>
                  <th style={{ padding: "15px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>{u.username}</div>
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "15px", color: "#4b5563" }}>
                      {u.degree} <br/> <span style={{fontSize:'0.8em', color:'#9ca3af'}}>{u.college}</span>
                    </td>
                    <td style={{ padding: "15px", maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.skills || "-"}
                    </td>
                    <td style={{ padding: "15px", fontWeight: 600 }}>{u.cgpa}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                        background: u.status === 'SHORTLISTED' ? '#d1fae5' : u.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6',
                        color: u.status === 'SHORTLISTED' ? '#065f46' : u.status === 'REJECTED' ? '#b91c1c' : '#4b5563'
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px", display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => updateStatus(u.id, 'SHORTLISTED')}
                        style={{ border: '1px solid #10b981', background: 'white', color: '#10b981', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Accept / Shortlist"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => updateStatus(u.id, 'REJECTED')}
                        style={{ border: '1px solid #ef4444', background: 'white', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>No students found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;