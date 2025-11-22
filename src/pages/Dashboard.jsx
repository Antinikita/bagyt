import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import ComplaintList from "../components/ComplaintList";
import ComplaintEditor from "../components/ComplaintEditor";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // функция для добавления новой жалобы
  const handleAddComplaint = () => {
    setSelectedComplaint({ id: null, complaint: "" }); // открываем форму пустой
  };

  const handleSaved = (newComplaint) => {
    // если была добавлена новая жалоба (id === null раньше), выбираем её
    setSelectedComplaint(newComplaint);
    setRefreshTrigger(prev => !prev); // обновляем список
  };

  return (
    <div className="dashboard-container">
      <Header />

      <div className="dashboard-body">
        <div className="left-side">
          <button className="add-button" onClick={handleAddComplaint}>
            Add a Complaint
          </button>
          <ComplaintList
            onSelect={setSelectedComplaint}
            refreshTrigger={refreshTrigger} // триггер обновления
          />
        </div>

        <div className="right-side">
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
