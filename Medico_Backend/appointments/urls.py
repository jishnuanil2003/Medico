from django.urls import path

from .views import (
    AvailableSlotsView,
    BookAppointmentView,
    MyAppointmentsView,
    DoctorAppointmentsView,
    AdminAppointmentsView
)

urlpatterns = [
    path(
        "doctors/<int:doctor_id>/slots/",
        AvailableSlotsView.as_view(),
        name="available-slots"
    ),

    path(
        "book/",
        BookAppointmentView.as_view(),
        name="book-appointment"
    ),

    path(
        "my/",
        MyAppointmentsView.as_view(),
        name="my-appointments"
    ),

    path(
        "doctor/",
        DoctorAppointmentsView.as_view(),
        name="doctor-appointments"
    ),

    path(
        "admin/",
        AdminAppointmentsView.as_view(),
        name="admin-appointments"
    ),
]