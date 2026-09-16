from rest_framework import serializers
from doctors.models import Doctor
from users.models import User
from .models import Appointment

class AppointmentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment

        fields = [
            "doctor",
            "appointment_date",
            "appointment_time",
            "reason",
            "patient_name",
            "patient_phone",
            "patient_email",
        ]

        validators = []

    def validate(self, attrs):

        doctor = attrs["doctor"]
        appointment_date = attrs["appointment_date"]
        appointment_time = attrs["appointment_time"]

        # Check slot
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=["PENDING", "CONFIRMED"]
        ).exists():

            raise serializers.ValidationError({
                "appointment_time":
                    "This appointment slot is already booked. "
                    "Please select another time."
            })

        request = self.context["request"]

        # Registered patient
        if request.user.role != "ADMIN":

            # Don't allow patient to book for somebody else
            attrs["patient_name"] = request.user.name

            # If your User model has phone
            attrs["patient_phone"] = request.user.phone

            attrs["patient_email"] = request.user.email

        # Admin
        else:

            if not attrs.get("patient_name"):
                raise serializers.ValidationError({
                    "patient_name": "Patient name is required."
                })

            if not attrs.get("patient_phone"):
                raise serializers.ValidationError({
                    "patient_phone": "Patient phone number is required."
                })

        return attrs

    def create(self, validated_data):

        request = self.context["request"]

        if request.user.role == "ADMIN":

            # Admin-created appointment
            return Appointment.objects.create(
                patient=None,
                **validated_data
            )

        else:

            # Registered patient appointment
            return Appointment.objects.create(
                patient=request.user,
                **validated_data
            )

class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(
        source="doctor.user.name",
        read_only=True
    )

    doctor_specialization = serializers.CharField(
        source="doctor.specialization",
        read_only=True
    )

    patient_name = serializers.CharField(
        read_only=True
    )

    patient_phone = serializers.CharField(
        read_only=True
    )

    patient_email = serializers.EmailField(
        read_only=True
    )
    gender = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Appointment
        fields = [
            "id",
            "doctor",
            "doctor_name",
            "doctor_specialization",

            "patient",
            "patient_name",
            "patient_phone",
            "patient_email",
            "gender",

            "appointment_date",
            "appointment_time",

            "status",
            "reason",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "patient_name",
            "patient_phone",
            "patient_email",
            "gender",
            "doctor_name",
            "doctor_specialization",
            "status",
            "created_at",
        ]