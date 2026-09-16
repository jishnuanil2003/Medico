from django.urls import path
from .views import DoctorBySpecializationView, DoctorListView, DoctorLoginView, DoctorRegistrationView, DoctorProfileView, DoctorSessionLogView, DoctorSessionSummaryView

urlpatterns = [
    path("register/", DoctorRegistrationView.as_view(), name="doctor-register"),
    path("login/", DoctorLoginView.as_view(), name="doctor-login"),
    path("profile/", DoctorProfileView.as_view(), name="doctor-profile"),
    path("list/", DoctorListView.as_view(), name="doctor-list"),
    path("", DoctorBySpecializationView.as_view(), name="doctor-by-specialization"),
    path("session-log/", DoctorSessionLogView.as_view(),name="doctor-session-log"),
    path( "sessions/summary/", DoctorSessionSummaryView.as_view(), name="doctor-session-summary" ),
]