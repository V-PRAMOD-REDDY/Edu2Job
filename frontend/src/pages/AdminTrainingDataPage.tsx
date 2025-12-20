import React, { useEffect, useState } from "react";
import api from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Database, UploadCloud, RefreshCw, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const AdminTrainingDataPage: React.FC = () => {
  const [dataList, setDataList] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null);

  // 1. Fetch Existing Data
  const fetchData = async () => {
    try {
      const res = await api.get("/training-data/"); // Check your URL prefix (might be /api/training-data/)
      // Backend pagination unte res.data.results, lekapothe res.data
      setDataList(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle File Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/upload-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg({ type: "success", text: "CSV Uploaded & Data Added Successfully!" });
      setFile(null);
      fetchData(); // Refresh list
    } catch (err: any) {
      setMsg({ type: "error", text: err.response?.data?.error || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Retrain Model
  const handleRetrain = async () => {
    setRetraining(true);
    setMsg(null);
    try {
      const res = await api.post("/retrain/");
      setMsg({ type: "success", text: `Success! ${res.data.message}` });
    } catch (err) {
      setMsg({ type: "error", text: "Retraining failed." });
    } finally {
      setRetraining(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.8rem" }}>Training Data Management</h2>
            <p style={{ color: "#6b7280", margin: "5px 0 0 0" }}>Upload new datasets to improve prediction accuracy.</p>
          </div>
          <button 
            onClick={handleRetrain}
            disabled={retraining}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#4f46e5", color: "white", padding: "10px 20px",
              border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer",
              opacity: retraining ? 0.7 : 1
            }}
          >
            {retraining ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {retraining ? "Retraining..." : "Retrain Model Now"}
          </button>
        </div>

        {/* Status Message */}
        {msg && (
          <div style={{
            padding: "12px", borderRadius: "8px", marginBottom: "20px",
            background: msg.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: msg.type === "success" ? "#059669" : "#dc2626",
            display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${msg.type === "success" ? "#d1fae5" : "#fecaca"}`
          }}>
            {msg.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {msg.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
          
          {/* LEFT: Upload Box */}
          <div className="card" style={{ height: "fit-content" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UploadCloud size={20} color="#4f46e5" /> Upload CSV
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
              File must have columns: <strong>degree, branch, cgpa, skills, job_role</strong>
            </p>
            
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                style={{ border: "1px dashed #d1d5db", padding: "20px", borderRadius: "8px", background: "#f9fafb", cursor: "pointer" }}
              />
              <button 
                type="submit" 
                disabled={!file || uploading}
                style={{
                  padding: "10px", background: file ? "#059669" : "#e5e7eb",
                  color: file ? "white" : "#9ca3af", border: "none", borderRadius: "8px",
                  fontWeight: 600, cursor: file ? "pointer" : "not-allowed"
                }}
              >
                {uploading ? "Uploading..." : "Upload Data"}
              </button>
            </form>
          </div>

          {/* RIGHT: Data Table */}
          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Database size={20} color="#4f46e5" /> Recent Data Entries
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", marginTop: "10px" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", textAlign: "left", color: "#6b7280" }}>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Role</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Degree</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Skills</th>
                    <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.slice(0, 10).map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px", fontWeight: 600, color: "#1f2937" }}>{row.job_role}</td>
                      <td style={{ padding: "10px", color: "#4b5563" }}>{row.degree} ({row.cgpa})</td>
                      <td style={{ padding: "10px", color: "#6b7280", maxWidth: "200px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {row.skills}
                      </td>
                      <td style={{ padding: "10px", color: "#9ca3af", fontSize: "0.8rem" }}>
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {dataList.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
                        No training data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTrainingDataPage;