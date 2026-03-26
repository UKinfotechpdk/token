import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role, user }) => {
    const location = useLocation();

    // Determine storage keys based on target role
    const targetRole = role?.toLowerCase();
    const effectiveTargetRole = targetRole === 'customer' ? 'user' : targetRole;
    
    const userKey = effectiveTargetRole ? `${effectiveTargetRole}_user` : 'user';
    const tokenKey = effectiveTargetRole ? `${effectiveTargetRole}_token` : 'token';

    // Use prop or fallback to role-specific localStorage
    const authUser = user || JSON.parse(localStorage.getItem(userKey));
    const authToken = localStorage.getItem(tokenKey);

    if (!authUser || !authToken) {
        const loginPath = effectiveTargetRole ? `/${effectiveTargetRole}/login` : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Normalize roles
    const userRole = (authUser.role || "").toLowerCase();

    // Handle 'customer' vs 'user' naming mismatch
    const effectiveRole = userRole === 'customer' ? 'user' : userRole;

    if (targetRole && effectiveRole !== targetRole && effectiveRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
