import React, { useState, useEffect } from 'react';
import * as api from '../../api/api';
import ConsultantList from './ConsultantList';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function ConsultantModule({ onToast, onNavigate }) {
    const [view, setView] = useState('list');
    const [editingSpecialist, setEditingSpecialist] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [branches, setBranches] = useState([]);
    const [allConsultants, setAllConsultants] = useState([]);

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

    const [form, setForm] = useState({
        name: '', specialization: '', contact: '', email: '', bio: '', password: '', branch_id: ''
    });

    const handleAddNew = async () => {
        try {
            const res = await api.getConsultants();
            setAllConsultants(res.data || []);
        } catch { }
        setEditingSpecialist(null);
        setForm({ name: '', specialization: 'Standard', contact: '', email: '', bio: '', password: '', branch_id: branches[0]?.branch_id || '' });
        setErrors({});
        setView('form');
    };

    const handleEdit = async (specialist) => {
        try {
            const res = await api.getConsultants();
            setAllConsultants(res.data || []);
        } catch { }
        setEditingSpecialist(specialist);
        setForm({
            name: specialist.name,
            specialization: specialist.specialization,
            contact: (specialist.contact || '').replace(/^\+91/, ''),
            email: specialist.email || '',
            bio: specialist.bio || '',
            branch_id: specialist.branch_id || '',
            password: ''
        });
        setErrors({});
        setView('form');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name || form.name.length < 3) newErrors.name = "Name must be at least 3 characters.";
        if (!form.contact || !/^[6-9][0-9]{9}$/.test(form.contact)) newErrors.contact = "Enter a valid 10-digit Indian mobile number.";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address.";
        if (!form.branch_id || form.branch_id === '') newErrors.branch_id = "Please select an assigned branch.";
        if (!editingSpecialist && (!form.password || form.password.length < 6)) newErrors.password = "Password must be at least 6 characters.";
        if (form.bio && form.bio.length > 500) newErrors.bio = "Bio must be less than 500 characters.";

        // Duplicate contact check
        const dupContact = allConsultants.find(c =>
            c.contact && (c.contact.replace(/^\+91/, '') === form.contact) &&
            (!editingSpecialist || c.consultant_id !== editingSpecialist.consultant_id)
        );
        if (dupContact) newErrors.contact = `Mobile number already registered for "${dupContact.name}".`;

        // Duplicate email check (only if email is provided)
        if (form.email) {
            const dupEmail = allConsultants.find(c =>
                c.email && c.email.toLowerCase() === form.email.toLowerCase() &&
                (!editingSpecialist || c.consultant_id !== editingSpecialist.consultant_id)
            );
            if (dupEmail) newErrors.email = `Email already in use by "${dupEmail.name}".`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editingSpecialist) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.updateConsultant(editingSpecialist.consultant_id, payload);
                onToast('Specialist updated', 'success');
            } else {
                await api.createConsultant(form);
                onToast('Provider created', 'success');
            }
            setView('list');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            onToast(err.response?.data?.error || 'Failed to save provider', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let pass = "";
        for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
        setForm({ ...form, password: pass });
        setShowPassword(true);
    };

    return (
        <div className="module-view">
            <div className="module-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('dashboard')}>
                        <span>🏠</span> Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Manage Providers</h2>
                </div>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleAddNew}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Add New Provider
                </button>
            </div>

            <ConsultantList
                key={refreshKey}
                onToast={onToast}
                onEdit={handleEdit}
                onAddNew={handleAddNew}
                onDelete={id => setConfirmDelete({ isOpen: true, id })}
                branches={branches}
                onBackToHome={() => onNavigate('dashboard')}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={async () => {
                    try {
                        await api.deleteConsultant(confirmDelete.id);
                        onToast('Provider deleted', 'success');
                        setRefreshKey(prev => prev + 1);
                    } catch (err) {
                        onToast('Delete failed', 'error');
                    }
                }}
                title="Delete Provider"
                message="Are you sure you want to remove this service provider? Associated schedules will be unlinked."
                confirmText="Delete Provider"
            />

            <Modal
                isOpen={view === 'form'}
                onClose={() => setView('list')}
                title={editingSpecialist ? 'Edit Specialist' : 'Add New Specialist'}
                icon="👤"
            >
                <form onSubmit={handleSubmit} className="module-form" noValidate>
                    <div className="form-grid">
                        <div className={`premium-field ${errors.name ? 'has-error' : ''}`} style={{ '--stagger': 1 }}>
                            <label htmlFor="consultant-name">Consultant Name</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">👨‍⚕️</div>
                                <input
                                    id="consultant-name"
                                    type="text"
                                    placeholder="Enter full name"
                                    required
                                    value={form.name}
                                    onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: null }); }}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? "consultant-name-error" : undefined}
                                />
                            </div>
                            {errors.name && <span id="consultant-name-error" className="error-message">{errors.name}</span>}
                        </div>

                        <div className={`premium-field ${errors.email ? 'has-error' : ''}`} style={{ '--stagger': 2 }}>
                            <label htmlFor="consultant-email">Email Address</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">📧</div>
                                <input
                                    id="consultant-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                    value={form.email}
                                    onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "consultant-email-error" : undefined}
                                />
                            </div>
                            {errors.email && <span id="consultant-email-error" className="error-message">{errors.email}</span>}
                        </div>

                        <div className={`premium-field ${errors.contact ? 'has-error' : ''}`} style={{ '--stagger': 3 }}>
                            <label htmlFor="consultant-contact">Contact Number</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">📞</div>
                                <input
                                    id="consultant-contact"
                                    type="tel"
                                    placeholder="10-digit number"
                                    required
                                    value={form.contact}
                                    onChange={e => { setForm({ ...form, contact: e.target.value.replace(/\D/g, '').slice(0, 10) }); setErrors({ ...errors, contact: null }); }}
                                    aria-invalid={!!errors.contact}
                                    aria-describedby={errors.contact ? "consultant-contact-error" : undefined}
                                />
                            </div>
                            {errors.contact && <span id="consultant-contact-error" className="error-message">{errors.contact}</span>}
                        </div>

                        <div className={`premium-field ${errors.branch_id ? 'has-error' : ''}`} style={{ '--stagger': 4 }}>
                            <label htmlFor="consultant-branch">Assigned Branch</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">🏢</div>
                                <select
                                    id="consultant-branch"
                                    value={form.branch_id}
                                    onChange={e => { setForm({ ...form, branch_id: e.target.value }); setErrors({ ...errors, branch_id: null }); }}
                                    aria-invalid={!!errors.branch_id}
                                    aria-describedby={errors.branch_id ? "consultant-branch-error" : undefined}
                                    required
                                >
                                    <option value="" disabled>Select a Branch</option>
                                    {branches.map(b => (
                                        <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.branch_id && <span id="consultant-branch-error" className="error-message">{errors.branch_id}</span>}
                        </div>

                        <div className="premium-field" style={{ '--stagger': 5 }}>
                            <label htmlFor="consultant-specialization">Specialization</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">🎓</div>
                                <input
                                    id="consultant-specialization"
                                    type="text"
                                    placeholder="e.g. Cardiology"
                                    required
                                    value={form.specialization}
                                    onChange={e => setForm({ ...form, specialization: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={`premium-field span-2 ${errors.bio ? 'has-error' : ''}`} style={{ '--stagger': 6 }}>
                            <label htmlFor="consultant-bio">Bio / Description</label>
                            <div className="premium-input-wrapper textarea-wrapper">
                                <div className="prefix-icon-box" style={{ alignItems: 'flex-start', paddingTop: '18px' }}>📝</div>
                                <textarea
                                    id="consultant-bio"
                                    rows="3"
                                    placeholder="Brief details about expertise..."
                                    value={form.bio}
                                    onChange={e => { setForm({ ...form, bio: e.target.value }); setErrors({ ...errors, bio: null }); }}
                                    maxLength={500}
                                />
                            </div>
                            <div className={`char-counter ${form.bio.length >= 450 ? 'limit' : ''}`}>
                                {form.bio.length}/500
                            </div>
                            {errors.bio && <span className="error-text">{errors.bio}</span>}
                        </div>

                        <div className={`premium-field span-2 ${errors.password ? 'has-error' : ''}`} style={{ '--stagger': 7 }}>
                            <label htmlFor="consultant-password">
                                {editingSpecialist ? 'Change Password (Optional)' : 'Login Password'}
                            </label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">🔑</div>
                                <input
                                    id="consultant-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={editingSpecialist ? "Leave blank to keep current" : "Min. 6 characters"}
                                    value={form.password}
                                    onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: null }); }}
                                    required={!editingSpecialist}
                                />
                                <div className="input-actions" style={{ position: 'relative', right: '12px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                    <button type="button" className="action-tiny" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                    </div>

                    <div className="module-form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setView('list')} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                            <span className="btn-icon">💾</span>
                            {loading ? 'Saving...' : (editingSpecialist ? 'Update Specialist' : 'Save Specialist')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
