import React from 'react';
import ConsultantApp from '../../ConsultantApp';

const ConsultantDashboard = ({ user, onLogout }) => {
    return <ConsultantApp user={user} onLogout={onLogout} />;
};

export default ConsultantDashboard;
