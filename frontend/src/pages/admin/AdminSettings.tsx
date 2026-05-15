import { useEffect, useState } from 'react';
import { Settings, Save, Plus, Trash2, Globe, Shield, Database } from 'lucide-react';
import api from '../../api';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCity, setNewCity] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setSettings({
      ...settings,
      categories: [...settings.categories, newCategory.trim()]
    });
    setNewCategory('');
  };

  const removeCategory = (index: number) => {
    setSettings({
      ...settings,
      categories: settings.categories.filter((_: any, i: number) => i !== index)
    });
  };

  const addCity = () => {
    if (!newCity.trim()) return;
    setSettings({
      ...settings,
      cities: [...settings.cities, newCity.trim()]
    });
    setNewCity('');
  };

  const removeCity = (index: number) => {
    setSettings({
      ...settings,
      cities: settings.cities.filter((_: any, i: number) => i !== index)
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#92400e' }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#7c2d12', marginBottom: 4 }}>System Settings</h1>
          <p style={{ fontSize: 14, color: '#92400e' }}>Configure platform settings and preferences</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            background: saving ? '#4338ca' : 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* General Settings */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Globe size={20} color="#6366f1" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>General Settings</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Site Name</label>
              <input
                value={settings?.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
              />
            </div>
            
            <div>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Featured Listing Price ($)</label>
              <input
                type="number"
                value={settings?.featuredListingPrice || 0}
                onChange={(e) => setSettings({ ...settings, featuredListingPrice: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={20} color="#f59e0b" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>User Management</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, color: '#92400e', marginBottom: 6, display: 'block' }}>Max Listings Per User</label>
              <input
                type="number"
                value={settings?.maxListingsPerUser || 0}
                onChange={(e) => setSettings({ ...settings, maxListingsPerUser: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings?.allowRegistration || false}
                  onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14, color: '#7c2d12' }}>Allow New Registrations</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings?.requireEmailVerification || false}
                  onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 14, color: '#7c2d12' }}>Require Email Verification</span>
              </label>
            </div>
          </div>
        </div>

        {/* Categories Management */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Database size={20} color="#ec4899" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>Categories</h3>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category..."
                style={{
                  flex: 1,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              />
              <button
                onClick={addCategory}
                style={{
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {settings?.categories?.map((category: string, i: number) => (
              <div key={i} style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 20,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 13, color: '#7c2d12' }}>{category}</span>
                <button
                  onClick={() => removeCategory(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cities Management */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #fed7aa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Database size={20} color="#10b981" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#7c2d12' }}>Cities</h3>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Add new city..."
                style={{
                  flex: 1,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: 8,
                  padding: '10px',
                  color: '#7c2d12',
                  fontSize: 14
                }}
                onKeyPress={(e) => e.key === 'Enter' && addCity()}
              />
              <button
                onClick={addCity}
                style={{
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {settings?.cities?.map((city: string, i: number) => (
              <div key={i} style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 20,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 13, color: '#7c2d12' }}>{city}</span>
                <button
                  onClick={() => removeCity(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


