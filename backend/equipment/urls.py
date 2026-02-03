from django.urls import path
from .views import upload_csv, equipment_list, equipment_summary, upload_history, generate_pdf_report

urlpatterns = [
    path('upload/', upload_csv),
    path('equipment/', equipment_list),
    path('summary/', equipment_summary),
    path('history/', upload_history),
    path('report/pdf/', generate_pdf_report),
]
