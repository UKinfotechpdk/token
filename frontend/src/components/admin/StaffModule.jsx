import React, { useState, useEffect } from 'react';
import * as api from '../../api/api';
import StaffList from './StaffList';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function StaffModule({ onToast, onNavigate }) {
    const [view, setView] = useState('list');
    const [editingStaff, setEditingStaff] = useState(null);
    const [branches, setBranches] = useState([]);
    const [allStaff, setAllStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ staff_name: '', contact: '', email: '', password: '', branch_id: '' });
    const [errors, setErrors] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.getBranches();
                setBranches(res.data);
            } catch (err) {
                console.error('Failed to load branches');
            }
        };
        fetchBranches();
    }, []);

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setForm({ ...form, password: pass });
    };

    const handleAddNew = async () => {
        try {
            const res = await api.getStaff();
            setAllStaff(res.data || []);
        } catch { }
        setEditingStaff(null);
        setForm({ staff_name: '', contact: '', email: '', password: '', branch_id: '' });
        setErrors({});
        setView('form');
    };

    const handleEdit = async (staff) => {
        try {
            const res = await api.getStaff();
            setAllStaff(res.data || []);
        } catch { }
        setEditingStaff(staff);
        setForm({
            staff_name: staff.staff_name,
            contact: (staff.contact || '').replace(/^\+91/, ''),
            email: staff.email || '',
            branch_id: staff.branch_id || '',
            password: ''
        });
        setErrors({});
        setView('form');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.staff_name || form.staff_name.length < 3) newErrors.staff_name = "Name must be at least 3 characters.";
        if (!form.contact || !/^[6-9][0-9]{9}$/.test(form.contact)) newErrors.contact = "Enter a valid 10-digit Indian mobile number.";
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address.";
        if (!form.branch_id || form.branch_id === '') newErrors.branch_id = "Please select a primary branch.";
        if (!editingStaff && (!form.password || form.password.length < 6)) newErrors.password = "Password must be at least 6 characters.";

        // Duplicate contact check
        const dupContact = allStaff.find(s =>
            s.contact && (s.contact.replace(/^\+91/, '') === form.contact) &&
            (!editingStaff || s.staff_id !== editingStaff.staff_id)
        );
        if (dupContact) newErrors.contact = `Mobile number already registered for "${dupContact.staff_name}".`;

        // Duplicate email check
        const dupEmail = allStaff.find(s =>
            s.email && s.email.toLowerCase() === form.email.toLowerCase() &&
            (!editingStaff || s.staff_id !== editingStaff.staff_id)
        );
        if (dupEmail) newErrors.email = `Email already in use by "${dupEmail.staff_name}".`;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = { ...form, contact: `+91${form.contact}` };
            if (payload.branch_id === 'none' || payload.branch_id === '') payload.branch_id = null;

            if (editingStaff) {
                await api.updateStaff(editingStaff.staff_id, payload);
            } else {
                await api.createStaff(payload);
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setView('list');
                setRefreshKey(prev => prev + 1);
            }, 2000);
        } catch (err) {
            onToast(err.response?.data?.error || 'Failed to save staff', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="module-view">
            <div className="module-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('dashboard')}>
                        <span>🏠</span> Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Manage Staff</h2>
                </div>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleAddNew}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Add Staff Member
                </button>
            </div>

            <StaffList
                key={refreshKey}
                onToast={onToast}
                onEdit={handleEdit}
                onAddNew={handleAddNew}
                onDelete={id => setConfirmDelete({ isOpen: true, id })}
                onBackToHome={() => onNavigate('dashboard')}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={async () => {
                    try {
                        await api.deleteStaff(confirmDelete.id);
                        onToast('Staff deleted', 'success');
                        setRefreshKey(prev => prev + 1);
                    } catch (err) {
                        onToast('Delete failed', 'error');
                    }
                }}
                title="Delete Staff Member"
                message="Are you sure you want to remove this staff member? This action cannot be undone."
                confirmText="Delete Staff"
            />

            <Modal
                isOpen={view === 'form'}
                onClose={() => setView('list')}
                title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                icon="👥"
            >
                <div style={{ position: 'relative' }}>
                    {showSuccess && (
                        <div className="form-success-overlay">
                            <div className="success-checkmark">✓</div>
                            <h3 style={{ color: 'var(--success)', margin: 0 }}>Success!</h3>
                            <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Staff record has been synchronized.</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="module-form" noValidate>
                        <div className="form-grid">
                            <div className={`premium-field ${errors.staff_name ? 'has-error' : ''}`} style={{ '--stagger': 1 }}>
                                <label htmlFor="staff-name">Full Name</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">👤</div>
                                    <input
                                        id="staff-name"
                                        type="text"
                                        placeholder="Enter full name"
                                        required
                                        value={form.staff_name}
                                        onChange={e => { setForm({ ...form, staff_name: e.target.value }); setErrors({ ...errors, staff_name: null }); }}
                                        aria-invalid={!!errors.staff_name}
                                        aria-describedby={errors.staff_name ? "staff-name-error" : undefined}
                                    />
                                </div>
                                {errors.staff_name && <span id="staff-name-error" className="error-message">{errors.staff_name}</span>}
                            </div>

                            <div className={`premium-field ${errors.email ? 'has-error' : ''}`} style={{ '--stagger': 2 }}>
                                <label htmlFor="staff-email">Office Email</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">📧</div>
                                    <input
                                        id="staff-email"
                                        type="email"
                                        placeholder="email@example.com"
                                        required
                                        value={form.email}
                                        onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                                        aria-invalid={!!errors.email}
                                        aria-describedby={errors.email ? "staff-email-error" : undefined}
                                    />
                                </div>
                                {errors.email && <span id="staff-email-error" className="error-message">{errors.email}</span>}
                            </div>

                            <div className={`premium-field ${errors.contact ? 'has-error' : ''}`} style={{ '--stagger': 3 }}>
                                <label htmlFor="staff-contact">Contact Number</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">📞</div>
                                    <input
                                        id="staff-contact"
                                        type="tel"
                                        placeholder="10-digit number"
                                        required
                                        value={form.contact}
                                        onChange={e => { setForm({ ...form, contact: e.target.value.replace(/\D/g, '').slice(0, 10) }); setErrors({ ...errors, contact: null }); }}
                                        aria-invalid={!!errors.contact}
                                        aria-describedby={errors.contact ? "staff-contact-error" : undefined}
                                    />
                                </div>
                                {errors.contact && <span id="staff-contact-error" className="error-message">{errors.contact}</span>}
                            </div>

                            <div className={`premium-field ${errors.branch_id ? 'has-error' : ''}`} style={{ '--stagger': 4 }}>
                                <label htmlFor="staff-branch">Primary Branch</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">🏢</div>
                                    <select
                                        id="staff-branch"
                                        value={form.branch_id}
                                        onChange={e => { setForm({ ...form, branch_id: e.target.value }); setErrors({ ...errors, branch_id: null }); }}
                                        aria-invalid={!!errors.branch_id}
                                        aria-describedby={errors.branch_id ? "staff-branch-error" : undefined}
                                        required
                                    >
                                        <option value="" disabled>Select a Branch</option>
                                        {branches.map(b => (
                                            <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.branch_id && <span id="staff-branch-error" className="error-message">{errors.branch_id}</span>}
                            </div>

                            {!editingStaff && (
                                <div className={`premium-field ${errors.password ? 'has-error' : ''}`} style={{ '--stagger': 5 }}>
                                    <label htmlFor="staff-password">Access Password</label>
                                    <div className="premium-input-wrapper">
                                        <div className="prefix-icon-box">🔑</div>
                                        <input
                                            id="staff-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 6 characters"
                                            value={form.password}
                                            onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: null }); }}
                                            required
                                        />
                                        <div className="input-actions" style={{ position: 'relative', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                            <button type="button" className="action-tiny" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                            <button type="button" className="action-tiny" onClick={generatePassword}>
                                                🎲
                                            </button>
                                        </div>
                                    </div>
                                    {errors.password && <span className="error-text">{errors.password}</span>}
                                </div>
                            )}

                            {form.branch_id && !errors.branch_id && (
                                <div className="premium-field full-width" style={{ '--stagger': 6 }}>
                                    <div className="input-feedback" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ fontSize: '18px' }}>📍</span>
                                        <span><strong>Branch Location:</strong> {branches.find(b => String(b.branch_id) === String(form.branch_id))?.location || 'Directing to main site'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="module-form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setView('list')} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                                <span className="btn-icon">💾</span>
                                {loading ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Save Staff')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div >
    );
}
