from django.db import models
from users.models import User
import datetime

# Create your models here.
class Doctor(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="doctor_profile"
    )
    specialization = models.CharField(max_length=100)
    experience = models.PositiveIntegerField()
    bio = models.TextField()
    phone = models.CharField(max_length=15, unique=True)

    education = models.JSONField(default=list)
    available_from = models.TimeField(default="08:00")
    available_to = models.TimeField(default="10:00")

    slot_duration = models.PositiveIntegerField(default=15)

    def __str__(self):
        return f"Dr. {self.user.name}"


class DoctorSession(models.Model):
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name="sessions"
    )

    session_date = models.DateField(
        default=datetime.date.today
    )

    start = models.TimeField()

    end = models.TimeField()

    # Working duration in minutes
    duration = models.PositiveIntegerField(
        default=15
    )

    class Meta:
        ordering = ["-session_date", "-start"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "session_date",
                    "start",
                    "end",
                    "duration",
                ],
                name="unique_doctor_session_slot",
            )
        ]

    def __str__(self):
        return (
            f"Dr. {self.doctor.user.name} - "
            f"{self.session_date} - "
            f"{self.start} to {self.end}"
        )
