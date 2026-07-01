import React from 'react';

interface FocusableProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  // Decky-specific props accepted but ignored
  onCancelButton?: () => void;
  onOKButton?: () => void;
  focusClassName?: string;
  noFocusRing?: boolean;
}

export function Focusable({ children, onCancelButton, onOKButton, focusClassName, noFocusRing, style, onKeyDown, ...rest }: FocusableProps) {
  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape' && onCancelButton) onCancelButton();
    if (e.key === 'Enter' && onOKButton) onOKButton();
    onKeyDown?.(e);
  }

  return (
    <div
      tabIndex={0}
      {...rest}
      onKeyDown={handleKey}
      style={{ outline: 'none', ...style }}
    >
      {children}
    </div>
  );
}
