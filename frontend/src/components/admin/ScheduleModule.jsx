import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/api';
import ScheduleList from './ScheduleList';
import Modal from '../Modal';
import ConfirmModal from '../ConfirmModal';

export default function ScheduleModule({ onToast, onNavigate }) {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [branches, setBranches] = useState([]);

    const [seriesInfo, setSeriesInfo] = useState({ next_series: 'A', used_series: [], config: {}, preview: 'A1' });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [showConfig, setShowConfig] = useState(false); // Keep this, it's for the config panel
    const [customSeries, setCustomSeries] = useState('');
    const [configForm, setConfigForm] = useState({ prefix: '', number_format: 'plain' });
    const [createdTokens, setCreatedTokens] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const [form, setForm] = useState({
        branch_id: '', provider_name: '', service_name: '', date: new Date().toISOString().split('T')[0],
        start_time: '09:00', end_time: '17:00', tokens: 10, fees: ''
    });
    const [duration_hours, setDurationHours] = useState(8);
    const [consultants, setConsultants] = useState([]);

    const [providerSelect, setProviderSelect] = useState('');
    const [isManualProvider, setIsManualProvider] = useState(false);
    const [errors, setErrors] = useState({});
    const [originalTokens, setOriginalTokens] = useState(0);

    const branchProviders = useMemo(() => {
        if (!form.branch_id) return [];
        return consultants.filter(c => String(c.branch_id) === String(form.branch_id));
    }, [form.branch_id, consultants]);

    const otherProviders = useMemo(() => {
        if (!form.branch_id) return consultants;
        return consultants.filter(c => String(c.branch_id) !== String(form.branch_id));
    }, [form.branch_id, consultants]);

    const handleProviderChange = (e) => {
        const val = e.target.value;
        setProviderSelect(val);
        setErrors(prev => ({ ...prev, providerSelect: null }));

        if (val === 'manual') {
            setIsManualProvider(true);
            setForm(prev => ({ ...prev, provider_name: '', service_name: '' }));
        } else if (val === 'all') {
            setIsManualProvider(false);
            setForm(prev => ({ ...prev, provider_name: 'All Providers', service_name: 'General Service' }));
        } else if (val === '') {
            setIsManualProvider(false);
            setForm(prev => ({ ...prev, provider_name: '', service_name: '' }));
        } else {
            setIsManualProvider(false);
            const selected = consultants.find(c => String(c.consultant_id) === String(val));
            if (selected) {
                setForm(prev => ({ ...prev, provider_name: selected.name, service_name: selected.specialization }));
                setErrors(prev => ({ ...prev, service_name: null }));
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bRes, sRes, cRes] = await Promise.all([
                    api.getBranches(), api.getNextSeries(), api.getConsultants()
                ]);
                setBranches(bRes.data);
                setSeriesInfo(sRes.data);
                setConsultants(cRes.data);
                setConfigForm({
                    prefix: sRes.data.config?.prefix || '',
                    number_format: sRes.data.config?.number_format || 'plain'
                });
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchData();
    }, []);

    // Auto-calculate end_time from start_time + duration_hours
    useEffect(() => {
        if (form.start_time && duration_hours > 0) {
            const [h, m] = form.start_time.split(':').map(Number);
            const totalMins = h * 60 + m + duration_hours * 60;
            const endH = Math.floor(totalMins / 60) % 24;
            const endM = totalMins % 60;
            const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            setForm(prev => ({ ...prev, end_time: endTime }));
            setErrors(prev => ({ ...prev, time: null }));
        }
    }, [form.start_time, duration_hours]);

    const handleAddNew = () => {
        setCreatedTokens([]);
        setEditingSchedule(null);
        setDurationHours(8);
        setForm({
            branch_id: '', provider_name: '', service_name: '', date: new Date().toISOString().split('T')[0],
            start_time: '09:00', end_time: '17:00', tokens: 10, fees: ''
        });
        setProviderSelect('');
        setIsManualProvider(false);
        setErrors({});
        setView('form');
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setForm({
            branch_id: schedule.branch_id || '',
            provider_name: schedule.consultant_name || '',
            service_name: schedule.service_name || '',
            date: schedule.date || new Date().toISOString().split('T')[0],
            start_time: schedule.start_time || '09:00',
            end_time: schedule.end_time || '17:00',
            tokens: schedule.token_count || 10,
            fees: schedule.fees !== undefined ? schedule.fees.toString() : ''
        });
        setOriginalTokens(schedule.token_count || 1);
        // Compute duration from existing start/end
        if (schedule.start_time && schedule.end_time) {
            const [sh, sm] = schedule.start_time.split(':').map(Number);
            const [eh, em] = schedule.end_time.split(':').map(Number);
            const diffMins = (eh * 60 + em) - (sh * 60 + sm);
            setDurationHours(diffMins > 0 ? Math.round(diffMins / 60) : 1);
        } else {
            setDurationHours(8);
        }

        if (schedule.consultant_id) {
            setProviderSelect(schedule.consultant_id.toString());
            setIsManualProvider(false);
        } else if (schedule.consultant_name && schedule.consultant_name.toLowerCase() === 'all providers') {
            setProviderSelect('all');
            setIsManualProvider(false);
        } else if (schedule.consultant_name && schedule.consultant_name.toLowerCase() !== 'counter service') {
            setProviderSelect('manual');
            setIsManualProvider(true);
        } else {
            setProviderSelect('');
            setIsManualProvider(false);
        }
        setErrors({});
        setView('form');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.branch_id) newErrors.branch_id = "Service center branch is required";
        if (!isManualProvider && !providerSelect) newErrors.providerSelect = "Please select a provider from the list or choose Manual Entry";
        if (isManualProvider && (!form.provider_name || form.provider_name.length < 3)) newErrors.provider_name = "Provider name must be at least 3 characters";
        if (!form.service_name || form.service_name.length < 3) newErrors.service_name = "Service name must be at least 3 characters";

        const today = new Date().toISOString().split('T')[0];
        if (!form.date || form.date < today) newErrors.date = "Cannot schedule dates in the past";
        if (!form.start_time) newErrors.time = "Start time is required";
        if (!duration_hours || duration_hours < 0.5 || duration_hours > 12) newErrors.duration = "Duration must be between 0.5 and 12 hours";
        if (!form.tokens || parseInt(form.tokens) < 1 || parseInt(form.tokens) > 500) {
            newErrors.tokens = "Tokens must be between 1 and 500";
        } else if (editingSchedule && parseInt(form.tokens) < originalTokens) {
            newErrors.tokens = `Tokens cannot be decreased below ${originalTokens} (current)`;
        }
        if (form.fees === '' || parseFloat(form.fees) < 0) newErrors.fees = "Fees cannot be a negative amount";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setTimeout(() => {
                const el = document.querySelector('.input-error');
                if (el) el.focus();
            }, 100);
            return false;
        }
        return true;
    };

    const isFormValid = form.branch_id &&
        ((!isManualProvider && providerSelect) || (isManualProvider && form.provider_name?.length >= 3)) &&
        form.service_name?.length >= 3 &&
        form.date >= new Date().toISOString().split('T')[0] &&
        form.start_time && duration_hours >= 0.5 && duration_hours <= 12 &&
        form.tokens >= 1 && form.tokens <= 500 &&
        (editingSchedule ? parseInt(form.tokens) >= originalTokens : true) &&
        form.fees !== '' && parseFloat(form.fees) >= 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const payload = {
                branch_id: parseInt(form.branch_id),
                provider_name: isManualProvider ? form.provider_name : (providerSelect === 'all' ? 'All Providers' : (consultants.find(c => String(c.consultant_id) === String(providerSelect))?.name || form.provider_name)),
                consultant_id: !isManualProvider && providerSelect && providerSelect !== 'all' ? parseInt(providerSelect) : null,
                service_name: form.service_name,
                date: form.date,
                start_time: form.start_time,
                end_time: form.end_time,
                tokens: parseInt(form.tokens),
                fees: parseFloat(form.fees)
            };
            if (customSeries.trim()) {
                payload.token_series = customSeries.trim().toUpperCase();
            }

            if (editingSchedule) {
                await api.updateSchedule(editingSchedule.schedule_id, payload);
                onToast('Schedule updated successfully!', 'success');
            } else {
                const res = await api.createSchedule(payload);
                setCreatedTokens(res.data.tokens || []);
                onToast(`Schedule created with ${res.data.token_series}-series tokens!`, 'success');
            }

            setView('list');
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            onToast(err.response?.data?.error || 'Failed to check schedule overlaps or save.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfigSave = async () => {
        try {
            const res = await api.updateTokenConfig(configForm);
            setSeriesInfo(prev => ({ ...prev, config: res.data.config, preview: res.data.preview }));
            onToast('Token configuration updated!', 'success');
            setShowConfig(false);
        } catch (err) {
            onToast('Failed to update config', 'error');
        }
    };

    const activeSeries = customSeries.trim().toUpperCase() || seriesInfo.next_series;

    return (
        <div className="module-view">
            <div className="module-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onNavigate('dashboard')}>
                        <span>🏠</span> Back
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, color: 'white', letterSpacing: '-0.5px' }}>Manage Schedules</h2>
                </div>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleAddNew}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span> Create New Schedule
                </button>
            </div>

            <ScheduleList
                key={refreshKey}
                onToast={onToast}
                onAddNew={handleAddNew}
                onEdit={handleEdit}
                onDelete={id => setConfirmDelete({ isOpen: true, id })}
                onBackToHome={() => onNavigate('dashboard')}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={async () => {
                    try {
                        await api.deleteSchedule(confirmDelete.id);
                        onToast('Schedule deleted', 'success');
                        setRefreshKey(prev => prev + 1);
                    } catch (err) {
                        onToast('Delete failed', 'error');
                    }
                }}
                title="Delete Schedule"
                message="Are you sure you want to remove this schedule? This will revoke all future tokens for this slot."
                confirmText="Delete Schedule"
            />

            <Modal
                isOpen={view === 'form'}
                onClose={() => setView('list')}
                title={editingSchedule ? "Edit Schedule" : "Create New Schedule"}
                icon="📅"
                headerAction={
                    <button type="button" className="btn-icon" onClick={() => setShowConfig(!showConfig)} title="Token Config">
                        ⚙️
                    </button>
                }
            >
                <div style={{ padding: '0 20px 20px' }}>
                    {/* Config Panel (collapsible) */}
                    {showConfig && (
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16,
                            padding: 24,
                            marginBottom: 24,
                            animation: 'expandDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 20, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⚙️ Token Series Configuration
                            </div>
                            <div className="form-grid">
                                <div className="premium-field" style={{ margin: 0 }}>
                                    <label>Custom Series</label>
                                    <div className="premium-input-wrapper">
                                        <div className="prefix-icon-box">🔠</div>
                                        <input
                                            type="text" maxLength={1}
                                            value={customSeries}
                                            onChange={e => setCustomSeries(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                                            placeholder={`Auto: ${seriesInfo.next_series}`}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                </div>
                                <div className="premium-field" style={{ margin: 0 }}>
                                    <label>Token Prefix</label>
                                    <div className="premium-input-wrapper">
                                        <div className="prefix-icon-box">🔖</div>
                                        <input
                                            type="text" maxLength={10}
                                            value={configForm.prefix}
                                            onChange={e => setConfigForm({ ...configForm, prefix: e.target.value })}
                                            placeholder="e.g. TK-"
                                        />
                                    </div>
                                </div>
                                <div className="premium-field" style={{ margin: 0 }}>
                                    <label>Format</label>
                                    <div className="premium-input-wrapper">
                                        <div className="prefix-icon-box">🔢</div>
                                        <select
                                            value={configForm.number_format}
                                            onChange={e => setConfigForm({ ...configForm, number_format: e.target.value })}
                                        >
                                            <option value="plain">Plain (A1)</option>
                                            <option value="padded">Padded (A01)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="premium-field" style={{ margin: 0 }}>
                                    <label>Preview</label>
                                    <div style={{
                                        padding: '12px 18px',
                                        background: 'rgba(37, 99, 235, 0.1)',
                                        borderRadius: 12,
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: 'var(--primary)',
                                        border: '1px solid rgba(37, 99, 235, 0.2)',
                                        height: '52px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {configForm.prefix}{activeSeries}{configForm.number_format === 'padded' ? '01' : '1'}...
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConfig(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleConfigSave}>💾 Save Config</button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="module-form" noValidate>
                        <div className="form-grid">
                            <div className={`premium-field full-width ${errors.branch_id ? 'has-error' : ''}`} style={{ '--stagger': 1 }}>
                                <label htmlFor="sched-branch">Service Center Branch</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">🏢</div>
                                    <select
                                        id="sched-branch"
                                        value={form.branch_id}
                                        onChange={e => { setForm({ ...form, branch_id: e.target.value }); setErrors({ ...errors, branch_id: null }); }}
                                        aria-invalid={!!errors.branch_id}
                                        aria-describedby={errors.branch_id ? "sched-branch-error" : undefined}
                                    >
                                        <option value="" disabled>Select Branch</option>
                                        {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                                {errors.branch_id && <span id="sched-branch-error" className="error-message">{errors.branch_id}</span>}
                            </div>

                            <div className={`premium-field ${errors.providerSelect ? 'has-error' : ''}`} style={{ '--stagger': 2 }}>
                                <label htmlFor="sched-provider">Assign Provider</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">👤</div>
                                    <select
                                        id="sched-provider"
                                        value={providerSelect}
                                        onChange={handleProviderChange}
                                        aria-invalid={!!errors.providerSelect}
                                        aria-describedby={errors.providerSelect ? "sched-provider-error" : undefined}
                                    >
                                        <option value="" disabled>Select Provider</option>
                                        <option value="all">All Providers (Global)</option>
                                        {branchProviders.length > 0 && (
                                            <optgroup label="Branch Providers">
                                                {branchProviders.map(c => <option key={c.consultant_id} value={c.consultant_id}>{c.name}</option>)}
                                            </optgroup>
                                        )}
                                        {otherProviders.length > 0 && (
                                            <optgroup label="Other Providers (Global)">
                                                {otherProviders.map(c => <option key={c.consultant_id} value={c.consultant_id}>{c.name}</option>)}
                                            </optgroup>
                                        )}
                                        <option value="manual">✍️ Manual Entry</option>
                                    </select>
                                </div>
                                {errors.providerSelect && <span id="sched-provider-error" className="error-message">{errors.providerSelect}</span>}
                            </div>

                            {isManualProvider && (
                                <div className={`premium-field ${errors.provider_name ? 'has-error' : ''}`} style={{ '--stagger': 3 }}>
                                    <label htmlFor="sched-manual-prov">Custom Provider Name</label>
                                    <div className="premium-input-wrapper">
                                        <div className="prefix-icon-box">✍️</div>
                                        <input
                                            id="sched-manual-prov"
                                            type="text"
                                            value={form.provider_name}
                                            onChange={e => { setForm({ ...form, provider_name: e.target.value }); setErrors({ ...errors, provider_name: null }); }}
                                            aria-invalid={!!errors.provider_name}
                                            aria-describedby={errors.provider_name ? "sched-manual-prov-error" : undefined}
                                        />
                                    </div>
                                    {errors.provider_name && <span id="sched-manual-prov-error" className="error-message">{errors.provider_name}</span>}
                                </div>
                            )}

                            <div className={`premium-field ${errors.service_name ? 'has-error' : ''}`} style={{ '--stagger': 3 }}>
                                <label htmlFor="sched-service">Service Name / Type</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">📋</div>
                                    <input
                                        id="sched-service"
                                        type="text"
                                        value={form.service_name}
                                        onChange={e => { setForm({ ...form, service_name: e.target.value }); setErrors({ ...errors, service_name: null }); }}
                                        aria-invalid={!!errors.service_name}
                                        aria-describedby={errors.service_name ? "sched-service-error" : undefined}
                                    />
                                </div>
                                {errors.service_name && <span id="sched-service-error" className="error-message">{errors.service_name}</span>}
                            </div>
                        </div>

                        {editingSchedule && (
                            <div className="edit-mode-notice" style={{ '--stagger': 4 }}>
                                <span>ℹ️</span>
                                <span>Edit mode: Only <strong>Number of Tokens</strong> can be changed (increase only).</span>
                            </div>
                        )}

                        <div className="form-grid">
                            <div className={`premium-field ${errors.date ? 'has-error' : ''}`} style={{ '--stagger': 4 }}>
                                <label htmlFor="sched-date">Schedule Date</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">📅</div>
                                    <input
                                        id="sched-date"
                                        type="date"
                                        value={form.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: null }); }}
                                        disabled={!!editingSchedule}
                                    />
                                </div>
                                {errors.date && <span className="error-text">{errors.date}</span>}
                            </div>

                            <div className={`premium-field ${errors.time ? 'has-error' : ''}`} style={{ '--stagger': 5 }}>
                                <label htmlFor="sched-start">Start Time</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">🕒</div>
                                    <input
                                        id="sched-start"
                                        type="time"
                                        value={form.start_time}
                                        onChange={e => { setForm({ ...form, start_time: e.target.value }); setErrors({ ...errors, time: null }); }}
                                        disabled={!!editingSchedule}
                                    />
                                </div>
                                {errors.time && <span className="error-text">{errors.time}</span>}
                            </div>

                            <div className={`premium-field ${errors.duration ? 'has-error' : ''}`} style={{ '--stagger': 6 }}>
                                <label htmlFor="sched-duration">Duration (Hours)</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">⏱️</div>
                                    <input
                                        id="sched-duration"
                                        type="number"
                                        min="0.5" max="12" step="0.5"
                                        value={duration_hours}
                                        onChange={e => { setDurationHours(parseFloat(e.target.value) || 1); setErrors({ ...errors, duration: null }); }}
                                        disabled={!!editingSchedule}
                                    />
                                </div>
                                {errors.duration && <span className="error-text">{errors.duration}</span>}
                            </div>

                            <div className="premium-field" style={{ '--stagger': 7 }}>
                                <label htmlFor="sched-end">End Time (Auto)</label>
                                <div className="premium-input-wrapper disabled">
                                    <div className="prefix-icon-box">🕔</div>
                                    <input
                                        id="sched-end"
                                        type="time"
                                        value={form.end_time}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className={`premium-field ${errors.tokens ? 'has-error' : ''}`} style={{ '--stagger': 8 }}>
                                <label htmlFor="sched-tokens">Number of Tokens</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">🎟️</div>
                                    <input
                                        id="sched-tokens"
                                        type="number"
                                        min={editingSchedule ? originalTokens : 1}
                                        max="500"
                                        value={form.tokens}
                                        onChange={e => {
                                            const val = parseInt(e.target.value) || 1;
                                            setForm({ ...form, tokens: Math.max(val, editingSchedule ? originalTokens : 1) });
                                            setErrors({ ...errors, tokens: null });
                                        }}
                                    />
                                </div>
                                {editingSchedule && (
                                    <span className="info-text">Min: {originalTokens} (current). Can only increase.</span>
                                )}
                                {errors.tokens && <span className="error-text">{errors.tokens}</span>}
                            </div>

                            <div className={`premium-field ${errors.fees ? 'has-error' : ''}`} style={{ '--stagger': 9 }}>
                                <label htmlFor="sched-fees">Service Fees (₹)</label>
                                <div className="premium-input-wrapper">
                                    <div className="prefix-icon-box">₹</div>
                                    <input
                                        id="sched-fees"
                                        type="number" min="0" step="0.01"
                                        value={form.fees}
                                        onChange={e => { setForm({ ...form, fees: e.target.value }); setErrors({ ...errors, fees: null }); }}
                                        placeholder="0.00"
                                        disabled={!!editingSchedule}
                                    />
                                </div>
                                {errors.fees && <span className="error-text">{errors.fees}</span>}
                            </div>
                        </div>

                        <div className="module-form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setView('list')} disabled={loading}>
                                Cancel
                            </button>
                            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
                                <span className="btn-icon">📅</span>
                                {loading ? 'Saving...' : (editingSchedule ? 'Update Schedule' : 'Create Schedule')}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
