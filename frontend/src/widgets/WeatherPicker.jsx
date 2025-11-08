import React, { useEffect, useRef, useState } from 'react'

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default function WeatherPicker() {
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [marker, setMarker] = useState(null)
  const [state, setState] = useState({ loading: false, error: '', data: null })

  useEffect(() => {
    let map
    let cancelled = false
    loadLeaflet().then(L => {
      if (cancelled) return
      map = L.map(mapRef.current).setView([-31.4, -64.2], 5) // centro aproximado AR
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng
        if (marker) marker.remove()
        const m = L.marker([lat, lng]).addTo(map)
        setMarker(m)
        await fetchWeather(lat, lng)
      })
      setMapReady(true)
    }).catch(() => setState({ loading: false, error: 'No se pudo cargar el mapa', data: null }))
    return () => { cancelled = true; if (map) map.remove() }
  }, [])

  async function fetchWeather(lat, lon) {
    try {
      setState(s => ({ ...s, loading: true, error: '' }))
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&hourly=precipitation_probability,precipitation&timezone=auto`
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP')
      const json = await res.json()
      // Buscar índice de la hora actual en hourly.time
      const nowIsoHour = new Date().toISOString().slice(0,13)+':00'
      let idx = -1
      if (json.hourly?.time) idx = json.hourly.time.indexOf(nowIsoHour)
      const prob = idx>=0 && json.hourly?.precipitation_probability ? json.hourly.precipitation_probability[idx] : null
      const precip = idx>=0 && json.hourly?.precipitation ? json.hourly.precipitation[idx] : null
      const data = {
        temp: json.current?.temperature_2m,
        wind: json.current?.wind_speed_10m,
        rh: json.current?.relative_humidity_2m,
        prob, precip
      }
      setState({ loading: false, error: '', data })
    } catch (e) {
      setState({ loading: false, error: 'No se pudo obtener el clima', data: null })
    }
  }

  return (
    <div>
      <div style={{height: 280, borderRadius: 8, overflow:'hidden', border:'1px solid #ddd'}} ref={mapRef} aria-label="Mapa para seleccionar ubicación"></div>
      <div style={{marginTop:10}}>
        {state.loading && <p>Consultando clima…</p>}
        {state.error && <p className="muted">{state.error}</p>}
        {state.data && (
          <div>
            <p><strong>Temperatura:</strong> {state.data.temp != null ? `${state.data.temp}°C` : 'N/D'}</p>
            <p><strong>Viento:</strong> {state.data.wind != null ? `${state.data.wind} m/s` : 'N/D'}</p>
            <p><strong>Humedad:</strong> {state.data.rh != null ? `${state.data.rh}%` : 'N/D'}</p>
            <p><strong>Prob. lluvia (hora actual):</strong> {state.data.prob != null ? `${state.data.prob}%` : 'N/D'}</p>
            <p><strong>Precipitación (mm):</strong> {state.data.precip != null ? state.data.precip : 'N/D'}</p>
          </div>
        )}
        {!state.data && !state.loading && !state.error && <p className="muted">Hacé clic en el mapa para ver el clima.</p>}
      </div>
    </div>
  )
}

