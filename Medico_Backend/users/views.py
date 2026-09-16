from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer , LoginSerializer
from rest_framework.permissions import IsAuthenticated

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
    {
        "message": "User registered successfully",
        "user": serializer.data,
    },
    status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            {
                "message": "Login successful",
                "user": serializer.validated_data["user"],
                "tokens": serializer.validated_data["tokens"],
            },
            status=status.HTTP_200_OK,
        )

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "age": user.age,
                "gender": user.gender,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )
