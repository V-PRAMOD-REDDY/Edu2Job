// src/components/prediction/LearningSection.tsx

import React from "react";
import { learningResources } from "../../data/learningPaths";
import { BookOpen, Video, ExternalLink, Code } from "lucide-react";

interface Props {
  role: string;
}

const LearningSection: React.FC<Props> = ({ role }) => {
  // Role match avvakapothe default ga Full Stack resources chupinchu
  const resources = learningResources[role] || learningResources["Full Stack Developer"];

  return (
    <div style={{ marginTop: "2rem", animation: "fadeIn 0.5s ease-in-out" }}>
      
      {/* Header */}
      <div style={{ 
        display: "flex", alignItems: "center", gap: "10px", 
        marginBottom: "1rem", paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" 
      }}>
        <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "8px" }}>
          <BookOpen size={24} color="#d97706" />
        </div>
        <div>
          <h3 style={{ margin: 0, color: "#1f2937", fontSize: "1.2rem" }}>Recommended Learning Path</h3>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
            Resources to become a generic <strong>{role}</strong>
          </p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {resources.map((res, index) => (
          <a 
            key={index} 
            href={res.link} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div 
              style={{ 
                background: "white", padding: "1.2rem", borderRadius: "12px", 
                border: "1px solid #e5e7eb", transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)", cursor: "pointer",
                height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.borderColor = "#818cf8";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ 
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", 
                    background: "#e0e7ff", color: "#4f46e5", padding: "4px 8px", borderRadius: "4px" 
                  }}>
                    {res.platform}
                  </span>
                  <ExternalLink size={16} color="#9ca3af" />
                </div>
                
                <h4 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "1rem", lineHeight: "1.4" }}>
                  {res.title}
                </h4>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "0.85rem", marginTop: "10px" }}>
                 {res.type === "Video" ? <Video size={14} /> : res.type === "Code" ? <Code size={14} /> : <BookOpen size={14} />} 
                 {res.type} Resource
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LearningSection;