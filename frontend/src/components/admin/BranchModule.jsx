import React, { useState } from 'react';
import * as api from '../../api/api';
import BranchList from './BranchList';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function BranchModule({ onToast, onNavigate }) {
    const [view, setView] = useState('list');
    const [editingBranch, setEditingBranch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [form, setForm] = useState({
        branch_name: '', location: '', contact: '', email: '',
        description: '', status: 'Active'
    });
    const [errors, setErrors] = useState({});
    const [allBranches, setAllBranches] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const validateField = (name, value, currentForm = form) => {
        let error = '';
        switch (name) {
            case 'branch_name':
                if (!/^[a-zA-Z\s]{3,}$/.test(value)) error = 'Enter a valid branch name (min 3 characters, letters only)';
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid official email address';
                break;
            case 'contact':
                const cleanContact = value.replace(/^\+91/, '');
                if (!/^[6-9][0-9]{9}$/.test(cleanContact)) error = 'Enter a valid 10-digit Indian mobile number';
                break;
            case 'location':
                if (!value.trim()) error = 'Location address is required';
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const fieldMapping = {
            'branch-name': 'branch_name',
            'branch-email': 'email',
            'branch-contact': 'contact',
            'branch-location': 'location',
            'branch-description': 'description',
            'branch-status': 'status'
        };
        const fieldName = fieldMapping[id];
        if (!fieldName) return;

        let processedValue = value;
        if (fieldName === 'contact') {
            processedValue = value.replace(/\D/g, '').slice(0, 10);
        }

        const newForm = { ...form, [fieldName]: processedValue };
        setForm(newForm);

        const error = validateField(fieldName, processedValue, newForm);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
    };

    const isFormValid = () => {
        const requiredFields = ['branch_name', 'email', 'contact', 'location'];
        const hasErrors = Object.values(errors).some(err => err !== '');
        const allFieldsFilled = requiredFields.every(field => String(form[field]).trim() !== '');
        return !hasErrors && allFieldsFilled;
    };

    const handleAddNew = async () => {
        try {
            const res = await api.getBranches();
            setAllBranches(res.data || []);
        } catch { }
        setEditingBranch(null);
        setForm({ branch_name: '', location: '', contact: '', email: '', description: '', status: 'Active' });
        setErrors({});
        setView('form');
    };

    const handleEdit = async (branch) => {
        try {
            const res = await api.getBranches();
            setAllBranches(res.data || []);
        } catch { }
        setEditingBranch(branch);
        setForm({
            branch_name: branch.branch_name,
            location: branch.location,
            contact: (branch.contact || '').replace(/^\+91/, ''),
            email: branch.email || '',
            description: branch.description || '',
            status: branch.status
        });
        setErrors({});
        setView('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        // Duplicate branch name check
        const normalName = form.branch_name.trim().toLowerCase();
        const duplicate = allBranches.find(b =>
            b.branch_name.trim().toLowerCase() === normalName &&
            (!editingBranch || b.branch_id !== editingBranch.branch_id)
        );
        if (duplicate) {
            setErrors(prev => ({ ...prev, branch_name: `A branch named "${form.branch_name.trim()}" already exists` }));
            return;
        }

        setLoading(true);
        const payload = {
            ...form,
            contact: `+91${form.contact}`,
            opening_hours: 'N/A'
        };

        try {
            if (editingBranch) {
                await api.updateBranch(editingBranch.branch_id, payload);
                onToast('Branch updated successfully!', 'success');
            } else {
                await api.createBranch(payload);
                onToast('Branch added successfully!', 'success');
            }
            setView('list');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            onToast(err.response?.data?.error || 'Failed to save branch', 'error');
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
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Manage Branches</h2>
                </div>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleAddNew}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Add New Branch
                </button>
            </div>

            <BranchList
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
                        await api.deleteBranch(confirmDelete.id);
                        onToast('Branch deleted', 'success');
                        setRefreshKey(prev => prev + 1);
                    } catch (err) {
                        onToast('Delete failed', 'error');
                    }
                }}
                title="Delete Branch"
                message="Are you sure you want to remove this branch? This will impact associated staff and schedules."
                confirmText="Delete Branch"
            />

            <Modal
                isOpen={view === 'form'}
                onClose={() => setView('list')}
                title={editingBranch ? 'Edit Branch' : 'Add New Branch'}
                icon="🏢"
            >
                <form onSubmit={handleSubmit} className="module-form" noValidate>
                    <div className="form-grid">
                        <div className={`premium-field ${errors.branch_name ? 'has-error' : ''}`} style={{ '--stagger': 1 }}>
                            <label htmlFor="branch-name">Branch Name</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">🏢</div>
                                <input
                                    id="branch-name"
                                    type="text"
                                    placeholder="Enter branch name"
                                    required
                                    value={form.branch_name}
                                    onChange={handleInputChange}
                                    autoFocus
                                    aria-invalid={!!errors.branch_name}
                                    aria-describedby={errors.branch_name ? "branch-name-error" : undefined}
                                />
                            </div>
                            {errors.branch_name && <span id="branch-name-error" className="error-message">{errors.branch_name}</span>}
                        </div>

                        <div className={`premium-field ${errors.email ? 'has-error' : ''}`} style={{ '--stagger': 2 }}>
                            <label htmlFor="branch-email">Official Email</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">📧</div>
                                <input
                                    id="branch-email"
                                    type="email"
                                    placeholder="branch@example.com"
                                    required
                                    value={form.email}
                                    onChange={handleInputChange}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "branch-email-error" : undefined}
                                />
                            </div>
                            {errors.email && <span id="branch-email-error" className="error-message">{errors.email}</span>}
                        </div>

                        <div className={`premium-field ${errors.contact ? 'has-error' : ''}`} style={{ '--stagger': 3 }}>
                            <label htmlFor="branch-contact">Contact Number</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">📞</div>
                                <input
                                    id="branch-contact"
                                    type="tel"
                                    placeholder="10-digit number"
                                    required
                                    value={form.contact}
                                    onChange={handleInputChange}
                                    aria-invalid={!!errors.contact}
                                    aria-describedby={errors.contact ? "branch-contact-error" : undefined}
                                />
                            </div>
                            {errors.contact && <span id="branch-contact-error" className="error-message">{errors.contact}</span>}
                        </div>

                        <div className="premium-field" style={{ '--stagger': 4 }}>
                            <label htmlFor="branch-status">Status</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">⚙️</div>
                                <select
                                    id="branch-status"
                                    value={form.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className={`premium-field full-width ${errors.location ? 'has-error' : ''}`} style={{ '--stagger': 5 }}>
                            <label htmlFor="branch-address">Location Address</label>
                            <div className="premium-input-wrapper">
                                <div className="prefix-icon-box">📍</div>
                                <input
                                    id="branch-address"
                                    type="text"
                                    placeholder="Street, City, Area"
                                    required
                                    value={form.location}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {errors.location && <span className="error-message">{errors.location}</span>}
                        </div>

                        <div className="premium-field full-width" style={{ '--stagger': 6 }}>
                            <label htmlFor="branch-desc">Description (Optional)</label>
                            <div className="premium-input-wrapper textarea-wrapper">
                                <div className="prefix-icon-box" style={{ alignItems: 'flex-start', paddingTop: '18px' }}>📝</div>
                                <textarea
                                    id="branch-desc"
                                    placeholder="Brief details about this branch..."
                                    value={form.description}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                />
                            </div>
                            <div className={`char-counter ${form.description.length >= 450 ? 'limit' : ''}`}>
                                {form.description.length}/500
                            </div>
                        </div>
                    </div>

                    <div className="module-form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setView('list')} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={!isFormValid() || loading}>
                            <span className="btn-icon">💾</span>
                            {loading ? 'Saving...' : (editingBranch ? 'Update Branch' : 'Save Branch')}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
