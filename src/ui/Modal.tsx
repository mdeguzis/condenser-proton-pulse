import React from 'react';

interface ModalProps {
  children?: React.ReactNode;
  onCancel?: () => void;
  style?: React.CSSProperties;
}

export function Modal({ children, onCancel, style }: ModalProps) {
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onCancel?.();
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#0f1a28',
          border: '1px solid rgba(102,192,244,0.2)',
          borderRadius: 8,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}
