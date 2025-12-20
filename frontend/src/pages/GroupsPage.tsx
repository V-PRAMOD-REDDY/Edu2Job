import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Users, MessageSquare, Send, PlusCircle, Briefcase } from "lucide-react";

// Dummy Data for UI Demo
const initialGroups = [
  { id: 1, name: "Batch 2025 Job Seekers", members: 12, desc: "Updates for freshers jobs" },
  { id: 2, name: "Python Developers", members: 8, desc: "Python & Django discussions" },
  { id: 3, name: "Study Circle", members: 5, desc: "Mock interviews & prep" },
];

const initialPosts = [
  { id: 1, user: "Ravi", time: "2 hrs ago", content: "Guys, TCS hiring start ayindi! Check this link...", tag: "Job Alert" },
  { id: 2, user: "Sibi", time: "5 hrs ago", content: "Can anyone suggest best Django tutorial?", tag: "Question" },
];

const GroupsPage: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<any>(null); // Null means list view
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      user: "You",
      time: "Just now",
      content: newPost,
      tag: "Discussion"
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', height: '85vh', display: 'flex', gap: '20px' }}>
        
        {/* LEFT: Groups List */}
        <div style={{ width: '300px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="#4f46e5" /> My Groups
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {initialGroups.map(g => (
              <div 
                key={g.id}
                onClick={() => setActiveGroup(g)}
                style={{ 
                  padding: '12px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer',
                  background: activeGroup?.id === g.id ? '#e0e7ff' : '#f9fafb',
                  border: activeGroup?.id === g.id ? '1px solid #4f46e5' : '1px solid #f3f4f6'
                }}
              >
                <h4 style={{ margin: 0, color: '#1f2937' }}>{g.name}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#6b7280' }}>{g.members} Members</p>
              </div>
            ))}
          </div>

          <button style={{ 
            width: '100%', padding: '10px', background: '#4f46e5', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', 
            justifyContent: 'center', gap: '8px', fontWeight: 600 
          }}>
            <PlusCircle size={18} /> Create New Group
          </button>
        </div>

        {/* RIGHT: Chat Area */}
        <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {activeGroup ? (
            <>
              {/* Header */}
              <div style={{ padding: '15px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
                <h3 style={{ margin: 0 }}>{activeGroup.name}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{activeGroup.desc}</p>
              </div>

              {/* Messages Feed */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fdfbf7' }}>
                {posts.map(post => (
                  <div key={post.id} style={{ 
                    background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#4f46e5' }}>{post.user}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{post.time}</span>
                    </div>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>{post.content}</p>
                    <span style={{ 
                      display: 'inline-block', marginTop: '10px', fontSize: '0.7rem', 
                      background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px' 
                    }}>
                      {post.tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Share job update or ask something..." 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                <button 
                  onClick={handlePost}
                  style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <MessageSquare size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3>Select a group to start discussion</h3>
              <p>Join communities to accelerate your job search.</p>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default GroupsPage;