import React, { useEffect, useState } from 'react'

// Fallback local JSON si no hay API pública sin key
export default function QuotesWidget() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Intentar cargar desde /data/quotes.json (local)
    fetch('/data/quotes.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setItems)
      .catch(() => setError('No se pudieron cargar cotizaciones'))
  }, [])

  if (error) return <p className="muted">{error}</p>
  return (
    <div className="preview-grid">
      {items.map((q, i) => (
        <div key={i} className="preview-card" aria-label={`Cotización de ${q.nombre}`}>
          <img src={encodeURI(q.logo)} alt={q.alt} />
          <div className="preview-info">
            <h3>{q.nombre}</h3>
            <p>{q.descripcion}</p>
            <p><strong>Precio:</strong> {q.precio}</p>
            {q.fecha && <p className="muted">{q.fecha}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

