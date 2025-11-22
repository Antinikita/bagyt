import { useEffect, useState } from "react";

export default function ComplaintList({ onSelect }) {
  const [complaints, setComplaints] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/complaints", {
        credentials: "include",
      });
      const data = await res.json();

      if (Array.isArray(data)) setComplaints(data);
      else if (Array.isArray(data.complaints)) setComplaints(data.complaints);
      else setComplaints([]);
    } catch (err) {
      console.error(err);
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;

    const res = await fetch(`http://localhost:8000/api/complaints/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setComplaints(complaints.filter((c) => c.id !== id));
    } else {
      alert("Failed to delete");
    }
  };

  return (
    <div className="complaints-list">
      {complaints.map((c) => (
        <div
          key={c.id}
          className="complaint-item"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
          onClick={() => onSelect(c)}
          onMouseEnter={() => setHoveredId(c.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <span>{c.complaint.slice(0, 60)}...</span>
          {hoveredId === c.id && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(c.id);
              }}
              style={{
                color: "red",
                fontWeight: "bold",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              ×
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
