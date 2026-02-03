import pandas as pd
from io import BytesIO
from reportlab.pdfgen import canvas

from django.http import HttpResponse
from django.db.models import Avg, Count

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Equipment, UploadHistory


def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0


# ============================
# ✅ STEP 1 — CSV Upload API
# ============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_csv(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        df = pd.read_csv(file)
        df.columns = df.columns.str.strip().str.lower()
    except Exception as e:
        return Response({"error": f"Invalid CSV file: {str(e)}"}, status=400)

    total_rows = len(df)

    # Save Upload History
    UploadHistory.objects.create(
        file_name=file.name,
        total_records=total_rows
    )

    # Keep only last 5 uploads
    history_count = UploadHistory.objects.count()
    if history_count > 5:
        oldest = UploadHistory.objects.all().order_by('uploaded_at')[:history_count-5]
        oldest.delete()

    # Clear existing equipment and bulk insert new
    Equipment.objects.all().delete()
    equipment_objects = []
    for _, row in df.iterrows():
        equipment_objects.append(
            Equipment(
                name=str(row.get("name", "Unknown")),
                type=str(row.get("type", "Unknown")),
                flowrate=safe_float(row.get("flowrate")),
                pressure=safe_float(row.get("pressure")),
                temperature=safe_float(row.get("temperature")),
            )
        )
    Equipment.objects.bulk_create(equipment_objects)

    return Response({
        "message": "CSV uploaded successfully",
        "total_records": total_rows
    })


# ============================
# ✅ STEP 2 — Equipment List API
# ============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def equipment_list(request):
    data = list(Equipment.objects.values())
    return Response(data)


# ============================
# ✅ STEP 3 — Summary API
# ============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def equipment_summary(request):
    summary = Equipment.objects.aggregate(
        total=Count('id'),
        avg_flowrate=Avg('flowrate'),
        avg_pressure=Avg('pressure'),
        avg_temperature=Avg('temperature'),
    )

    type_distribution = (
        Equipment.objects.values('type')
        .annotate(count=Count('id'))
        .order_by('type')
    )

    return Response({
        "total": summary["total"],
        "avg_flowrate": summary["avg_flowrate"] or 0,
        "avg_pressure": summary["avg_pressure"] or 0,
        "avg_temperature": summary["avg_temperature"] or 0,
        "type_distribution": list(type_distribution)
    })


# ============================
# ✅ STEP 4 — Upload History API
# ============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upload_history(request):
    history = UploadHistory.objects.all().order_by('-uploaded_at')[:5]  # last 5 only
    return Response(list(history.values()))


# ============================
# ✅ STEP 5 — PDF Report API
# ============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_pdf_report(request):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(150, 800, "Chemical Equipment Report")

    summary = Equipment.objects.aggregate(
        total=Count('id'),
        avg_flowrate=Avg('flowrate'),
        avg_pressure=Avg('pressure'),
        avg_temperature=Avg('temperature'),
    )

    y = 760
    pdf.setFont("Helvetica", 12)

    pdf.drawString(50, y, f"Total Equipment: {summary['total']}")
    y -= 20
    pdf.drawString(50, y, f"Average Flowrate: {summary['avg_flowrate'] or 0:.2f}")
    y -= 20
    pdf.drawString(50, y, f"Average Pressure: {summary['avg_pressure'] or 0:.2f}")
    y -= 20
    pdf.drawString(50, y, f"Average Temperature: {summary['avg_temperature'] or 0:.2f}")
    y -= 40

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "Name")
    pdf.drawString(150, y, "Type")
    pdf.drawString(260, y, "Flowrate")
    pdf.drawString(350, y, "Pressure")
    pdf.drawString(450, y, "Temperature")
    y -= 20

    pdf.setFont("Helvetica", 11)

    for eq in Equipment.objects.all():
        if y < 50:
            pdf.showPage()
            y = 800

        pdf.drawString(50, y, eq.name)
        pdf.drawString(150, y, eq.type)
        pdf.drawString(260, y, str(eq.flowrate))
        pdf.drawString(350, y, str(eq.pressure))
        pdf.drawString(450, y, str(eq.temperature))
        y -= 15

    pdf.save()
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')
