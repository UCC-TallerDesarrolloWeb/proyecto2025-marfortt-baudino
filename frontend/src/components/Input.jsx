export default function Input({ label, id, error='', ...props }) {
  const aria = error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {}
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...aria} {...props} />
      {error && <div id={`${id}-error`} role="alert" className="auth-message error" style={{display:'block'}}>{error}</div>}
    </div>
  )
}

