import React, { useEffect, useState } from 'react'

export default function WeatherWidget() {
  const [state, setState] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: 'Geolocalización no disponible', data: null })
      return
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Error al consultar clima')
        const json = await res.json()
        setState({ loading: false, error: '', data: { temp: json.current?.temperature_2m, code: json.current?.weather_code } })
      } catch (e) {
        setState({ loading: false, error: 'No se pudo obtener el clima', data: null })
      }
    }, () => setState({ loading: false, error: 'No se pudo obtener ubicación', data: null }))
  }, [])

  if (state.loading) return <p>Obteniendo clima…</p>
  if (state.error) return <p className="muted">{state.error}</p>
  const { temp } = state.data || {}
  return <p><strong>Clima actual:</strong> {temp != null ? `${temp}°C` : 'N/D'}</p>
}

