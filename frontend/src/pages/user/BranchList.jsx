import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicBranches } from '../../api/api';

export default function BranchList() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await getPublicBranches();
            setBranches(res.data);
        } catch (err) {
            console.error('Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBranch = (branch) => {
        if (branch.status !== 'Active') return;
        navigate(`/user/book-token/schedules/${branch.branch_id}`, { state: { branch } });
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="branch-list-page" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/user/dashboard')} style={{ marginRight: '16px' }}>← Back</button>
                <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Select Branch</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {branches.length > 0 ? branches.map(branch => (
                    <div
                        key={branch.branch_id}
                        className={`glass-card dash-card ${branch.status !== 'Active' ? 'op-50' : ''}`}
                        onClick={() => handleSelectBranch(branch)}
                        style={{
                            padding: '32px',
                            cursor: branch.status === 'Active' ? 'pointer' : 'not-allowed',
                            borderTop: `4px solid ${branch.status === 'Active' ? 'var(--secondary)' : '#666'}`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div className="card-icon-box" style={{ fontSize: '24px' }}>📍</div>
                            <span className={`badge ${branch.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                {branch.status === 'Active' ? 'OPEN' : 'CLOSED'}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>{branch.branch_name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{branch.location}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '12px', opacity: 0.7 }}>🕒 {branch.opening_hours || '9:00 AM - 6:00 PM'}</span>
                            {branch.status === 'Active' && (
                                <span style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '12px' }}>SELECT →</span>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="glass-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center' }}>
                        <p>No service centers are currently active.</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .op-50 { opacity: 0.6; grayscale: 1; }
            `}} />
        </div>
    );
}
