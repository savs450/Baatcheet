import React, { useState, useEffect, useRef } from 'react';
import './sideDrawer.css';
import { ChatState } from "../../Context/ChatProvider";

// ChatLoading component
const ChatLoading = () => (
  <div className="chat-loading">
    {[1, 2, 3].map(i => (
      <div key={i} className="loading-placeholder">
        <div className="loading-avatar"></div>
        <div className="loading-text">
          <div className="loading-line"></div>
          <div className="loading-line short"></div>
        </div>
      </div>
    ))}
  </div>
);

// UserListItem component
const UserListItem = ({ user, handleFunction }) => {
  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase();

  return (
    <div className="user-item" onClick={handleFunction}>
      <div className="user-avatar">
        {user.pic ?
        <img
        src={user.pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4299e1&color=fff&bold=true`}
        alt={user.name} /> : getInitials(user.name)}
      </div>
      <div className="user-info">
        <h4>{user.name}</h4>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

// Toast component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`toast ${type}`}>{message}</div>;
};

const SideDrawer = ({
  onOpenProfile = () => console.log('Profile opened')
}) => {
  const { user, setSelectedChat, setChats, notification, setNotification, } = ChatState();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setSelectedChat(null);
    setChats([]);
    setNotification([]);
    window.location.href = "/";
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target))
        setIsNotificationOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setSearch('');
    setSearchResult([]);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSearch('');
    setSearchResult([]);
    setLoading(false);
    setLoadingChat(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      showToast('Please enter something in search', 'warning');
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await fetch(`/api/user?search=${search}`, { headers: config.headers });
      if (!response.ok) throw new Error('Failed to fetch search results');
      const data = await response.json();
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast('Failed to Load the Search Results', 'error');
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({ userId })
      });
      if (!response.ok) throw new Error('Failed to access chat');
      const data = await response.json();
      setSelectedChat(data);

      setChats((prevChats) => {
        if (!prevChats.find(c => c._id === data._id)) {
          return [data, ...prevChats]
        }
        return prevChats
      })

      setLoadingChat(false);
      closeDrawer();
    } catch (error) {
      setLoadingChat(false);
      showToast('Error fetching the chat', 'error');
    }
  };

  const handleNotificationClick = (notif) => {
    setSelectedChat(notif.chat);
    setNotification(notification.filter(n => n !== notif));
    setIsNotificationOpen(false);
  };

  const getInitials = (name) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/); // removes extra spaces
  const initials = words.map(w => w[0]).join('');
  return initials.toUpperCase();
};
  const getSender = (loggedUser, users) => users[0]?._id === loggedUser._id ? users[1]?.name : users[0]?.name;

  return (
    <>
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />)}
      </div>

      {/* Header */}
      <div className="side-drawer-header">
        <button className="search-btn tooltip" data-tooltip="Search Users" onClick={openDrawer}>
          <i className="fas fa-search"></i> <span className="search-text">Search User</span>
        </button>
        <div className="logo">Talk-A-Tive</div>

        <div className="right-menu">
          {/* Notifications */}
          <div className="menu-container" ref={notificationRef}>
            <button className="notification-btn" onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileOpen(false); }}>
              {notification.length > 0 && <div className="notification-badge">{notification.length}</div>}
              <i className="fas fa-bell"></i>
            </button>
            <div className={`dropdown ${isNotificationOpen ? 'active' : ''}`}>
              {!notification.length ? <div className="no-notifications">No New Messages</div>
                : notification.map(n => (
                  <button key={n._id} className="dropdown-item" onClick={() => handleNotificationClick(n)}>
                    {n.chat.isGroupChat ? `New Message in ${n.chat.chatName}` : `New Message from ${getSender(user, n.chat.users)}`}
                  </button>
                ))}
            </div>
          </div>

          {/* Profile Menu */}
          <div className="menu-container" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationOpen(false);
              }}
            >
              <div className="avatar">
                {user.pic ? (
                  <img src={user.pic} alt={user.name} />
                ) : (
                  <span className="initials">{getInitials(user.name)}</span>
                )}
              </div>
              <i className="fas fa-chevron-down chevron-down"></i>
            </button>
            <div className={`dropdown ${isProfileOpen ? "active" : ""}`}>
              <button
                className="dropdown-item"
                onClick={() => {
                  onOpenProfile();
                  setIsProfileOpen(false);
                }}
              >
                My Profile
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => handleLogout()}>
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`} onClick={closeDrawer}></div>

      {/* Drawer */}
      <div className={`drawer ${isDrawerOpen ? 'active' : ''}`}>
        <div className="drawer-header">Search Users</div>
        <div className="drawer-body">
          <form className="search-form" onSubmit={handleSearch}>
            <input type="text" className="search-input" placeholder="Search by name or email" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" className="search-go-btn" disabled={loading}>{loading ? 'Searching...' : 'Go'}</button>
          </form>

          {loading ? <ChatLoading /> : searchResult?.map(u =>
            <UserListItem
              key={u._id}
              user={u}
              handleFunction={() => accessChat(u._id)} />)}
          {loadingChat && <div className="spinner"></div>}
        </div>
      </div>
    </>
  );
};

export default SideDrawer;
