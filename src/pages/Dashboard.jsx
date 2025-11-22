import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import ComplaintList from "../components/ComplaintList";
import ComplaintEditor from "../components/ComplaintEditor";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleAddComplaint = () => {
    setSelectedComplaint({ id: null, complaint: "" });
  };

  const handleSaved = (newComplaint) => {
    setSelectedComplaint(newComplaint);
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <div style={{ display: "flex", flex: 1 }}>
        <div
          style={{
            width: "300px",
            borderRight: "1px solid #ccc",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button onClick={handleAddComplaint}>Add a Complaint</button>
          <ComplaintList
            onSelect={setSelectedComplaint}
            refreshTrigger={refreshTrigger}
          />
        </div>

        <div style={{ flex: 1, padding: "10px" }}>
          {selectedComplaint && (
            <ComplaintEditor
              complaint={selectedComplaint}
              onSaved={handleSaved}
            />
          )}
        </div>
      </div>
    </div>
  );
}
