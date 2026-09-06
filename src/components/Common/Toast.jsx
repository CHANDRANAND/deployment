import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return <div className="toast show">{toast}</div>;
}
