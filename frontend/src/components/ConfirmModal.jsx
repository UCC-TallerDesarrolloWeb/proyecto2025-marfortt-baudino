import React from 'react'

export default function ConfirmModal({ show, title = 'Confirmar acción', message = '', details = null, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm = () => {}, onCancel = () => {} }) {
  if (!show) return null
  return (
    <div className="modal-overlay show" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" onClick={(e)=>{ if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 id="confirmation-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p id="confirmation-message">{message}</p>
          {details && <div id="confirmation-details" className="confirmation-details">{details}</div>}
        </div>
        <div className="modal-footer">
          <button id="cancel-btn" className="btn secondary" onClick={onCancel}>{cancelText}</button>
          <button id="confirm-btn" className="btn danger" onClick={() => { onConfirm(); }}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
