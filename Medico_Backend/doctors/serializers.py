from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Doctor, DoctorSession
from users.models import User


class DoctorRegisterSerializer(serializers.Serializer):

    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    specialization = serializers.CharField(max_length=100)
    experience = serializers.IntegerField()
    bio = serializers.CharField()
    phone = serializers.CharField(max_length=15)
    education = serializers.JSONField()

    available_from = serializers.TimeField()
    available_to = serializers.TimeField()
    slot_duration = serializers.IntegerField()

    def create(self, validated_data):

        name = validated_data.pop("name")
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            name=name,
            email=email,
            password=password,
            role="DOCTOR"
        )

        doctor = Doctor.objects.create(
            user=user,
            **validated_data
        )

        return doctor


class DoctorLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
    )

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            email=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if user.role != "DOCTOR":
            raise serializers.ValidationError(
                "This account is not a doctor account."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }


class DoctorProfileSerializer(serializers.ModelSerializer):

    name = serializers.CharField(
        source="user.name",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "email",
            "specialization",
            "experience",
            "bio",
            "phone",
            "education",
        ]

class DoctorListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name")
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = Doctor
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "specialization",
            "experience",
            "bio",
            "education",
            "available_from",
            "available_to",
            "slot_duration",
        ]

class DoctorSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorSession
        fields = [
            "id",
            "doctor",
            "session_date",
            "start",
            "end",
            "duration",
        ]

        read_only_fields = [
            "id",
            "doctor",
            "session_date",
            "duration",
        ]

    def validate(self, attrs):
        start = attrs.get("start")
        end = attrs.get("end")

        if start and end and end <= start:
            raise serializers.ValidationError(
                "End time must be after start time."
            )

        return attrs

class DoctorSessionLogSerializer(serializers.Serializer):
    start = serializers.TimeField()
    end = serializers.TimeField()
    duration_seconds = serializers.IntegerField(min_value=0)