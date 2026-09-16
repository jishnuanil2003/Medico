from urllib import request

from django.shortcuts import render

# Create your views here.
from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentCreateSerializer, AppointmentSerializer
from doctors.models import Doctor


class AvailableSlotsView(APIView):
    """
    Returns available appointment slots for a doctor on a particular date.
    Already booked slots are removed.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, doctor_id):

        appointment_date = request.query_params.get("date")

        if not appointment_date:
            return Response(
                {"message": "Date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get doctor
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response(
                {"message": "Doctor not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Convert date
        try:
            selected_date = datetime.strptime(
                appointment_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"message": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate all slots
        slots = []

        current_time = doctor.available_from

        while current_time < doctor.available_to:

            slot_end = (
                datetime.combine(selected_date, current_time)
                + timedelta(minutes=doctor.slot_duration)
            ).time()

            # Don't create a slot that goes beyond doctor's availability
            if slot_end > doctor.available_to:
                break

            slots.append(current_time.strftime("%H:%M"))

            current_time = slot_end

        # Get already booked slots
        booked_slots = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=selected_date,
            status__in=["PENDING", "CONFIRMED"]
        ).values_list(
            "appointment_time",
            flat=True
        )

        booked_slots = {
            time.strftime("%H:%M")
            for time in booked_slots
        }

        # Remove booked slots
        available_slots = [
            slot
            for slot in slots
            if slot not in booked_slots
        ]

        return Response({
            "doctor": doctor.user.name,
            "date": appointment_date,
            "slot_duration": doctor.slot_duration,
            "available_slots": available_slots
        })

class BookAppointmentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AppointmentCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)

        appointment = serializer.save()

        response_serializer = AppointmentSerializer(
            appointment
        )

        return Response(
            {
                "message": "Appointment booked successfully.",
                "appointment": response_serializer.data
            },
            status=status.HTTP_201_CREATED
        )

class MyAppointmentsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        appointments = Appointment.objects.filter(
            patient=request.user
        ).select_related(
            "doctor",
            "doctor__user"
        )

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

class DoctorAppointmentsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "DOCTOR":
            return Response(
                {"message": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            doctor = request.user.doctor_profile
        except Doctor.DoesNotExist:
            return Response(
                {"message": "Doctor profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        appointments = Appointment.objects.filter(
            doctor=doctor
        ).select_related("patient")

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)

    def patch(self, request):

        if request.user.role != "DOCTOR":
            return Response(
            {"message": "Permission denied."},
            status=status.HTTP_403_FORBIDDEN
            )

        try:
            doctor = request.user.doctor_profile
        except Doctor.DoesNotExist:
            return Response(
            {"message": "Doctor profile not found."},
            status=status.HTTP_404_NOT_FOUND
            )

        appointment_id = request.data.get("appointment_id")
        new_status = request.data.get("status")

        if not appointment_id or not new_status:
            return Response(
            {
                "message": "Both 'appointment_id' and 'status' are required."
            },
            status=status.HTTP_400_BAD_REQUEST
            )

        try:
            appointment = Appointment.objects.get(
            id=appointment_id,
            doctor=doctor
            )
        except Appointment.DoesNotExist:
            return Response(
            {"message": "Appointment not found."},
            status=status.HTTP_404_NOT_FOUND
            )

        valid_statuses = dict(Appointment.STATUS_CHOICES)

        if new_status not in valid_statuses:
            return Response(
            {"message": "Invalid status value."},
            status=status.HTTP_400_BAD_REQUEST
            )

        allowed_transitions = {
        "PENDING": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["COMPLETED", "CANCELLED"],
        "CANCELLED": [],
        "COMPLETED": [],
        }

        if new_status not in allowed_transitions.get(appointment.status, []):
            return Response(
            {
                "message": (
                    f"Cannot change status from "
                    f"{appointment.status} to {new_status}."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

        appointment.status = new_status
        appointment.save(update_fields=["status"])

        serializer = AppointmentSerializer(appointment)

        return Response({
        "message": f"Appointment status updated to {new_status}.",
        "appointment": serializer.data
        })

class AdminAppointmentsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response(
                {"message": "Permission denied. Admin access required."},
                status=status.HTTP_403_FORBIDDEN
            )

        appointments = Appointment.objects.select_related(
            "doctor",
            "doctor__user",
            "patient"
        ).all()

        serializer = AppointmentSerializer(
            appointments,
            many=True
        )

        return Response(serializer.data)