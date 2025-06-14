'use client';
import { useRef } from 'react';

interface RenderCounterProps {
  name: string;
  enabled?: boolean;
}

export const RenderCounter: React.FC<RenderCounterProps> = ({ name, enabled = true }) => {
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (enabled && process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${name} rendered ${renderCount.current} times`);
  }

  return enabled && process.env.NODE_ENV === 'development' ? (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      {name}: {renderCount.current}
    </div>
  ) : null;
}; 