import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function EquipmentChart() {
  const [equipment, setEquipment] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedType, setSelectedType] = useState("All");
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [history, setHistory] = useState([]);

  // ✅ Get token from localStorage
  const token = localStorage.getItem("token");

  // ✅ Axios headers with JWT
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch equipment + summary + history
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get("http://127.0.0.1:8000/api/equipment/", authHeaders),
      axios.get("http://127.0.0.1:8000/api/summary/", authHeaders),
      axios.get("http://127.0.0.1:8000/api/history/", authHeaders),
    ])
      .then(([equipmentRes, summaryRes, historyRes]) => {
        setEquipment(equipmentRes.data);
        setFilteredEquipment(equipmentRes.data);
        setSummary(summaryRes.data);
        setHistory(historyRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("❌ Failed to load data from backend");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    if (selectedType === "All") {
      setFilteredEquipment(equipment);
    } else {
      setFilteredEquipment(equipment.filter(item => item.type === selectedType));
    }
  }, [selectedType, equipment]);

  // Averages
  const total = filteredEquipment.length;
  const avg = (arr, key) =>
    total ? arr.reduce((sum, i) => sum + Number(i[key]), 0) / total : 0;

  const avgFlowrate = avg(filteredEquipment, "flowrate");
  const avgPressure = avg(filteredEquipment, "pressure");
  const avgTemperature = avg(filteredEquipment, "temperature");

  // Chart Data
  const typeLabels = summary?.type_distribution?.map(item => item.type) || [];
  const typeCounts = summary?.type_distribution?.map(item => item.count) || [];

  const chartData = {
    labels: typeLabels,
    datasets: [
      {
        label: "Equipment Count",
        data: typeCounts,
        backgroundColor: "#6c5ce7",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  const equipmentTypes = ["All", ...new Set(equipment.map(e => e.type))];

  // ✅ Upload CSV from React with JWT
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadMsg("✅ CSV uploaded successfully!");
      fetchData(); // refresh everything including history
    } catch (err) {
      setUploadMsg("❌ Upload failed!");
    }
  };

  if (loading) return <h2 style={{ textAlign: "center" }}>⏳ Loading data...</h2>;
  if (error) return <h2 style={{ textAlign: "center", color: "red" }}>{error}</h2>;

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📊 Chemical Equipment Dashboard</h2>

      {/* CSV Upload */}
      <div style={uploadBox}>
        <h3>📤 Upload Equipment CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload} style={uploadBtn}>
          Upload
        </button>
        <p>{uploadMsg}</p>
      </div>

      {/* Cards */}
      <div style={cardContainer}>
        <Card title="Total Equipment" value={total} color="#6c5ce7" />
        <Card title="Avg Flowrate" value={avgFlowrate.toFixed(2)} color="#0984e3" />
        <Card title="Avg Pressure" value={avgPressure.toFixed(2)} color="#d63031" />
        <Card title="Avg Temperature" value={avgTemperature.toFixed(2)} color="#e17055" />
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Filter Equipment: </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={selectStyle}
        >
          {equipmentTypes.map(type => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div style={chartBox}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          Equipment Type Distribution
        </h3>
        <Bar data={chartData} options={options} />
      </div>

      {/* Equipment Table */}
      <h3 style={{ marginTop: "30px" }}>📋 Equipment List</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Flowrate</th>
            <th>Pressure</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipment.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.flowrate}</td>
              <td>{item.pressure}</td>
              <td>{item.temperature}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Upload History Table */}
      <h3 style={{ marginTop: "40px" }}>🕒 Upload History (Last 5)</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>ID</th>
            <th>File Name</th>
            <th>Total Records</th>
            <th>Uploaded At</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No upload history found
              </td>
            </tr>
          ) : (
            history.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.file_name}</td>
                <td>{item.total_records}</td>
                <td>{new Date(item.uploaded_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Card Component
function Card({ title, value, color }) {
  return (
    <div style={{ ...cardStyle, borderTop: `5px solid ${color}` }}>
      <h3>{title}</h3>
      <p style={{ fontSize: "22px", fontWeight: "bold", color }}>{value}</p>
    </div>
  );
}

// Styles (unchanged)
const containerStyle = { width: "92%", margin: "20px auto", fontFamily: "Arial, sans-serif" };
const titleStyle = { textAlign: "center", marginBottom: "20px" };
const uploadBox = { background: "#f8f9fa", padding: "15px", borderRadius: "10px", marginBottom: "20px" };
const uploadBtn = { marginLeft: "10px", padding: "6px 14px", borderRadius: "6px", border: "none", background: "#6c5ce7", color: "white", cursor: "pointer" };
const cardContainer = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "20px" };
const cardStyle = { padding: "15px", background: "#ffffff", borderRadius: "12px", textAlign: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" };
const selectStyle = { padding: "6px 12px", borderRadius: "6px", marginLeft: "10px" };
const chartBox = { background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px" };

export default EquipmentChart;
