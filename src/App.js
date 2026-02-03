import React, { useState } from "react";
import axios from "axios";

function App() {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeChemical = async () => {
    setError("");
    setResult(null);

    if (!formula) {
      setError("Please enter a chemical formula.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/analyze/", {
        formula: formula,
      });
      setResult(response.data);
    } catch (err) {
      setError("Backend not responding or invalid formula.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🧪 Chemical Visualizer</h1>
      <p>Enter a chemical formula to analyze molecules.</p>

      <input
        type="text"
        placeholder="Example: H2O, CO2, NaCl"
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        style={styles.input}
      />

      <button onClick={analyzeChemical} style={styles.button}>
        Analyze Molecule
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <h3>🔬 Analysis Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "60px",
    fontFamily: "Arial",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "250px",
    marginRight: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "30px",
    textAlign: "left",
    display: "inline-block",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
};

export default App;
