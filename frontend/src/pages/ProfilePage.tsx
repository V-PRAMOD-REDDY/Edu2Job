import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom"; 
import api from "../api";
import { useAuth } from "../auth/useAuth";
import { 
  User, Save, Loader2, Github, Linkedin, Camera, Sparkles, 
  AlertCircle, CheckCircle2, Building2, BookOpen, FileText, 
  Briefcase, AlertTriangle, Award, Image as ImageIcon, X, 
  LayoutDashboard, BrainCircuit, BarChart3, ArrowLeft 
} from "lucide-react"; 
import "../styles/ProfilePage.css"; 
import DashboardLayout from "../components/DashboardLayout";

// --- CONSTANTS ---
const TOP_COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "NIT Warangal", "NIT Trichy",
  "IIIT Hyderabad", "BITS Pilani", "JNTU Hyderabad", "Osmania University",
  "Andhra University", "Anna University", "VIT Vellore", "SRM University",
  "Amrita Vishwa Vidyapeetham", "Lovely Professional University", "Other"
];

const DEGREES = ["B.Tech", "B.E", "M.Tech", "MCA", "MBA", "B.Sc", "M.Sc", "Ph.D", "Other"];
const BRANCHES = ["CSE", "ECE", "EEE", "Mechanical", "Civil", "IT", "AI & DS", "Data Science", "Cyber Security", "Other"];
const CURRENT_STATUS = ["Student", "Looking for Internship", "Open to Work", "Employed", "Higher Studies"];
const LOCATIONS = ["Hyderabad", "Bangalore", "Pune", "Chennai", "Mumbai", "Delhi", "Remote"];

const YEARS = Array.from(new Array(11), (val, index) => 2020 + index);

type Profile = {
  username: string; email: string; phone?: string; bio?: string;
  highest_degree: string; branch: string; college: string; 
  graduation_year: string;
  cgpa: string | number; grading_type?: 'CGPA' | 'Percentage';
  skills: string; soft_skills: string; certifications?: string;
  github?: string; linkedin?: string; 
  current_status: string; preferred_location: string;
  resume?: string; 
};

const emptyProfile: Profile = {
  username: "", email: "", phone: "", bio: "",
  highest_degree: "", branch: "", college: "", graduation_year: "",
  cgpa: "", grading_type: 'CGPA',
  skills: "", soft_skills: "", certifications: "",
  github: "", linkedin: "",
  current_status: "Student", preferred_location: "",
  resume: "" 
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation(); 
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Custom Logic States
  const [isOtherCollege, setIsOtherCollege] = useState(false);
  const [manualCollege, setManualCollege] = useState("");
  const [isOtherDegree, setIsOtherDegree] = useState(false);
  const [manualDegree, setManualDegree] = useState("");
  const [isOtherBranch, setIsOtherBranch] = useState(false);
  const [manualBranch, setManualBranch] = useState("");

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/profile/me/");
        const data = res.data;

        let collegeVal = data.college || "";
        if (collegeVal && !TOP_COLLEGES.includes(collegeVal) && collegeVal !== "Other") {
          setIsOtherCollege(true);
          setManualCollege(collegeVal);
          collegeVal = "Other";
        }

        let degreeVal = data.highest_degree || "";
        if (degreeVal && !DEGREES.includes(degreeVal) && degreeVal !== "Other") {
          setIsOtherDegree(true);
          setManualDegree(degreeVal);
          degreeVal = "Other";
        }

        let branchVal = data.branch || "";
        if (branchVal && !BRANCHES.includes(branchVal) && branchVal !== "Other") {
          setIsOtherBranch(true);
          setManualBranch(branchVal);
          branchVal = "Other";
        }

        setProfile({ 
          ...emptyProfile, 
          username: user?.username || "", 
          email: user?.email || "", 
          ...data,
          college: collegeVal,
          highest_degree: degreeVal,
          branch: branchVal,
          grading_type: data.grading_type || 'CGPA',
          resume: data.resume || ""
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "college") { setIsOtherCollege(value === "Other"); if (value !== "Other") setManualCollege(""); }
    if (name === "highest_degree") { setIsOtherDegree(value === "Other"); if (value !== "Other") setManualDegree(""); }
    if (name === "branch") { setIsOtherBranch(value === "Other"); if (value !== "Other") setManualBranch(""); }
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof Profile) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.currentTarget;
      const val = input.value.trim();
      if (val) {
        const currentTags = profile[field] ? (profile[field] as string).split(',').map(s => s.trim()).filter(Boolean) : [];
        if (!currentTags.includes(val)) {
          const newStr = [...currentTags, val].join(', ');
          setProfile(prev => ({ ...prev, [field]: newStr }));
        }
        input.value = "";
      }
    }
  };

  const handleDeleteTag = (field: keyof Profile, tagToDelete: string) => {
    const currentTags = (profile[field] as string).split(',').map(s => s.trim()).filter(Boolean);
    const newTags = currentTags.filter(t => t !== tagToDelete).join(', ');
    setProfile(prev => ({ ...prev, [field]: newTags }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setBannerPreview(objectUrl);
    }
  };

  const renderTags = (field: keyof Profile) => {
    const str = profile[field] as string;
    if (!str) return null;
    return (
      <div className="tags-container">
        {str.split(',').map(s => s.trim()).filter(Boolean).map((tag, i) => (
          <span key={i} className="tag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {tag}
            <button type="button" onClick={() => handleDeleteTag(field, tag)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#6b7280'}}>
              <X size={14} className="hover:text-red-500" />
            </button>
          </span>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    const dataToSend = {
      ...profile,
      college: isOtherCollege ? manualCollege : profile.college,
      highest_degree: isOtherDegree ? manualDegree : profile.highest_degree,
      branch: isOtherBranch ? manualBranch : profile.branch,
    };
    try {
      await api.put("/profile/me/", dataToSend);
      setMsg({ type: 'success', text: "Success! Profile updated successfully." });
    } catch (err) {
      setMsg({ type: 'error', text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const rawProgress = Object.values(profile).filter(v => v && v.toString().length > 0).length / 14 * 100;
  const progress = Math.min(Math.round(rawProgress), 100);

  if (loading) return <div style={{display:'flex', justifyContent:'center', paddingTop: 100}}><Loader2 className="animate-spin" /></div>;

  return (
    <DashboardLayout>
      {/* --- FIXED CSS FOR STICKY NAV --- */}
      <style>{`
        /* Default: Hide mobile navs on desktop */
        .mobile-bottom-nav, .mobile-top-nav {
          display: none !important;
        }

        @media (max-width: 768px) {
          /* 1. FORCE SHOW MOBILE NAVS */
          .mobile-bottom-nav, .mobile-top-nav {
            display: flex !important;
          }

          /* 2. TOP NAV (Sticky Header) */
          .mobile-top-nav {
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 12px 16px;
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 500;
            border-bottom: 1px solid #f3f4f6;
          }

          /* 3. BOTTOM NAV (FIXED FOOTER - THE FIX) */
          .mobile-bottom-nav {
            justify-content: space-around;
            align-items: center;
            background: #ffffff;
            
            /* KEY FIX: Use fixed positioning relative to viewport */
            position: fixed !important; 
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            
            width: 100%;
            height: 65px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
            border-top: 1px solid #f3f4f6;
            
            /* Highest Z-Index ensures it floats above everything */
            z-index: 2147483647 !important; 
            
            padding-bottom: env(safe-area-inset-bottom, 10px);
          }

          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 0.7rem;
            color: #9ca3af;
            text-decoration: none;
            gap: 4px;
            padding: 8px;
            flex: 1; /* Distribute space evenly */
          }

          .nav-item.active {
            color: #4f46e5;
            font-weight: 600;
          }

          /* 4. LAYOUT ADJUSTMENTS - Prevent content hiding behind nav */
          .profile-page-container {
             padding-bottom: 100px !important; /* Extra space for bottom nav */
             overflow-x: hidden;
          }

          .profile-content-wrapper {
            flex-direction: column; 
            padding: 0 1rem;
          }
          
          .profile-main-col { width: 100%; margin-right: 0; }
          .profile-sidebar { width: 100%; margin-top: 1.5rem; position: static; }
          
          .form-grid-2 { grid-template-columns: 1fr !important; gap: 1rem; }
          
          .user-avatar-row {
            flex-direction: column;
            text-align: center;
            margin-top: -40px;
          }
          .avatar-wrapper { margin-right: 0; margin-bottom: 10px; }
          .user-title-box { align-items: center; }
          .badge-row { justify-content: center; }
          .input-group.full-width { grid-column: span 1; }
        }
      `}</style>

      <div className="profile-page-container" style={{background: 'transparent'}}>
        
        {/* --- MOBILE TOP NAV --- */}
        <div className="mobile-top-nav">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#374151', fontWeight: 600 }}>
            <ArrowLeft size={20} /> Dashboard
          </Link>
          <div style={{fontSize: '0.9rem', color: '#6b7280'}}>Edit Profile</div>
        </div>

        {/* --- MOBILE BOTTOM NAV (FIXED) --- */}
        <div className="mobile-bottom-nav">
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Home</span>
          </Link>
          <Link to="/predict" className={`nav-item ${location.pathname === '/predict' ? 'active' : ''}`}>
            <BrainCircuit size={20} />
            <span>Predict</span>
          </Link>
          <Link to="/analytics" className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Stats</span>
          </Link>
          <Link to="/profile" className={`nav-item active`}>
            <User size={20} />
            <span>Profile</span>
          </Link>
        </div>

        {/* BANNER */}
        <div 
          className="profile-header-bg" 
          style={{
            backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'linear-gradient(120deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative', 
            zIndex: 1
          }}
        >
          <button className="edit-banner-btn" onClick={() => bannerInputRef.current?.click()}>
            <ImageIcon size={18} /> Edit Cover
          </button>
          <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={handleBannerUpload} />
        </div>

        <div className="profile-content-wrapper" style={{ position: 'relative', zIndex: 10 }}> 
          
          {/* MAIN FORM */}
          <div className="profile-main-col">
            <form onSubmit={handleSubmit} className="profile-card animate-fade-in">
              
              <div className="user-avatar-row" style={{ position: 'relative', zIndex: 20 }}>
                <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                  <div className="avatar-box" style={{background: '#f3e8ff', color:'#7c3aed', fontSize:'2.5rem'}}>
                    {profile.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="avatar-edit-overlay"><Camera size={20} /></div>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" />
                </div>
                <div className="user-title-box">
                  <h1>{profile.username || "Student"}</h1>
                  <div className="badge-row">
                    <span className="badge-role">{profile.current_status}</span>
                    {profile.graduation_year && <span className="badge-readonly">Class of {profile.graduation_year}</span>}
                  </div>
                </div>
              </div>

              {msg && (
                <div className={`msg-box ${msg.type}`}>
                  {msg.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                  <span>{msg.text}</span>
                </div>
              )}

              <div className="form-section">
                <div className="section-header">
                  <User size={20} className="text-purple-600"/><span>Personal Information</span>
                </div>
                
                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input className="form-input" name="username" value={profile.username} onChange={handleChange} placeholder="Enter full name" />
                  </div>
                  <div className="input-group">
                    <label>Email (Read-only)</label>
                    <input className="form-input" value={profile.email} readOnly style={{background:'#f9fafb', color:'#6b7280', cursor:'not-allowed'}} />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input className="form-input" name="phone" value={profile.phone} onChange={handleChange} placeholder="+91..." />
                  </div>
                  <div className="input-group">
                    <label>Short Bio</label>
                    <input className="form-input" name="bio" value={profile.bio} onChange={handleChange} placeholder="Aspiring Developer..." />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <Building2 size={20} className="text-purple-600"/><span>Education Details</span>
                </div>
                
                <div className="form-grid-2">
                   <div className="input-group full-width">
                    <label>College / University</label>
                    <select name="college" className="form-select" value={profile.college} onChange={handleChange}>
                      <option value="">Select College</option>
                      {TOP_COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {isOtherCollege && (
                      <input className="form-input manual-input" placeholder="Type your College Name..." value={manualCollege} onChange={(e) => setManualCollege(e.target.value)} required />
                    )}
                  </div>

                  <div className="input-group">
                    <label>Degree</label>
                    <select name="highest_degree" className="form-select" value={profile.highest_degree} onChange={handleChange}>
                      <option value="">Select Degree</option>
                      {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {isOtherDegree && (
                      <input className="form-input manual-input" placeholder="Type your Degree..." value={manualDegree} onChange={(e) => setManualDegree(e.target.value)} required />
                    )}
                  </div>

                  <div className="input-group">
                    <label>Branch / Specialization</label>
                    <select name="branch" className="form-select" value={profile.branch} onChange={handleChange}>
                      <option value="">Select Branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {isOtherBranch && (
                      <input className="form-input manual-input" placeholder="Type your Branch..." value={manualBranch} onChange={(e) => setManualBranch(e.target.value)} required />
                    )}
                  </div>

                  <div className="input-group">
                    <label>Graduation Year</label>
                    <select name="graduation_year" className="form-select" value={profile.graduation_year} onChange={handleChange}>
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                 <div className="section-header"><BookOpen size={20} className="text-purple-600"/><span>Academic Score</span></div>
                <div className="input-group">
                  <label style={{marginBottom: 10, display:'block'}}>Grading System</label>
                  <div className="radio-group-container">
                    <label className={`radio-card ${profile.grading_type === 'CGPA' ? 'active' : ''}`}>
                      <input type="radio" name="grading_type" value="CGPA" checked={profile.grading_type === 'CGPA'} onChange={() => setProfile({...profile, grading_type: 'CGPA'})} />
                      <div className="radio-content">
                        <span className="radio-title">CGPA</span>
                        <span className="radio-desc">Scale of 10.0</span>
                      </div>
                    </label>
                    <label className={`radio-card ${profile.grading_type === 'Percentage' ? 'active' : ''}`}>
                      <input type="radio" name="grading_type" value="Percentage" checked={profile.grading_type === 'Percentage'} onChange={() => setProfile({...profile, grading_type: 'Percentage'})} />
                      <div className="radio-content">
                        <span className="radio-title">Percentage</span>
                        <span className="radio-desc">Scale of 100%</span>
                      </div>
                    </label>
                  </div>
                  <div style={{marginTop: 15}}>
                    <label>{profile.grading_type === 'CGPA' ? 'CGPA Score' : 'Percentage Score'}</label>
                    <input className="form-input" name="cgpa" type="number" step={profile.grading_type === 'CGPA' ? "0.01" : "0.1"} max={profile.grading_type === 'CGPA' ? 10 : 100} value={profile.cgpa} onChange={handleChange} placeholder={profile.grading_type === 'CGPA' ? "e.g. 8.5" : "e.g. 85.0"} style={{fontWeight:'bold', color:'#7c3aed', fontSize: '1.1rem'}} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header"><Award size={20} className="text-purple-600"/><span>Skills & Achievements</span></div>
                <div className="input-group">
                  <label>Technical Skills <small style={{color:'#6b7280'}}>(Type & Press Enter)</small></label>
                  <div className="chip-input-wrapper">{renderTags('skills')}<input className="chip-input" placeholder="+ Add skill..." onKeyDown={(e) => handleTagInput(e, 'skills')}/></div>
                </div>
                <div className="input-group">
                  <label>Certifications <small style={{color:'#6b7280'}}>(Type & Press Enter)</small></label>
                  <div className="chip-input-wrapper">{renderTags('certifications')}<input className="chip-input" placeholder="+ Add Cert..." onKeyDown={(e) => handleTagInput(e, 'certifications')}/></div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header"><Briefcase size={20} className="text-purple-600"/><span>Career & Socials</span></div>
                <div className="form-grid-2">
                  <div className="input-group">
                    <label>Current Status</label>
                    <select name="current_status" className="form-select" value={profile.current_status} onChange={handleChange}>
                      {CURRENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Preferred Location</label>
                    <select name="preferred_location" className="form-select" value={profile.preferred_location} onChange={handleChange}>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2" style={{marginTop: 20}}>
                  <div className="input-group">
                    <label>LinkedIn</label>
                    <div className="icon-input"><Linkedin size={20} /><input name="linkedin" value={profile.linkedin} onChange={handleChange} placeholder="linkedin.com/in/..." /></div>
                  </div>
                  <div className="input-group">
                    <label>GitHub</label>
                    <div className="icon-input"><Github size={20} /><input name="github" value={profile.github} onChange={handleChange} placeholder="github.com/..." /></div>
                  </div>
                </div>

                <div className="input-group" style={{marginTop: 20}}>
                  <label>Resume / CV</label>
                  <div className="resume-upload-box" onClick={() => resumeInputRef.current?.click()}>
                    <FileText size={32} color="#9ca3af" />
                    <div style={{marginTop:8}}>
                      <span style={{color:'#4f46e5', fontWeight:600}}>Upload a file</span> or drag and drop
                      <p style={{fontSize:'0.8rem', color:'#6b7280', margin:0}}>PDF, DOCX up to 5MB</p>
                    </div>
                    <input type="file" ref={resumeInputRef} hidden accept=".pdf,.docx" />
                  </div>
                </div>
              </div>

              <button type="submit" className="save-btn-large" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {saving ? "Saving Changes..." : "Save Profile Information"}
              </button>

            </form>
          </div>

          <div className="profile-sidebar">
            <div className="sidebar-card strength-card">
              <h3>Profile Strength</h3>
              <div className="circle-progress">
                 <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="percentage">{progress}%</div>
              </div>
              <p className="strength-text">Complete your profile to get better AI recommendations.</p>
            </div>
            
            <div className="sidebar-card">
              <h3><Sparkles size={16} fill="gold" color="gold"/> Suggestions</h3>
              <ul className="tips-list">
                {!profile.graduation_year && <li><AlertCircle size={14} color="#ef4444"/> Add Graduation Year</li>}
                {!profile.resume && <li><AlertCircle size={14} color="#ef4444"/> Upload Resume</li>}
                {profile.linkedin ? <li><CheckCircle2 size={14} color="#22c55e"/> LinkedIn Linked</li> : <li><AlertCircle size={14} color="#ef4444"/> Add LinkedIn</li>}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;