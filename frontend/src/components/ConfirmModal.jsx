import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger', icon = '⚠️' }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || 'Confirm Action'}
            icon={icon}
            maxWidth="400px"
        >
            <div className="confirm-alert-content">
                <div className="confirm-alert-icon" style={{
                    background: type === 'danger' ? '#fff1f2' : '#f0fdf4',
                    color: type === 'danger' ? '#ef4444' : '#10b981'
                }}>
                    {icon}
                </div>

                <h3 className="confirm-alert-title">{title || 'Confirm Action'}</h3>

                <p className="confirm-alert-message">
                    {message || 'Are you sure you want to proceed with this action?'}
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ flex: 1, padding: '14px' }}
                    >
                        Cancel
                    </button>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: type === 'danger' ? '#ef4444' : '#10b981'
                        }}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
