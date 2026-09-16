from datetime import date

from django.shortcuts import render
from django.db.models import Sum


# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated , AllowAny

from .serializers import (
    DoctorListSerializer,
    DoctorRegisterSerializer,
    DoctorLoginSerializer,
    DoctorProfileSerializer,
    DoctorSessionLogSerializer
)
from .models import Doctor, DoctorSession


class DoctorRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        serializer = DoctorRegisterSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        doctor = serializer.save()

        return Response(
            {
                "message": "Doctor registered successfully",
                "doctor": DoctorProfileSerializer(doctor).data
            },
            status=status.HTTP_201_CREATED
        )


class DoctorLoginView(APIView):

    def post(self, request):

        serializer = DoctorLoginSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)
        
        return Response(
            {
                "message": "Doctor login successful",
                "user": serializer.validated_data["user"],
                "tokens": serializer.validated_data["tokens"],
            },
            status=status.HTTP_200_OK
        )


class DoctorProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "DOCTOR":
            return Response(
                {
                    "message": "Only doctors can access this profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            doctor = request.user.doctor_profile

        except Doctor.DoesNotExist:
            return Response(
                {
                    "message": "Doctor profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DoctorProfileSerializer(doctor)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class DoctorListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        if request.user.role != "ADMIN":
            return Response(
                {"message": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )

        doctors = Doctor.objects.select_related("user").all()

        serializer = DoctorListSerializer(
            doctors,
            many=True
        )

        return Response(serializer.data)

class DoctorBySpecializationView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        specialization = request.query_params.get("specialization")

        doctors = Doctor.objects.filter(
            specialization__iexact=specialization
        )

        serializer = DoctorListSerializer(doctors, many=True)

        return Response(serializer.data)  

class DoctorSessionLogView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Only doctors can create sessions
        if request.user.role != "DOCTOR":
            return Response(
                {
                    "message": "Only doctors can create sessions."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DoctorSessionLogSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Get logged-in doctor's profile
        try:
            doctor = request.user.doctor_profile
        except Doctor.DoesNotExist:
            return Response(
                {
                    "message": "Doctor profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Convert seconds → minutes
        duration_seconds = data["duration_seconds"]
        duration_minutes = round(duration_seconds / 60)

        # Create today's session
        session = DoctorSession.objects.create(
            doctor=doctor,
            session_date=date.today(),
            start=data["start"],
            end=data["end"],
            duration=duration_minutes
        )

        return Response(
            {
                "message": "Doctor session saved successfully.",
                "session": {
                    "id": session.id,
                    "doctor": doctor.user.name,
                    "session_date": session.session_date,
                    "start": session.start,
                    "end": session.end,
                    "duration": session.duration,
                }
            },
            status=status.HTTP_201_CREATED
        )           


class DoctorSessionSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if not request.user.is_staff:
            return Response(
                {
                    "detail": "You do not have permission to view doctor sessions."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        queryset = DoctorSession.objects.all()

        # Optional date filter
        date_param = request.query_params.get("date")

        if date_param:
            session_date = parse_date(date_param)

            if not session_date:
                return Response(
                    {
                        "detail": "Invalid date format. Use YYYY-MM-DD."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = queryset.filter(
                session_date=session_date
            )

        sessions = (
            queryset
            .values(
                "doctor_id",
                "doctor__user__name"
            )
            .annotate(
                total_duration=Sum("duration")
            )
            .order_by("doctor__user__name")
        )

        result = []

        for session in sessions:

            total_minutes = session["total_duration"] or 0

            hours = total_minutes // 60
            minutes = total_minutes % 60

            result.append({
                "doctor_id": session["doctor_id"],
                "doctor_name": session["doctor__user__name"],
                "total_minutes": total_minutes,
                "total_time": f"{hours:02d}:{minutes:02d}:00",
            })

        return Response(result)
                                                 