import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getPublicBranches,
    getPublicSchedules,
    getPublicTokenStatus,
    bookToken
} from '../../api/api';
import { usePolling } from '../../hooks/usePolling';

// Components
import KioskHeader from '../../components/kiosk/KioskHeader';
import BranchSelector from '../../components/kiosk/BranchSelector';
import ScheduleSelector from '../../components/kiosk/ScheduleSelector';
import BookingDetails from '../../components/kiosk/BookingDetails';
import PaymentModule from '../../components/kiosk/PaymentModule';
import TokenCard from '../../components/kiosk/TokenCard';

export default function KioskBookingFlow() {
    const navigate = useNavigate();
    const [step, setStep] = useState('branch'); // branch, schedule, booking, payment, success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokenAlert, setTokenAlert] = useState(null); // Real-time token availability warning

    // Data State
    const [branches, setBranches] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [queueData, setQueueData] = useState({}); // { schedule_id: { waiting, serving } }

    // Selection State
    const [selection, setSelection] = useState({
        branch: null,
        schedule: null
    });

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        contact: '',
        reason: '',
        paymentMethod: 'UPI'
    });

    const [bookedToken, setBookedToken] = useState(null);

    // Track available tokens for the selected schedule
    const prevAvailableRef = useRef(null);

    // Initial Load
    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const res = await getPublicBranches();
            setBranches(res.data);
        } catch (err) {
            setError('Failed to load branches.');
        } finally {
            setLoading(false);
        }
    };

    const loadSchedules = async (branchId) => {
        try {
            setLoading(true);
            const res = await getPublicSchedules(branchId);
            setSchedules(res.data);

            // Initial queue data fetch
            res.data.forEach(s => fetchQueueStatus(s.schedule_id));
        } catch (err) {
            setError('Failed to load services.');
        } finally {
            setLoading(false);
        }
    };

    // Silent refresh the schedules list (used during booking/payment)
    const silentRefreshSchedules = async () => {
        if (!selection.branch) return;
        try {
            const res = await getPublicSchedules(selection.branch.branch_id);
            const updatedSchedules = res.data;
            setSchedules(updatedSchedules);

            // Check if selected schedule's token count changed
            if (selection.schedule) {
                const updated = updatedSchedules.find(s => s.schedule_id === selection.schedule.schedule_id);
                const newCount = updated ? updated.available_tokens : 0;
                const oldCount = prevAvailableRef.current;

                if (oldCount !== null && newCount !== oldCount) {
                    if (newCount === 0) {
                        setTokenAlert({ type: 'error', message: '⚠️ This session is now fully booked! Please go back and choose another slot.' });
                    } else if (newCount < oldCount) {
                        setTokenAlert({ type: 'warning', message: `🔄 Token Update: ${newCount} slot${newCount !== 1 ? 's' : ''} remaining. Please proceed quickly!` });
                    }
                }
                prevAvailableRef.current = newCount;

                // Update the selected schedule object too so the form stays in sync
                if (updated) {
                    setSelection(prev => ({ ...prev, schedule: { ...prev.schedule, available_tokens: updated.available_tokens } }));
                }
            }
        } catch (e) { /* silent */ }
    };

    const fetchQueueStatus = async (scheduleId) => {
        try {
            const res = await getPublicTokenStatus(scheduleId);
            setQueueData(prev => ({ ...prev, [scheduleId]: res.data }));
        } catch (e) { }
    };

    // Global Polling
    usePolling(() => {
        if (step === 'schedule' && selection.branch) {
            schedules.forEach(s => fetchQueueStatus(s.schedule_id));
        }
        if ((step === 'booking' || step === 'payment') && selection.branch) {
            // LIVE sync: refresh schedules + queue data during form fill
            silentRefreshSchedules();
            if (selection.schedule) fetchQueueStatus(selection.schedule.schedule_id);
        }
    }, 5000);

    const handleBranchSelect = (branch) => {
        setSelection(prev => ({ ...prev, branch }));
        loadSchedules(branch.branch_id);
        setStep('schedule');
    };

    const handleScheduleSelect = (schedule) => {
        setSelection(prev => ({ ...prev, schedule }));
        setTokenAlert(null); // Clear any previous alert
        prevAvailableRef.current = schedule.available_tokens; // Baseline for change detection
        setStep('booking');
    };

    const handleBookingSubmit = async () => {
        try {
            setLoading(true);
            const res = await bookToken({
                schedule_id: selection.schedule.schedule_id,
                customer_name: formData.name,
                customer_age: formData.age,
                customer_gender: formData.gender,
                contact: formData.contact,
                reason: formData.reason,
                payment_method: formData.paymentMethod,
                time_slot: selection.schedule.available_slots?.[0] || 'ASAP'
            });
            setBookedToken(res.data);
            setStep('success');

            // Audio Feedback
            try { new Audio('/success_chime.mp3').play(); } catch (e) { }
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (step === 'schedule') setStep('branch');
        else if (step === 'booking') setStep('schedule');
        else if (step === 'payment') setStep('booking');
        else if (step === 'success') navigate('/user/dashboard');
    };

    const renderContent = () => {
        switch (step) {
            case 'branch':
                return <BranchSelector branches={branches} onSelect={handleBranchSelect} loading={loading} />;
            case 'schedule':
                return <ScheduleSelector schedules={schedules} onSelect={handleScheduleSelect} loading={loading} queueData={queueData} />;
            case 'booking':
                return (
                    <BookingDetails
                        formData={formData}
                        onUpdate={(u) => setFormData(prev => ({ ...prev, ...u }))}
                        onNext={() => setStep('payment')}
                        onCancel={() => setStep('schedule')}
                        queueStatus={queueData[selection.schedule?.schedule_id]}
                    />
                );
            case 'payment':
                return (
                    <PaymentModule
                        formData={formData}
                        onUpdate={(u) => setFormData(prev => ({ ...prev, ...u }))}
                        onConfirm={handleBookingSubmit}
                        onBack={() => setStep('booking')}
                        schedule={selection.schedule}
                        loading={loading}
                    />
                );
            case 'success':
                return <TokenCard token={bookedToken} schedule={selection.schedule} branch={selection.branch} onDone={() => navigate('/user/dashboard')} />;
            default:
                return null;
        }
    };

    return (
        <div className="kiosk-flow-page" style={{ padding: '40px 20px', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
            <KioskHeader currentStep={step} onBack={goBack} canGoBack={step !== 'branch' && step !== 'success'} />

            {error && (
                <div className="form-error" style={{ marginBottom: '32px' }}>
                    ⚠️ {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800' }}>×</button>
                </div>
            )}

            {tokenAlert && (
                <div style={{
                    marginBottom: '16px',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    animation: 'fadeIn 0.4s ease',
                    background: tokenAlert.type === 'error' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${tokenAlert.type === 'error' ? '#fca5a5' : '#fcd34d'}`,
                    color: tokenAlert.type === 'error' ? '#dc2626' : '#92400e'
                }}>
                    <span>{tokenAlert.message}</span>
                    <button onClick={() => setTokenAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '18px', lineHeight: 1, color: 'inherit' }}>×</button>
                </div>
            )}

            <div className="flow-content" style={{ marginTop: '20px' }}>
                {renderContent()}
            </div>

            <style>{`
                @media (max-width: 600px) {
                    .kiosk-flow-page {
                        padding: 20px 12px !important;
                    }
                    .flow-content {
                        margin-top: 10px !important;
                    }
                }
            `}</style>
        </div>
    );
}
