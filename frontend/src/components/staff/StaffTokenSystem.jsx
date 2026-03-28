import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../../api/api';
import { usePolling } from '../../hooks/usePolling';
import ScheduleList from './ScheduleList';
import TokenModule from './TokenModule';

export default function StaffTokenSystem({ staff, onToast, onNavigate }) {
    const [schedules, setSchedules] = useState([]);
    const [selectedSched, setSelectedSched] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calling, setCalling] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [finishedMap, setFinishedMap] = useState({});
    const [onlineBookingAlert, setOnlineBookingAlert] = useState(null);
    const prevBookedCountRef = useRef(null);
    const selfActionRef = useRef(false);

    const fetchTokens = useCallback(async (schedId, showLoading = false) => {
        if (!schedId) return;
        if (showLoading) setLoading(true);
        try {
            const res = await api.getTokens(schedId);
            const newTokens = res.data;

            // Detect online bookings: Booked count increased and WE didn't cause it
            const newBookedCount = newTokens.filter(t => t.status === 'Booked').length;
            if (prevBookedCountRef.current !== null && !selfActionRef.current) {
                const diff = newBookedCount - prevBookedCountRef.current;
                if (diff > 0) {
                    const latest = newTokens.filter(t => t.status === 'Booked').slice(-diff);
                    const tokenNums = latest.map(t => t.token_number).join(', ');
                    setOnlineBookingAlert(`🔔 New Online Booking! Token ${tokenNums} just booked by a user.`);
                    setTimeout(() => setOnlineBookingAlert(null), 6000);
                }
            }
            prevBookedCountRef.current = newBookedCount;
            selfActionRef.current = false;
            setTokens(newTokens);

            // Also update finishedMap for the current schedule
            const allDone = newTokens.length > 0 && newTokens.every(t => ['Completed', 'No-Show', 'Cancelled'].includes(t.status));
            setFinishedMap(prev => ({ ...prev, [schedId]: allDone }));
        } catch (err) {
            onToast('Failed to load tokens', 'error');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [onToast]);

    const fetchSchedules = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const res = await api.getStaffSchedules();

            // STRICT FILTERING: 
            // 1. Only today's (live) schedules
            // 2. Only this staff member's branch
            const filtered = res.data.filter(s => {
                const isToday = s.date === todayStr;
                const matchesBranch = !staff?.branch_name || s.branch_name === staff.branch_name;
                return isToday && matchesBranch;
            });

            // Build finished map for all filtered schedules
            const fMap = {};
            await Promise.all(filtered.map(async (s) => {
                try {
                    const tRes = await api.getTokens(s.schedule_id);
                    const tkns = tRes.data;
                    fMap[s.schedule_id] = tkns.length > 0 && tkns.every(t => ['Completed', 'No-Show', 'Cancelled'].includes(t.status));
                } catch (e) {
                    fMap[s.schedule_id] = false;
                }
            }));
            setFinishedMap(fMap);

            // Sort by start_time
            const sorted = filtered.sort((a, b) => {
                const timeA = a.start_time.split(':').map(Number);
                const timeB = b.start_time.split(':').map(Number);
                return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            });

            setSchedules(sorted);
        } catch (err) {
            onToast('Failed to load live branch schedules', 'error');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [onToast, staff]);

    // Fast polling for tokens (2s) only when a schedule is selected
    usePolling(() => {
        if (selectedSched && !calling && !processingId) {
            fetchTokens(selectedSched.schedule_id, false);
        }
    }, 2000);

    // Slower polling for schedules (10s)
    usePolling(() => {
        if (!selectedSched) fetchSchedules(false);
    }, 10000);

    useEffect(() => {
        fetchSchedules(true);
    }, [fetchSchedules]);

    const handleSelectSchedule = async (sched) => {
        setSelectedSched(sched);
        await fetchTokens(sched.schedule_id, true);
    };

    const handleBack = () => {
        setSelectedSched(null);
        setTokens([]);
        fetchSchedules(false);
    };

    const updateToken = async (tokenId, newStatus) => {
        setProcessingId(tokenId);
        selfActionRef.current = true; // we triggered this, don't alert
        try {
            await api.updateTokenStatus(tokenId, { status: newStatus });
            await fetchTokens(selectedSched.schedule_id);
            onToast(`Token marked as ${newStatus}`, 'success');
        } catch (err) {
            onToast('Failed to update token status', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const callNextToken = async () => {
        const currentServing = tokens.find(t => t.status === 'Serving');
        const nextBooked = tokens.find(t => t.status === 'Booked');

        setCalling(true);
        selfActionRef.current = true; // we triggered this
        try {
            if (currentServing) {
                await api.updateTokenStatus(currentServing.token_id, { status: 'Completed' });
            }
            if (nextBooked) {
                await api.updateTokenStatus(nextBooked.token_id, { status: 'Serving' });
                onToast(`Calling Token ${nextBooked.token_number}`, 'success');
            } else {
                onToast('No tokens waiting in queue.', 'info');
            }
            await fetchTokens(selectedSched.schedule_id);
        } catch (err) {
            onToast('Error during token transition', 'error');
        } finally {
            setCalling(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="module-view" style={{ width: '100%', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box' }}>
            {/* Header Area */}
            <div className="module-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-back" onClick={() => onNavigate('dashboard')}>
                        ← <span>Staff Home</span>
                    </button>
                    <h2 style={{ margin: 0, fontWeight: '950', fontSize: '1.8rem', color: '#ffffff', letterSpacing: '-1px' }}>Token Hub</h2>
                </div>
                {selectedSched && (
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="live-dot" style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%', boxShadow: '0 0 10px var(--secondary)' }}></span>
                        Live Mode: <span style={{ color: 'var(--secondary)' }}>Active</span>
                    </div>
                )}
            </div>

            {/* Online Booking Alert Banner */}
            {onlineBookingAlert && (
                <div style={{
                    marginBottom: '24px',
                    padding: '18px 28px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(79, 70, 229, 0.25))',
                    border: '1.5px solid rgba(37, 99, 235, 0.5)',
                    color: '#93c5fd',
                    fontWeight: '800',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    animation: 'slideInDown 0.4s ease',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)',
                }}>
                    <span>{onlineBookingAlert}</span>
                    <button onClick={() => setOnlineBookingAlert(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '20px', fontWeight: '900', lineHeight: 1 }}>×</button>
                </div>
            )}

            {selectedSched ? (
                <TokenModule
                    selectedSched={selectedSched}
                    tokens={tokens}
                    onUpdate={updateToken}
                    onCallNext={callNextToken}
                    onBack={handleBack}
                    calling={calling}
                    processingId={processingId}
                    readOnly={true}
                />
            ) : (
                <ScheduleList
                    schedules={schedules}
                    selectedSched={selectedSched}
                    onSelect={handleSelectSchedule}
                    branchName={staff.branch_name || 'Your Branch'}
                    finishedMap={finishedMap}
                />
            )}
        </div>
    );
}
