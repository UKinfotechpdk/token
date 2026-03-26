import React from 'react';
import StaffApp from '../../StaffApp';

const StaffDashboard = ({ user, onLogout }) => {
    return <StaffApp user={user} onLogout={onLogout} />;
};

export default StaffDashboard;
