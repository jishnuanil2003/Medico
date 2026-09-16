from django.db import models

# Create your models here.
from django.db import models
from users.models import User
from doctors.models import Doctor
from django.conf import settings


class Appointment(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("CONFIRMED", "Confirmed"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments"
    )

    patient_name = models.CharField(max_length=100,default="Patient Name")

    patient_phone = models.CharField(max_length=15, default="Patient Phone")

    patient_email = models.EmailField(
        blank=True,
        null=True
    )
    gender = models.CharField(
        max_length=10,
        default="Unknown"
    )
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    appointment_date = models.DateField()

    appointment_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    reason = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "appointment_date",
                    "appointment_time"
                ],
                name="unique_doctor_appointment_slot"
            )
        ]

    def __str__(self):
        return f"{self.patient_name} - {self.doctor.user.name}"