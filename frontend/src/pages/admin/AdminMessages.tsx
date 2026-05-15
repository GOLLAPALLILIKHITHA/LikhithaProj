import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Trash2, Search, User, Package, Phone, Mail, ArrowLeft, Clock } from 'lucide-react';
import api from '../../api';

interface Message {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  receiver: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  Listing?: {
    id: number;
    title: string;
    category: string;
    price: number;
    city: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  city: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState({ receiverId: '', listingId: '', message: '' });
  const [newChatMessage, setNewChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadMessages();
    loadUsers();
    loadListings();
  }, [search]);

  useEffect(() => {
    if (selectedUser) {
      loadUserMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/admin/messages?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const loadListings = async () => {
    try {
      const { data } = await api.get('/admin/listings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(data.listings);
    } catch (err) {
      console.error('Failed to load listings');
    }
  };

  const loadUserMessages = async (userId: number) => {
    try {
      const { data } = await api.get(`/admin/messages/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserMessages(data);
    } catch (err) {
      console.error('Failed to load user messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.receiverId || !newMessage.message.trim()) return;
    
    try {
      await api.post('/admin/messages', newMessage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowSendModal(false);
      setNewMessage({ receiverId: '', listingId: '', message: '' });
      loadMessages();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  const sendChatMessage = async () => {
    if (!selectedUser || !newChatMessage.trim()) return;
    
    try {
      await api.post('/admin/messages', {
        receiverId: selectedUser.id,
        message: newChatMessage,
        listingId: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewChatMessage('');
      loadUserMessages(selectedUser.id);
    } catch (err) {
      console.error('Failed to send chat message');
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMessages();
      if (selectedUser) {
        loadUserMessages(selectedUser.id);
      }
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get unique users who have sent messages with conversation details
  const getUniqueUsers = () => {
    const userMap = new Map();
    messages.forEach(msg => {
      // Only process messages involving admin (sender or receiver)
      if (msg.sender.id === 1 || msg.receiver.id === 1) {
        const otherUserId = msg.sender.id === 1 ? msg.receiver.id : msg.sender.id;
        const otherUser = msg.sender.id === 1 ? msg.receiver : msg.sender;
        
        if (!userMap.has(otherUserId)) {
          userMap.set(otherUserId, {
            ...otherUser,
            lastMessage: msg,
            unreadCount: 0,
            lastMessageTime: msg.createdAt
          });
        } else {
          const existing = userMap.get(otherUserId);
          // Update if this message is newer
          if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
            existing.lastMessage = msg;
            existing.lastMessageTime = msg.createdAt;
          }
        }
        
        // Count unread messages (messages sent to admin that are unread)
        if (msg.receiver.id === 1 && !msg.isRead) {
          const user = userMap.get(otherUserId);
          user.unreadCount++;
        }
      }
    });
    
    // Convert to array and sort by last message time
    return Array.from(userMap.values()).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  };

  if (selectedUser) {
    return (
      <div style={{ padding: '32px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          marginBottom: 24,
          padding: '16px 20px',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #fed7aa'
        }}>
          <button
            onClick={() => setSelectedUser(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 8,
              color: '#7c2d12'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 700, 
            fontSize: 18
          }}>
            {selectedUser.name[0].toUpperCase()}
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 4 }}>
              {selectedUser.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} />
                <span>{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} />
                  <span>{selectedUser.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div style={{ 
          flex: 1, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #fed7aa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Messages List */}
          <div style={{ 
            flex: 1, 
            padding: '20px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {userMessages.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#64748b' 
              }}>
                <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              userMessages.map((msg, index) => {
                const isAdmin = msg.sender.id === 1;
                const showDate = index === 0 || 
                  formatDate(msg.createdAt) !== formatDate(userMessages[index - 1].createdAt);
                
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div style={{ 
                        textAlign: 'center', 
                        margin: '16px 0',
                        fontSize: 12,
                        color: '#64748b'
                      }}>
                        {formatDate(msg.createdAt)}
                      </div>
                    )}
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      marginBottom: 12,
                      alignItems: 'flex-end',
                      gap: 8
                    }}>
                      {/* User Avatar - Left side for user messages */}
                      {!isAdmin && (
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: 700, 
                          fontSize: 12,
                          flexShrink: 0
                        }}>
                          {selectedUser.name[0].toUpperCase()}
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div style={{ 
                        maxWidth: '70%',
                        background: isAdmin 
                          ? 'linear-gradient(135deg,#dc2626,#b91c1c)' // Admin: Red gradient
                          : 'linear-gradient(135deg,#e2e8f0,#f1f5f9)', // User: Light gray
                        color: isAdmin ? '#fff' : '#374151',
                        padding: '12px 16px',
                        borderRadius: isAdmin 
                          ? '18px 18px 6px 18px' // Admin: Rounded left, pointed right
                          : '18px 18px 18px 6px', // User: Rounded right, pointed left
                        fontSize: 14,
                        lineHeight: 1.5,
                        boxShadow: isAdmin 
                          ? '0 2px 8px rgba(220, 38, 38, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                      }}>
                        {/* Sender Name for Admin Messages */}
                        {isAdmin && (
                          <div style={{ 
                            fontSize: 11, 
                            opacity: 0.9, 
                            marginBottom: 4,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            👨‍💼 Admin Support
                          </div>
                        )}
                        
                        <div>{msg.message}</div>
                        
                        <div style={{ 
                          fontSize: 11, 
                          opacity: isAdmin ? 0.8 : 0.6, 
                          marginTop: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          justifyContent: 'flex-end'
                        }}>
                          <Clock size={10} />
                          {formatTime(msg.createdAt)}
                          {isAdmin && (
                            <span style={{ fontSize: 10 }}>✓</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Admin Avatar - Right side for admin messages */}
                      {isAdmin && (
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg,#dc2626,#b91c1c)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: 700, 
                          fontSize: 12,
                          flexShrink: 0
                        }}>
                          👨‍💼
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ 
            padding: '20px', 
            borderTop: '1px solid #fed7aa',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            background: '#fff7ed'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Type your message as admin..."
                rows={2}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '2px solid #fed7aa',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 14,
                  resize: 'none',
                  outline: 'none',
                  color: '#7c2d12',
                  fontFamily: 'inherit'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <div style={{ 
                fontSize: 11, 
                color: '#92400e', 
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                👨‍💼 Replying as Admin Support • Press Enter to send
              </div>
            </div>
            <button
              onClick={sendChatMessage}
              disabled={!newChatMessage.trim()}
              style={{
                background: newChatMessage.trim() 
                  ? 'linear-gradient(135deg,#dc2626,#b91c1c)' 
                  : '#d1d5db',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 18px',
                cursor: newChatMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: newChatMessage.trim() 
                  ? '0 2px 8px rgba(220, 38, 38, 0.3)' 
                  : 'none'
              }}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>
            Messages Management
          </h1>
          <p style={{ fontSize: 14, color: '#92400e' }}>
            Monitor and manage all user communications • {messages.length} total messages
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          style={{
            background: 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Send size={16} /> Send Message
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            style={{
              width: '100%',
              background: '#fff',
              border: '1px solid #fed7aa',
              borderRadius: 10,
              padding: '12px 14px 12px 42px',
              fontSize: 14,
              outline: 'none',
              color: '#7c2d12'
            }}
          />
        </div>
      </div>

      {/* Users with Messages */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#7c2d12', marginBottom: 12 }}>
          Active Conversations ({getUniqueUsers().length})
        </h3>
        {getUniqueUsers().length === 0 ? (
          <div style={{ 
            background: '#fff', 
            border: '1px solid #fed7aa', 
            borderRadius: 12, 
            padding: '40px 20px', 
            textAlign: 'center' 
          }}>
            <MessageSquare size={40} style={{ color: '#92400e', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#92400e', fontSize: 14 }}>No conversations yet</p>
            <p style={{ color: '#a16207', fontSize: 12, marginTop: 4 }}>
              Users will appear here when they message admin
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {getUniqueUsers().map(user => {
              const lastMessageTime = new Date(user.lastMessageTime);
              const isToday = lastMessageTime.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    background: '#fff',
                    border: '1px solid #fed7aa',
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff', 
                      fontWeight: 700, 
                      fontSize: 16,
                      flexShrink: 0
                    }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <h4 style={{ 
                          fontSize: 15, 
                          fontWeight: 600, 
                          color: '#7c2d12', 
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {user.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {user.unreadCount > 0 && (
                            <span style={{
                              background: '#dc2626',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 8,
                              minWidth: 16,
                              textAlign: 'center'
                            }}>
                              {user.unreadCount}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {isToday 
                              ? lastMessageTime.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : lastMessageTime.toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })
                            }
                          </span>
                        </div>
                      </div>
                      
                      <p style={{ 
                        fontSize: 12, 
                        color: '#64748b', 
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        📧 {user.email}
                      </p>
                      
                      <p style={{ 
                        fontSize: 13, 
                        color: '#374151', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 500
                      }}>
                        {user.lastMessage.sender.id === 1 ? '👨‍💼 You: ' : '💬 '}
                        {user.lastMessage.message}
                      </p>
                      
                      {user.lastMessage.Listing && (
                        <p style={{ 
                          fontSize: 11, 
                          color: '#059669',
                          margin: '4px 0 0 0',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          🏠 {user.lastMessage.Listing.title}
                        </p>
                      )}
                    </div>
                    
                    <MessageSquare size={16} color="#10b981" style={{ flexShrink: 0, marginTop: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Messages List - Compact View */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fed7aa' }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #fed7aa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#7c2d12', margin: 0 }}>
            Recent Messages
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {messages.length} total messages
          </span>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#92400e' }}>
            <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>No messages found</p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {messages.slice(0, 10).map((message, i) => (
              <div 
                key={message.id} 
                onClick={() => {
                  const otherUser = message.sender.id === 1 ? message.receiver : message.sender;
                  setSelectedUser(otherUser);
                }}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: i < Math.min(messages.length, 10) - 1 ? '1px solid #fed7aa' : 'none',
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  background: message.sender.id === 1 
                    ? 'linear-gradient(135deg,#dc2626,#b91c1c)' 
                    : 'linear-gradient(135deg,#6366f1,#8b5cf6)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontWeight: 700, 
                  fontSize: 12,
                  flexShrink: 0
                }}>
                  {message.sender.id === 1 ? '👨‍💼' : message.sender.name[0].toUpperCase()}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#7c2d12', fontWeight: 600 }}>
                      {message.sender.id === 1 ? 'Admin' : message.sender.name} 
                      → {message.receiver.id === 1 ? 'Admin' : message.receiver.name}
                    </span>
                    {message.Listing && (
                      <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>
                        🏠 {message.Listing.title}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#92400e', marginLeft: 'auto' }}>
                      {formatDate(message.createdAt)} {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: '#374151', 
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {message.message}
                  </div>
                </div>
              </div>
            ))}
            
            {messages.length > 10 && (
              <div style={{ 
                padding: '12px 20px', 
                textAlign: 'center', 
                borderTop: '1px solid #fed7aa',
                background: '#fff7ed'
              }}>
                <span style={{ fontSize: 12, color: '#92400e' }}>
                  Showing 10 of {messages.length} messages. Click conversations above to see full chats.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showSendModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 14,
            padding: '24px',
            width: '100%',
            maxWidth: 500,
            border: '1px solid #fed7aa'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#7c2d12', marginBottom: 20 }}>Send Message</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Recipient</label>
              <select
                value={newMessage.receiverId}
                onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
              >
                <option value="">Select user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Related Listing (Optional)</label>
              <select
                value={newMessage.listingId}
                onChange={(e) => setNewMessage({ ...newMessage, listingId: e.target.value })}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
              >
                <option value="">No listing</option>
                {listings.map(listing => (
                  <option key={listing.id} value={listing.id}>{listing.title}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Message</label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                placeholder="Type your message..."
                rows={4}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSendModal(false)}
                style={{
                  background: '#374151',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#d1d5db',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={!newMessage.receiverId || !newMessage.message}
                style={{
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: (!newMessage.receiverId || !newMessage.message) ? 0.5 : 1
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}