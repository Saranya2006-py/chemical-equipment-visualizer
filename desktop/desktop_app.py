import sys
import requests
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QPushButton,
    QFileDialog, QTableWidget, QTableWidgetItem, QMessageBox,
    QLabel, QHBoxLayout, QGroupBox
)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure

API_UPLOAD_URL = "http://127.0.0.1:8000/api/upload/"
API_LIST_URL = "http://127.0.0.1:8000/api/equipment/"
API_SUMMARY_URL = "http://127.0.0.1:8000/api/summary/"
API_HISTORY_URL = "http://127.0.0.1:8000/api/history/"
API_PDF_URL = "http://127.0.0.1:8000/api/report/pdf/"


class EquipmentApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Desktop App")
        self.setGeometry(200, 100, 1000, 700)

        main_layout = QVBoxLayout()

        # ===== Buttons =====
        btn_layout = QHBoxLayout()

        self.upload_btn = QPushButton("📤 Upload CSV")
        self.upload_btn.clicked.connect(self.upload_csv)

        self.pdf_btn = QPushButton("📄 Download PDF Report")
        self.pdf_btn.clicked.connect(self.download_pdf)

        btn_layout.addWidget(self.upload_btn)
        btn_layout.addWidget(self.pdf_btn)

        main_layout.addLayout(btn_layout)

        # ===== Summary Section =====
        self.summary_box = QGroupBox("📊 Summary")
        summary_layout = QHBoxLayout()

        self.total_label = QLabel("Total: 0")
        self.flow_label = QLabel("Avg Flowrate: 0")
        self.pressure_label = QLabel("Avg Pressure: 0")
        self.temp_label = QLabel("Avg Temperature: 0")

        summary_layout.addWidget(self.total_label)
        summary_layout.addWidget(self.flow_label)
        summary_layout.addWidget(self.pressure_label)
        summary_layout.addWidget(self.temp_label)

        self.summary_box.setLayout(summary_layout)
        main_layout.addWidget(self.summary_box)

        # ===== Chart Section =====
        self.figure = Figure(figsize=(5, 3))
        self.canvas = FigureCanvas(self.figure)
        main_layout.addWidget(self.canvas)

        # ===== Table Section =====
        self.table = QTableWidget()
        main_layout.addWidget(self.table)

        # ===== History Section =====
        self.history_label = QLabel("🕒 Upload History (Last 5)")
        main_layout.addWidget(self.history_label)

        self.history_table = QTableWidget()
        main_layout.addWidget(self.history_table)

        self.setLayout(main_layout)

        # Load data on start
        self.load_all_data()

    # ================= Upload CSV =================
    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select CSV File", "", "CSV Files (*.csv)")

        if not file_path:
            return

        with open(file_path, "rb") as f:
            response = requests.post(API_UPLOAD_URL, files={"file": f})

        if response.status_code == 200:
            QMessageBox.information(self, "Success", "CSV Uploaded Successfully!")
            self.load_all_data()
        else:
            QMessageBox.critical(self, "Error", "Upload Failed!")

    # ================= Load All Data =================
    def load_all_data(self):
        self.load_equipment()
        self.load_summary()
        self.load_chart()
        self.load_history()

    # ================= Equipment Table =================
    def load_equipment(self):
        response = requests.get(API_LIST_URL)
        data = response.json()

        if not data:
            return

        columns = list(data[0].keys())
        self.table.setColumnCount(len(columns))
        self.table.setRowCount(len(data))
        self.table.setHorizontalHeaderLabels(columns)

        for row_idx, row in enumerate(data):
            for col_idx, col in enumerate(columns):
                self.table.setItem(row_idx, col_idx, QTableWidgetItem(str(row[col])))

    # ================= Summary =================
    def load_summary(self):
        response = requests.get(API_SUMMARY_URL)
        summary = response.json()

        self.total_label.setText(f"Total: {summary.get('total', 0)}")
        self.flow_label.setText(f"Avg Flowrate: {summary.get('avg_flowrate', 0):.2f}")
        self.pressure_label.setText(f"Avg Pressure: {summary.get('avg_pressure', 0):.2f}")
        self.temp_label.setText(f"Avg Temperature: {summary.get('avg_temperature', 0):.2f}")

    # ================= Chart =================
    def load_chart(self):
        response = requests.get(API_SUMMARY_URL)
        summary = response.json()

        types = [item["type"] for item in summary.get("type_distribution", [])]
        counts = [item["count"] for item in summary.get("type_distribution", [])]

        self.figure.clear()
        ax = self.figure.add_subplot(111)
        ax.bar(types, counts)
        ax.set_title("Equipment Type Distribution")
        ax.set_xlabel("Type")
        ax.set_ylabel("Count")

        self.canvas.draw()

    # ================= History =================
    def load_history(self):
        response = requests.get(API_HISTORY_URL)
        history = response.json()

        if not history:
            return

        columns = list(history[0].keys())
        self.history_table.setColumnCount(len(columns))
        self.history_table.setRowCount(len(history))
        self.history_table.setHorizontalHeaderLabels(columns)

        for row_idx, row in enumerate(history):
            for col_idx, col in enumerate(columns):
                self.history_table.setItem(row_idx, col_idx, QTableWidgetItem(str(row[col])))

    # ================= Download PDF =================
    def download_pdf(self):
        save_path, _ = QFileDialog.getSaveFileName(self, "Save PDF", "equipment_report.pdf", "PDF Files (*.pdf)")

        if not save_path:
            return

        response = requests.get(API_PDF_URL)

        if response.status_code == 200:
            with open(save_path, "wb") as f:
                f.write(response.content)
            QMessageBox.information(self, "Success", "PDF Report Downloaded!")
        else:
            QMessageBox.critical(self, "Error", "Failed to download PDF!")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EquipmentApp()
    window.show()
    sys.exit(app.exec_())
