import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, Lock, Edit2, Save, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase';
import { api } from '../services/api';
import '../styles/profile.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'bro@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '',
    memberSince: 'January 2024'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email
        }));
        setEditData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email
        }));
      } catch (_err) {
        // use defaults
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      const response = await api.auth.updateProfile({ name: editData.name, email: editData.email, phone: editData.phone, avatar: editData.avatar });
      if (response.success) {
        setProfile({ ...profile, ...response.user, phone: response.user.phone || editData.phone });
        setEditData({ ...editData, ...response.user });
        localStorage.setItem('user', JSON.stringify({ ...response.user }));
      }
    } catch (_err) {
      console.error('Failed to update profile');
    } finally {
      setIsEditing(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const uid = auth.currentUser?.uid || JSON.parse(localStorage.getItem('user') || '{}').uid;
      const storageRef = ref(storage, `avatars/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfile((prev) => ({ ...prev, avatar: url }));
      setEditData((prev) => ({ ...prev, avatar: url }));
      localStorage.setItem('user', JSON.stringify({ ...profile, avatar: url }));
      await api.auth.updateProfile({ avatar: url });
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        {!isEditing ? (
          <button className="btn-outline" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-secondary" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="profile-layout">
        <div className="profile-card avatar-card">
          <div className="avatar-large">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="avatar-image" />
            ) : (
              <span>{profile.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}</span>
            )}
            <label className="avatar-upload">
              <Camera size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          {avatarUploading && <p className="upload-status">Uploading avatar...</p>}
          <h2>{profile.name}</h2>
          <p className="email-text">{profile.email}</p>
          <p className="member-since">Member since {profile.memberSince}</p>
        </div>

        <div className="profile-details">
          <div className="detail-card">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                ) : (
                  <div className="static-value">{profile.name}</div>
                )}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={editData.email}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                  />
                ) : (
                  <div className="static-value">
                    <Mail size={16} className="field-icon" />
                    {profile.email}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  />
                ) : (
                  <div className="static-value">
                    <Phone size={16} className="field-icon" />
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Security</h3>
            <div className="security-options">
              <div className="security-item">
                <div className="item-info">
                  <Lock size={20} />
                  <div>
                    <h4>Password</h4>
                    <p>Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="btn-text">Change</button>
              </div>
              <div className="security-item">
                <div className="item-info">
                  <div className="item-icon">
                    <span className="icon-placeholder">2FA</span>
                  </div>
                  <div>
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security</p>
                  </div>
                </div>
                <button className="btn-text">Enable</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
