import React, { useState } from 'react';
import { X, FileText, CreditCard, User, Building, Hash, Eye } from 'lucide-react';
import axios from 'axios';

// Helper function to open documents with authentication (same as KYC)
const openDoc = (url: string) => {
  if (url.startsWith('/api/')) {
    // Local API files (KYC style)
    const token = localStorage.getItem('token');
    const fullUrl = `http://localhost:5000${url}?token=${token}&view=true`;
    window.open(fullUrl, '_blank', 'noreferrer');
  } else if (url.startsWith('http')) {
    // Cloudinary URLs - try different approaches
    if (url.includes('cloudinary.com')) {
      // Try opening with Google Docs Viewer as fallback
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleViewerUrl, '_blank', 'noreferrer');
    } else {
      // Non-Cloudinary URLs
      window.open(url, '_blank', 'noreferrer');
    }
  } else {
    // Handle relative URLs
    const token = localStorage.getItem('token');
    const fullUrl = `http://localhost:5000${url}?token=${token}&view=true`;
    window.open(fullUrl, '_blank', 'noreferrer');
  }
};

interface Owner {
  id: number;
  title: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  businessName: string;
  businessAddress: string;
  ownerDocuments: string[];
  thalukaDocuments: string[];
  agreementDocument: string;
  commissionPercentage: number;
  ownerBankDetails: any;
  ownerAadhaar: string;
  ownerPan: string;
  seller: { name: string; email: string; phone: string };
}

interface OwnerEditModalProps {
  owner: Owner;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  viewOnly?: boolean; // Add viewOnly prop
}

const s = {
  overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 },
  modal: { background: '#fff7ed', borderRadius: 18, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto' as const, boxShadow: '0 24px 60px rgba(0,0,0,0.25)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #fed7aa', position: 'sticky' as const, top: 0, background: '#fff7ed', zIndex: 1, borderRadius: '18px 18px 0 0' },
  body: { padding: '20px 24px', display: 'flex', flexDirection: 'column' as const, gap: 16 },
  section: { background: '#fff', border: '1px solid #fed7aa', borderRadius: 12, padding: '16px 20px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#7c2d12', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: { fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4, display: 'block' as const },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#7c2d12', background: '#fffbf5', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '9px 12px', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#7c2d12', background: '#fffbf5', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const },
  docLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: 4, textDecoration: 'none' as const, fontWeight: 600 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '0 0 18px 18px', position: 'sticky' as const, bottom: 0 },
  btnCancel: { padding: '9px 20px', border: '1px solid #fed7aa', borderRadius: 8, background: '#fff', color: '#92400e', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnSave: { padding: '9px 24px', border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnSaveDisabled: { padding: '9px 24px', border: 'none', borderRadius: 8, background: '#c4b5fd', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'not-allowed' },
};

const OwnerEditModal: React.FC<OwnerEditModalProps> = ({ owner, isOpen, onClose, onUpdate, viewOnly = false }) => {
  const [formData, setFormData] = useState({
    contactPerson: owner.contactPerson || '',
    contactPhone: owner.contactPhone || '',
    contactEmail: owner.contactEmail || '',
    whatsappNumber: owner.whatsappNumber || '',
    businessName: owner.businessName || '',
    businessAddress: owner.businessAddress || '',
    commissionPercentage: owner.commissionPercentage || 10,
    ownerAadhaar: owner.ownerAadhaar || '',
    ownerPan: owner.ownerPan || '',
    ownerBankDetails: owner.ownerBankDetails || { accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '', branchName: '' },
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, ownerBankDetails: { ...prev.ownerBankDetails, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, key === 'ownerBankDetails' ? JSON.stringify(value) : value.toString());
      });
      await axios.put(`/api/admin/owners/${owner.id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onUpdate();
      onClose();
    } catch {
      alert('Failed to update owner details. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#7c2d12' }}>Owner Details</div>
            <div style={{ fontSize: 12, color: '#92400e', marginTop: 2 }}>{owner.title}</div>
          </div>
          <button onClick={onClose} style={{ background: '#fed7aa', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#7c2d12" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.body}>

            {/* Contact Info */}
            <div style={s.section}>
              <div style={s.sectionTitle}><User size={14} /> Contact Information</div>
              <div style={s.grid2}>
                <div><label style={s.label}>Owner Name</label><input style={s.input} name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Full name" /></div>
                <div><label style={s.label}>Phone</label><input style={s.input} name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="Phone number" /></div>
                <div><label style={s.label}>Email</label><input style={s.input} name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="Email address" /></div>
                <div><label style={s.label}>Commission %</label><input style={s.input} type="number" name="commissionPercentage" value={formData.commissionPercentage} onChange={handleChange} min="0" max="100" step="0.1" /></div>
              </div>
            </div>

            {/* Business Info - Hide in viewOnly mode */}
            {!viewOnly && (
              <div style={s.section}>
                <div style={s.sectionTitle}><Building size={14} /> Business Information</div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Business Name</label><input style={s.input} name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Business / company name" /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={s.label}>Business Address</label><textarea style={s.textarea} name="businessAddress" value={formData.businessAddress} onChange={handleChange} rows={2} placeholder="Full business address" /></div>
                </div>
              </div>
            )}

            {/* Identity - Hide in viewOnly mode */}
            {!viewOnly && (
              <div style={s.section}>
                <div style={s.sectionTitle}><Hash size={14} /> Identity Documents</div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Aadhaar Number</label><input style={s.input} name="ownerAadhaar" value={formData.ownerAadhaar} onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} /></div>
                  <div><label style={s.label}>PAN Number</label><input style={s.input} name="ownerPan" value={formData.ownerPan} onChange={handleChange} placeholder="PAN number" maxLength={10} /></div>
                </div>
              </div>
            )}

            {/* Bank Details - Hide in viewOnly mode */}
            {!viewOnly && (
              <div style={s.section}>
                <div style={s.sectionTitle}><CreditCard size={14} /> Bank Details</div>
                <div style={s.grid2}>
                  <div><label style={s.label}>Account Holder</label><input style={s.input} name="bank.accountHolderName" value={formData.ownerBankDetails.accountHolderName} onChange={handleChange} placeholder="Account holder name" /></div>
                  <div><label style={s.label}>Account Number</label><input style={s.input} name="bank.accountNumber" value={formData.ownerBankDetails.accountNumber} onChange={handleChange} placeholder="Account number" /></div>
                  <div><label style={s.label}>IFSC Code</label><input style={s.input} name="bank.ifscCode" value={formData.ownerBankDetails.ifscCode} onChange={handleChange} placeholder="IFSC code" /></div>
                  <div><label style={s.label}>Bank Name</label><input style={s.input} name="bank.bankName" value={formData.ownerBankDetails.bankName} onChange={handleChange} placeholder="Bank name" /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={s.label}>Branch Name</label><input style={s.input} name="bank.branchName" value={formData.ownerBankDetails.branchName} onChange={handleChange} placeholder="Branch name" /></div>
                </div>
              </div>
            )}

            {/* Documents — View Only */}
            <div style={s.section}>
              <div style={s.sectionTitle}><FileText size={14} /> Uploaded Documents</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={s.label}>Owner Documents</label>
                  {owner.ownerDocuments?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {owner.ownerDocuments.map((doc, i) => (
                        <button
                          key={i}
                          onClick={() => openDoc(doc)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: '#6366f1',
                            background: '#eef2ff',
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <Eye size={10} /> Owner Doc {i + 1}
                        </button>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>No documents uploaded</div>}
                </div>
                <div>
                  <label style={s.label}>Thaluka / Property Papers</label>
                  {owner.thalukaDocuments?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {owner.thalukaDocuments.map((doc, i) => (
                        <button
                          key={i}
                          onClick={() => openDoc(doc)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: '#6366f1',
                            background: '#eef2ff',
                            padding: '4px 10px',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <Eye size={10} /> Property Doc {i + 1}
                        </button>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>No documents uploaded</div>}
                </div>
                <div>
                  <label style={s.label}>Agreement Document</label>
                  {owner.agreementDocument ? (
                    <button
                      onClick={() => openDoc(owner.agreementDocument)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: '#6366f1',
                        background: '#eef2ff',
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <Eye size={10} /> View Agreement
                    </button>
                  ) : <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>No agreement uploaded</div>}
                </div>
                <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#92400e' }}>
                  💡 <strong>Note:</strong> Documents are uploaded during listing creation. To update documents, edit the listing directly.
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={s.footer}>
            <button type="button" onClick={onClose} style={s.btnCancel}>Cancel</button>
            <button type="submit" disabled={uploading} style={uploading ? s.btnSaveDisabled : s.btnSave}>
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerEditModal;
