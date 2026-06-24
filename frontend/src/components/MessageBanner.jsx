export default function MessageBanner({ error, notice }) {
  return (
    <>
      {error && <p className="message error">{error}</p>}
      {notice && <p className="message success">{notice}</p>}
    </>
  );
}
