import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export function TabBar() {
  const { sheets, activeSheetId, setActiveSheetId, addSheet, removeSheet } = useApp();

  return (
    <div className="tabbar-row">
      <div className="tabbar">
        {sheets.map((sheet, index) => {
          const isActive = sheet.id === activeSheetId;
          const label = sheet.patient.name ? sheet.patient.name : `Patient ${index + 1}`;
          return (
            <div
              key={sheet.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSheetId(sheet.id)}
            >
              <span className="tab-title">{label}</span>
              {sheets.length > 1 && (
                <button
                  className="tab-close"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSheet(sheet.id);
                  }}
                  title="Close tab"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button className="tab-add" type="button" onClick={addSheet} title="New patient report">
          +
        </button>
      </div>
    </div>
  );
}
