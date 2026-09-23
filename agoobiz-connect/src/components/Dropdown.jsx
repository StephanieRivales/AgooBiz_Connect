import { useState, useRef, useEffect } from "react";

export default function Dropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="occasion-dropdown" ref={ref}>
      <button type="button" className="occasion-dropdown-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{value}</span>
        <span className={`occasion-dropdown-caret ${open ? "occasion-dropdown-caret-open" : ""}`}>▾</span>
      </button>
      {open && (
        <ul className="occasion-dropdown-menu">
          {options.map((opt) => (
            <li
              key={opt}
              className={`occasion-dropdown-item ${opt === value ? "occasion-dropdown-item-active" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}