"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Profile state
  const [profile, setProfile] = useState({ name: '', bio: '', photo_url: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [projectForm, setProjectForm] = useState({ title: '', description: '', imageUrl: '', githubLink: '', liveLink: '', technologies: '' });
  const [techForm, setTechForm] = useState({ name: '', category: '', iconUrl: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profRes, projRes, techRes, msgRes] = await Promise.all([
        supabase.from('profile').select('*').limit(1).single(),
        supabase.from('projects').select('*'),
        supabase.from('tech').select('*'),
        supabase.from('messages').select('*').order('created_at', { ascending: false })
      ]);
      
      if (profRes.data) setProfile(profRes.data);
      setProjects(projRes.data || []);
      setTechStack(techRes.data || []);
      setMessages(msgRes.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  // --- Profile Handlers ---
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      // Check if profile exists
      const { data: existing } = await supabase.from('profile').select('id').limit(1).single();
      
      if (existing) {
        await supabase.from('profile').update(profile).eq('id', existing.id);
      } else {
        await supabase.from('profile').insert([profile]);
      }
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    }
  };

  const uploadPhoto = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];

      // Replace these with your Cloudinary details
      // I saw your screenshot! Your Cloud Name is 'asnbvdkz'
      const cloudName = 'asnbvdkz'; 
      const uploadPreset = 'next-gen-software-engineer'; // Must be an unsigned preset

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        setProfile({ ...profile, photo_url: data.secure_url });
        alert("Photo uploaded via Cloudinary! Remember to click Save Profile.");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      alert("Error uploading to Cloudinary!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadImage = async (event, formSetter, formState, fieldName) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];

      const cloudName = 'asnbvdkz'; 
      const uploadPreset = 'next-gen-software-engineer';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        formSetter({ ...formState, [fieldName]: data.secure_url });
        alert("Image uploaded successfully!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      alert("Error uploading to Cloudinary!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // --- Project Handlers ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...projectForm, technologies: projectForm.technologies.split(',').map(t => t.trim()) };
      const { error } = await supabase.from('projects').insert([payload]);
      if (error) throw error;
      setProjectForm({ title: '', description: '', imageUrl: '', githubLink: '', liveLink: '', technologies: '' });
      fetchData();
      alert("Project added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add project.");
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure?")) {
      await supabase.from('projects').delete().eq('id', id);
      fetchData();
    }
  };

  // --- Tech Handlers ---
  const handleAddTech = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tech').insert([techForm]);
      if (error) throw error;
      setTechForm({ name: '', category: '', iconUrl: '' });
      fetchData();
      alert("Tech added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add tech.");
    }
  };

  const handleDeleteTech = async (id) => {
    if (window.confirm("Are you sure?")) {
      await supabase.from('tech').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Dashboard</h2>
        <ul className="nav-links">
          <li>
            <span className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              Manage Profile
            </span>
          </li>
          <li>
            <span className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
              Manage Projects
            </span>
          </li>
          <li>
            <span className={`nav-link ${activeTab === 'tech' ? 'active' : ''}`} onClick={() => setActiveTab('tech')}>
              Manage Tech Stack
            </span>
          </li>
          <li>
            <span className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              Inbox / Leads
            </span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'profile' && (
          <div>
            <div className="page-header">
              <h1>Manage Profile</h1>
            </div>
            <div className="card">
              <h3>Profile Information</h3>
              <form onSubmit={handleProfileSave} style={{ marginTop: '20px' }}>
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '20px' }}>
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 10 }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#ccc', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                  )}
                  <div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={uploadPhoto} disabled={uploading} style={{ display: 'none' }} />
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea className="form-control" value={profile.bio || ''} onChange={e => setProfile({...profile, bio: e.target.value})} rows="4"></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
             <div className="page-header"><h1>Manage Projects</h1></div>
             {/* Same project logic... */}
             <div className="card">
              <h3>Add New Project</h3>
              <form onSubmit={handleAddProject} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-control" required value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" required value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>Image Upload</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => handleUploadImage(e, setProjectForm, projectForm, 'imageUrl')} disabled={uploading} />
                  {projectForm.imageUrl && <p style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>Image uploaded successfully! URL saved.</p>}
                </div>
                <div className="form-group">
                  <label>GitHub Link</label>
                  <input type="text" className="form-control" value={projectForm.githubLink} onChange={e => setProjectForm({...projectForm, githubLink: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Live Link</label>
                  <input type="text" className="form-control" value={projectForm.liveLink} onChange={e => setProjectForm({...projectForm, liveLink: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Technologies (Comma separated)</label>
                  <input type="text" className="form-control" placeholder="React, Next.js, etc." value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </form>
            </div>
            <h3>Existing Projects</h3>
            <div className="list-grid">
              {projects.map(p => (
                <div key={p.id} className="list-item">
                  <h4>{p.title}</h4>
                  <div className="list-actions">
                    <button className="btn btn-danger" onClick={() => handleDeleteProject(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div>
            <div className="page-header"><h1>Manage Tech Stack</h1></div>
            {/* Same tech logic... */}
            <div className="card">
              <h3>Add New Technology</h3>
              <form onSubmit={handleAddTech} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" required value={techForm.name} onChange={e => setTechForm({...techForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" className="form-control" value={techForm.category} onChange={e => setTechForm({...techForm, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Icon Upload (Optional)</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => handleUploadImage(e, setTechForm, techForm, 'iconUrl')} disabled={uploading} />
                  {techForm.iconUrl && <p style={{fontSize: '12px', color: 'green', marginTop: '5px'}}>Icon uploaded successfully! URL saved.</p>}
                </div>
                <button type="submit" className="btn btn-primary">Save Technology</button>
              </form>
            </div>
            <h3>Existing Technologies</h3>
            <div className="list-grid">
              {techStack.map(t => (
                <div key={t.id || t._id} className="list-item">
                  <h4>{t.name}</h4>
                  <p>{t.category}</p>
                  <div className="list-actions">
                    <button className="btn btn-danger" onClick={() => handleDeleteTech(t.id || t._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <div className="page-header"><h1>Inbox / Leads</h1></div>
            <div className="list-grid" style={{ gridTemplateColumns: '1fr' }}>
              {messages.map(m => (
                <div key={m.id} className="card" style={{ marginBottom: '20px' }}>
                  <h4>{m.name} ({m.email})</h4>
                  <small style={{ color: '#888' }}>{new Date(m.created_at).toLocaleString()}</small>
                  <p style={{ marginTop: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>{m.message}</p>
                </div>
              ))}
              {messages.length === 0 && <p>No messages yet.</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
