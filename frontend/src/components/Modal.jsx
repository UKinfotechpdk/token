import React from 'react';

export default function Modal({ isOpen, onClose, title, icon, children, maxWidth = '580px', headerAction = null }) {
    if (!isOpen) return null;

    return (
        <div className="module-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="module-panel" style={{ '--modal-max-width': maxWidth }}>
                <div className="module-panel-header">
                    <h2>{icon && <span style={{ fontSize: '24px' }}>{icon}</span>} {title}</h2>
                    <div className="modal-header-actions">
                        {headerAction}
                        <button className="modal-close" onClick={onClose} title="Close">✕</button>
                    </div>
                </div>
                <div className="module-panel-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
