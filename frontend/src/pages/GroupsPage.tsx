import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api"; 
import { useAuth } from "../auth/useAuth";
import { Users, Send, PlusCircle, X, Search, Loader2, MessageSquare } from "lucide-react";

// --- TYPES ---
interface Group {
  id: number;
  name: string;
  description: string;
  members_count: number;
}

interface Message {
  id: number;
  group: number;
  user: string;
  content: string;
  timestamp: string;
}

const GroupsPage: React.FC = () => {
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Create Group Modal State
  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH GROUPS & AUTO REFRESH (Every 5 Seconds) ---
  useEffect(() => {
    fetchGroups(); // Initial load

    const interval = setInterval(() => {
      fetchGroups(); // Background refresh for new groups
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups/");
      // Note: In a real app, compare data before setting state to avoid re-renders
      setGroups(res.data);
    } catch (err) {
      console.error("Error loading groups", err);
    }
  };

  // --- 2. FETCH MESSAGES & AUTO REFRESH (Every 2 Seconds) ---
  useEffect(() => {
    let interval: any;

    if (activeGroup) {
      setLoadingMessages(true);
      fetchMessages(activeGroup.id); // Immediate load

      // POLL: Check for new messages every 2 seconds
      interval = setInterval(() => {
        fetchMessages(activeGroup.id, true); // 'true' means silent update (no loader)
      }, 2000);
    }

    return () => clearInterval(interval); // Stop polling when group changes
  }, [activeGroup]); // Re-run when activeGroup changes

  const fetchMessages = async (groupId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/?group_id=${groupId}`);
      setMessages(res.data);
      // Only scroll to bottom on initial load or if user sends a message
      if (!silent) scrollToBottom();
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- 3. SEND MESSAGE ---
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeGroup) return;

    try {
      // Send to Backend
      await api.post("/messages/", {
        group: activeGroup.id,
        content: newMessage
      });
      
      setNewMessage(""); // Clear Input
      fetchMessages(activeGroup.id, true); // Refresh immediately
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send", err);
    }
  };

  // --- 4. CREATE GROUP ---
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await api.post("/groups/", {
        name: newGroupName,
        description: newGroupDesc
      });
      setGroups([res.data, ...groups]); // Update list immediately
      setShowModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      setActiveGroup(res.data); // Switch to new group
    } catch (err) {
      alert("Failed to create group");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', height: '85vh', display: 'flex', gap: '20px', position: 'relative' }}>
        
        {/* --- LEFT: SIDEBAR --- */}
        <div className="groups-sidebar" style={{ width: '320px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <div style={{marginBottom: '15px'}}>
            <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#1f2937' }}>
              <Users color="#4f46e5" /> Communities
            </h3>
            <div style={{background: '#f3f4f6', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Search size={16} color="#9ca3af"/>
                <input placeholder="Search groups..." style={{border:'none', background:'transparent', outline:'none', width:'100%', fontSize:'0.9rem'}}/>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {groups.map(g => (
              <div 
                key={g.id}
                onClick={() => setActiveGroup(g)}
                style={{ 
                  padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer',
                  background: activeGroup?.id === g.id ? '#e0e7ff' : 'white',
                  border: activeGroup?.id === g.id ? '1px solid #4f46e5' : '1px solid #f3f4f6',
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '0.95rem' }}>{g.name}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.description}
                </p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              width: '100%', padding: '12px', background: '#4f46e5', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', 
              justifyContent: 'center', gap: '8px', fontWeight: 600, marginTop: '10px'
            }}
          >
            <PlusCircle size={18} /> Create New Group
          </button>
        </div>

        {/* --- RIGHT: CHAT AREA --- */}
        <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {activeGroup ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>{activeGroup.name}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Community Discussion</p>
                </div>
                <Users size={20} color="#9ca3af"/>
              </div>

              {/* Messages Feed */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fdfbf7', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loadingMessages && messages.length === 0 ? (
                   <div style={{display:'flex', justifyContent:'center', marginTop: 50}}><Loader2 className="animate-spin" color="#4f46e5"/></div> 
                ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMine = msg.user === user?.username;
                      return (
                        <div key={msg.id} style={{ 
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                        }}>
                            <div style={{ 
                                background: isMine ? '#4f46e5' : 'white',
                                color: isMine ? 'white' : '#1f2937',
                                padding: '10px 15px', 
                                borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                border: isMine ? 'none' : '1px solid #e5e7eb'
                            }}>
                                {!isMine && <div style={{fontSize:'0.75rem', fontWeight: 700, color: '#4f46e5', marginBottom: 4}}>{msg.user}</div>}
                                <div style={{lineHeight: 1.5, wordBreak: 'break-word'}}>{msg.content}</div>
                            </div>
                            <div style={{fontSize:'0.7rem', color:'#9ca3af', marginTop: 4, textAlign: isMine ? 'right' : 'left'}}>
                                {msg.timestamp}
                            </div>
                        </div>
                      );
                    })
                ) : (
                    <div style={{textAlign:'center', marginTop: 50, color: '#9ca3af'}}>
                        <p>No messages yet. Say Hi! 👋</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{ background: newMessage.trim() ? '#4f46e5' : '#a5b4fc', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', cursor: newMessage.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <div style={{background: '#f3f4f6', padding: 30, borderRadius: '50%', marginBottom: 20}}>
                  <MessageSquare size={50} color="#4f46e5" />
              </div>
              <h3 style={{color: '#374151'}}>Select a group to start discussion</h3>
              <p>Join communities to accelerate your job search.</p>
            </div>
          )}
        </div>

        {/* --- CREATE GROUP MODAL --- */}
        {showModal && (
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, borderRadius: '12px'
            }}>
                <div style={{background: 'white', padding: '25px', borderRadius: '12px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                        <h3 style={{margin:0}}>Create New Group</h3>
                        <X size={20} style={{cursor:'pointer'}} onClick={() => setShowModal(false)}/>
                    </div>
                    
                    <div style={{display:'flex', flexDirection:'column', gap: 15}}>
                        <div>
                            <label style={{fontSize:'0.9rem', fontWeight:600, display:'block', marginBottom: 5}}>Group Name</label>
                            <input 
                                style={{width:'100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}}
                                placeholder="e.g. React Developers"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{fontSize:'0.9rem', fontWeight:600, display:'block', marginBottom: 5}}>Description</label>
                            <input 
                                style={{width:'100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db'}}
                                placeholder="Short description..."
                                value={newGroupDesc}
                                onChange={(e) => setNewGroupDesc(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCreateGroup}
                            style={{marginTop: 10, padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'}}
                        >
                            Create Group
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default GroupsPage;