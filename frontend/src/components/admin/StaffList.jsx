import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api/api';
import SearchFilter from './SearchFilter';

export default function StaffList({ onToast, onAddNew, onEdit, onDelete, onBackToHome }) {
    const [staffList, setStaffList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, branchRes] = await Promise.all([
                api.getStaff(),
                api.getBranches()
            ]);
            // LIFO Sorting: Most recently added first
            const sortedStaff = [...staffRes.data].sort((a, b) => b.staff_id - a.staff_id);
            setStaffList(sortedStaff);
            setBranches(branchRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, branchFilter]);

    const getBranchName = (id) => {
        const branch = branches.find(b => b.branch_id === id);
        return branch ? branch.branch_name : 'No Branch';
    };

    const handleToggleStatus = async (staff) => {
        const newStatus = (staff.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.updateStaff(staff.staff_id, { status: newStatus });
            onToast(`Staff marked as ${newStatus}`, 'success');
            setStaffList(prev => prev.map(s => s.staff_id === staff.staff_id ? { ...s, status: newStatus } : s));
        } catch (err) {
            onToast('Failed to update status', 'error');
        }
    };

    const handleDelete = (id) => {
        onDelete(id);
    };

    const filteredStaff = useMemo(() => {
        return staffList.filter(s => {
            const matchesSearch = s.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesBranch = branchFilter === 'All' || s.branch_id?.toString() === branchFilter;
            return matchesSearch && matchesBranch;
        });
    }, [staffList, searchTerm, branchFilter]);

    const branchOptions = useMemo(() => {
        const opts = [{ label: 'All Branches', value: 'All' }];
        branches.forEach(b => {
            opts.push({ label: b.branch_name, value: b.branch_id.toString() });
        });
        return opts;
    }, [branches]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading && staffList.length === 0) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="list-page">
            <SearchFilter
                placeholder="Search staff by name, email or contact..."
                onSearch={setSearchTerm}
                onFilter={setBranchFilter}
                filterOptions={branchOptions}
            />

            {filteredStaff.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">👥</div>
                    <p>{searchTerm ? 'No staff match your search' : 'No staff members found'}</p>
                    <button className="btn btn-primary" onClick={onAddNew} style={{ marginTop: 16 }}>+ Add Staff</button>
                </div>
            ) : (
                <>
                    <div className="list-table-wrap">
                        <table className="list-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Staff Member</th>
                                    <th>Contact & Email</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedStaff.map((s, i) => {
                                    const isActive = s.status?.toLowerCase() === 'active';
                                    return (
                                        <tr key={s.staff_id} style={{ height: '72px' }}>
                                            <td className="row-num" data-label="#">{((currentPage - 1) * itemsPerPage) + i + 1}</td>
                                            <td className="primary-cell" data-label="Staff Member">
                                                <strong>{s.staff_name}</strong>
                                            </td>
                                            <td data-label="Contact & Email">
                                                <div>📞 {s.contact}</div>
                                                {s.email && <div style={{ fontSize: '11px', color: 'var(--secondary)' }}>📧 {s.email}</div>}
                                            </td>
                                            <td data-label="Branch">📍 {getBranchName(s.branch_id)}</td>
                                            <td data-label="Status">
                                                <span
                                                    className={`badge ${isActive ? 'active' : 'inactive'}`}
                                                    onClick={() => handleToggleStatus(s)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Click to toggle status"
                                                >
                                                    {s.status || 'Active'}
                                                </span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="module-actions">
                                                    <button className="btn-icon" onClick={() => onEdit(s)} title="Edit Record">✏️</button>
                                                    <button className="btn-icon danger" onClick={() => handleDelete(s.staff_id)} title="Remove Account">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Fill remaining rows to maintain height */}
                                {[...Array(Math.max(0, itemsPerPage - paginatedStaff.length))].map((_, idx) => (
                                    <tr key={`empty-${idx}`} className="empty-row" style={{ height: '72px', border: 'none' }}>
                                        <td colSpan="6" style={{ border: 'none' }}></td>
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
