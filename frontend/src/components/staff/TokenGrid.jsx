import React from 'react';
import TokenCard from './TokenCard';

export default function TokenGrid({ tokens, onUpdate, processingId }) {
    if (tokens.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.3)', borderRadius: '24px', border: '2px dashed var(--slate-200)' }}>
                <p style={{ color: 'var(--slate-500)', fontSize: '15px' }}>No tokens found for the current filter.</p>
            </div>
        );
    }

    return (
        <div className="tokens-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
            animation: 'fadeIn 0.5s ease'
        }}>
            {tokens.map(token => (
                <TokenCard
                    key={token.token_id}
                    token={token}
                    onUpdate={onUpdate}
                    isProcessing={processingId === token.token_id}
                />
            ))}
        </div>
    );
}
