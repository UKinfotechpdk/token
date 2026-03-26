import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/api';
import SearchFilter from './SearchFilter';

export default function ConsultantList({ onToast, onAddNew, onEdit, onDelete, branches, onBackToHome }) {
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchConsultants = async () => {
        setLoading(true);
        try {
            const res = await api.getConsultants();
            // LIFO Sorting: Most recently added first
            const sortedData = [...res.data].sort((a, b) => b.consultant_id - a.consultant_id);
            setConsultants(sortedData);
        } catch (err) {
            console.error('Error:', err);
            onToast('Failed to load providers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchConsultants(); }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const handleToggleStatus = async (consultant) => {
        const newStatus = consultant.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateConsultant(consultant.consultant_id, { status: newStatus });
            onToast(`Provider marked as ${newStatus}`, 'success');
            setConsultants(prev => prev.map(c => c.consultant_id === consultant.consultant_id ? { ...c, status: newStatus } : c));
        } catch (err) {
            onToast('Failed to update status', 'error');
        }
    };

    const handleDelete = (id) => {
        onDelete(id);
    };

    const filteredProviders = useMemo(() => {
        return consultants.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.specialization.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [consultants, searchTerm, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
    const paginatedProviders = filteredProviders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading && consultants.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="list-page">
            <SearchFilter
                placeholder="Search providers by name or category..."
                onSearch={setSearchTerm}
                onFilter={setStatusFilter}
                filterOptions={[
                    { label: 'All Status', value: 'All' },
                    { label: 'Active Only', value: 'Active' },
                    { label: 'Inactive Only', value: 'Inactive' }
                ]}
            />

            {filteredProviders.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">👤</div>
                    <p>{searchTerm ? 'No providers match your search' : 'No providers found'}</p>
                    <button className="btn btn-primary" onClick={onAddNew} style={{ marginTop: 16 }}>+ Add Provider</button>
                </div>
            ) : (
                <>
                    <div className="list-table-wrap">
                        <table className="list-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Provider Name</th>
                                    <th>Category</th>
                                    <th>Assigned Branch</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProviders.map((c, i) => (
                                    <tr key={c.consultant_id} style={{ height: '72px' }}>
                                        <td className="row-num" data-label="#">{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                                        <td className="primary-cell" data-label="Provider Name">
                                            <strong>{c.name}</strong>
                                            {c.bio && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 400 }}>{c.bio.substring(0, 60)}...</div>}
                                        </td>
                                        <td data-label="Category"><span className="badge">{c.specialization}</span></td>
                                        <td data-label="Branch">
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                🏢 {branches.find(b => b.branch_id === c.branch_id)?.branch_name || 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td data-label="Contact">
                                            <div>📞 {c.contact}</div>
                                            {c.email && <div style={{ fontSize: '11px', color: '#0d9488' }}>📧 {c.email}</div>}
                                        </td>
                                        <td data-label="Status">
                                            <span
                                                className={`badge ${c.status === 'Active' ? 'active' : 'inactive'}`}
                                                onClick={() => handleToggleStatus(c)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to toggle status"
                                            >
                                                {c.status || 'Active'}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className="module-actions">
                                                <button className="btn-icon" onClick={() => onEdit(c)} title="Edit">✏️</button>
                                                <button className="btn-icon danger" onClick={() => handleDelete(c.consultant_id)} title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Fill remaining rows to maintain height */}
                                {[...Array(Math.max(0, itemsPerPage - paginatedProviders.length))].map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="empty-row" style={{ height: '72px', border: 'none' }}>
                                        <td colSpan="7" style={{ border: 'none' }}></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination + Navigation Footer */}
                    <div className="list-footer">
                        <button className="btn-secondary" onClick={onBackToHome} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🏠</span> Back to Dashboard
                        </button>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="page-info" style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: '600' }}>
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        className="p-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ‹
                                    </button>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button
                                                key={idx + 1}
                                                className={`p-num ${currentPage === idx + 1 ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(idx + 1)}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="p-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
