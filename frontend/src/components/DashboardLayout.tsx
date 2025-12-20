import React, { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/UserDashboard.css";
// Merged all icons into one import line
import { 
  LayoutDashboard, User, BrainCircuit, BarChart3, 
  LogOut, Bell, Users, Database 
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const name = user?.username || "User";
  const initial = name.charAt(0).toUpperCase();
  
  // Check if User is Admin
  const isAdmin = user?.role === "ADMIN"; 

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper for active menu class
  const isActive = (path: string) => location.pathname === path ? "menu-item active" : "menu-item";

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <BrainCircuit size={28} color="#818cf8" />
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="logo-text">
            Edu<span>2Jobs</span>
          </Link>
        </div>

        <nav className="sidebar-menu">
          {isAdmin ? (
            /* --- ADMIN MENU --- */
            <>
              <div style={{ padding: '0 16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                Admin Controls
              </div>
              <Link to="/admin" className={isActive("/admin")}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/admin/users" className={isActive("/admin/users")}>
                <Users size={20} /> Manage Users
              </Link>
              <Link to="/admin/training-data" className={isActive("/admin/training-data")}>
                <Database size={20} /> Training Data
              </Link>
              <Link to="/admin/analytics" className={isActive("/admin/analytics")}>
                <BarChart3 size={20} /> System Analytics
              </Link>
            </>
          ) : (
            /* --- STUDENT MENU --- */
            <>
              <div style={{ padding: '0 16px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                Student Menu
              </div>
              <Link to="/dashboard" className={isActive("/dashboard")}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/profile" className={isActive("/profile")}>
                <User size={20} /> My Profile
              </Link>
              <Link to="/predict" className={isActive("/predict")}>
                <BrainCircuit size={20} /> Job Prediction
              </Link>
              <Link to="/my-analytics" className={isActive("/my-analytics")}>
                <BarChart3 size={20} /> Analytics
              </Link>
              
              {/* NEW GROUPS LINK ADDED HERE */}
              <Link to="/groups" className={isActive("/groups")}>
                <Users size={20} /> Groups & Discuss
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP HEADER */}
        <header className="top-header">
          <div className="header-title">
            <h2>{isAdmin ? "Admin Portal" : "Student Portal"}</h2>
            <p>Welcome back, {name}</p>
          </div>
          <div className="user-profile">
            <Bell size={22} color="#6b7280" style={{cursor: 'pointer'}} />
            <div className="avatar-circle" style={{
              background: isAdmin ? '#fee2e2' : '#e0e7ff', 
              color: isAdmin ? '#ef4444' : '#4f46e5'
            }}>
              {initial}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;