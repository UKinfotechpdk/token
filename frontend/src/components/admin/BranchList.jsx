import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/api';
import SearchFilter from './SearchFilter';

export default function BranchList({ onToast, onAddNew, onEdit, onDelete, onBackToHome }) {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await api.getBranches();
            setBranches(res.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBranches(); }, []);

    const handleToggleStatus = async (branch) => {
        const newStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateBranch(branch.branch_id, { ...branch, status: newStatus });
            onToast(`Branch marked as ${newStatus}`, 'success');
            setBranches(prev => prev.map(b => b.branch_id === branch.branch_id ? { ...b, status: newStatus } : b));
        } catch (err) {
            onToast('Failed to update status', 'error');
        }
    };

    const filteredBranches = useMemo(() => {
        return branches.filter(b => {
            const matchesSearch = b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [branches, searchTerm, statusFilter]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Paginated results
    const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
    const paginatedBranches = filteredBranches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading && branches.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="list-page">
            <SearchFilter
                placeholder="Search branches by name or location..."
                onSearch={term => { setSearchTerm(term); setCurrentPage(1); }}
                onFilter={filter => { setStatusFilter(filter); setCurrentPage(1); }}
                filterOptions={[
                    { label: 'All Status', value: 'All' },
                    { label: 'Active Only', value: 'Active' },
                    { label: 'Inactive Only', value: 'Inactive' }
                ]}
            />

            {filteredBranches.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">🏢</div>
                    <p>{searchTerm ? 'No branches match your search' : 'No branches found'}</p>
                    <button className="btn btn-primary" onClick={onAddNew} style={{ marginTop: 16 }}>+ Add Branch</button>
                </div>
            ) : (
                <>
                    <div className="list-table-wrap">
                        <table className="list-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>Branch Name</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th style={{ width: '120px' }}>Status</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBranches.map((b, i) => {
                                    const rowIndex = (currentPage - 1) * itemsPerPage + i + 1;
                                    const isActive = b.status?.toLowerCase() === 'active';
                                    return (
                                        <tr key={b.branch_id} style={{ height: '72px' }}>
                                            <td className="row-num" data-label="#">{rowIndex}</td>
                                            <td className="primary-cell" data-label="Branch Name">
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.branch_name}</div>
                                                {b.description && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: 'var(--text-muted)',
                                                        marginTop: '2px',
                                                        fontWeight: 400,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {b.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td data-label="Location">
                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.location}>
                                                    📍 {b.location}
                                                </div>
                                            </td>
                                            <td data-label="Contact">
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>📞 {b.contact}</div>
                                                {b.email && <div style={{ fontSize: '11px', color: '#0d9488', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📧 {b.email}</div>}
                                            </td>
                                            <td data-label="Status">
                                                <span
                                                    className={`badge ${isActive ? 'active' : 'inactive'}`}
                                                    onClick={() => handleToggleStatus(b)}
                                                    title="Click to toggle status"
                                                >
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="module-actions">
                                                    <button className="btn-icon" onClick={() => onEdit(b)} title="Edit Record">✏️</button>
                                                    <button className="btn-icon danger" onClick={() => onDelete(b.branch_id)} title="Remove Record">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Fill remaining rows to maintain height */}
                                {[...Array(Math.max(0, itemsPerPage - paginatedBranches.length))].map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="empty-row" style={{ height: '72px', border: 'none' }}>
                                        <td colSpan="6" style={{ border: 'none' }}></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* List Footer: Navigation & Pagination */}
                    <div className="list-footer">
                        <button
                            className="btn-secondary"
                            onClick={() => onBackToHome()}
                            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <span>🏠</span> Back to Dashboard
                        </button>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: '600' }} className="page-info">
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
            <style dangerouslySetInnerHTML={{
                __html: `
                .list-table td {
                    height: 72px;
                    padding: 8px 16px;
                }
            `}} />
        </div>
    );
}
