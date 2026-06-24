export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tabs">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          className={activeTab === key ? "active" : ""}
          onClick={() => onTabChange(key)}
          type="button"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
