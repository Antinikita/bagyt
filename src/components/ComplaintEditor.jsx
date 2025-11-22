import { useState, useEffect } from "react";

export default function ComplaintEditor({ complaint, onSaved }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (complaint) setText(complaint.complaint);
  }, [complaint]);

  if (!complaint) return <div>Select a complaint...</div>;

  const handleSave = async () => {
    const method = complaint.id ? "PUT" : "POST";
    const url = complaint.id
      ? `http://localhost:8000/api/complaints/${complaint.id}`
      : `http://localhost:8000/api/complaints`;

    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint: text }),
    });

    const data = await res.json();
    if (res.ok) {
      onSaved(data.complaint);
    } else {
      alert("Save failed");
    }
  };

  return (
    <div>
      <h3>{complaint.id ? `Complaint #${complaint.id}` : "New Complaint"}</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: "100%" }}
      />
      <button onClick={handleSave} style={{ marginTop: "10px" }}>
        Save
      </button>
    </div>
  );
}
