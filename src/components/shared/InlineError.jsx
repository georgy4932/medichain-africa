 export default function InlineError({ message }) {
  if (!message) return null

  return (
    <div
      className="alert-banner alert-banner-error"
      role="alert"
    >
      <div className="alert-icon">
        !
      </div>

      <div className="alert-message">
        {message}
      </div>
    </div>
  )
}
