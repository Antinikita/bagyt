import { useEffect, useState } from "react";

export default function ComplaintList({ onSelect, refreshTrigger }) {
  const [complaints, setComplaints] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/complaints", {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data.complaints)) setComplaints(data.complaints);
      else setComplaints([]);
    } catch (err) {
      console.error(err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;

    const res = await fetch(`http://localhost:8000/api/complaints/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert("Failed to delete");
    }
  };

  return (
    <div>
      {complaints.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "5px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={() => onSelect(c)}
          onMouseEnter={() => setHoveredId(c.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span>{c.complaint.slice(0, 60)}</span>
          {hoveredId === c.id && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(c.id);
              }}
              style={{ color: "red", cursor: "pointer", fontWeight: "bold" }}
            >
              ×
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
