from rest_framework import generics, status
from rest_framework.response import Response
from .models import Building, LightningRod
from rest_framework import viewsets  # Import viewsets for LightningRodViewSet

from .serializers import BuildingSerializer, LightningRodSerializer

# List and create buildings
class BuildingListCreateAPIView(generics.ListCreateAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

# Retrieve, update, and delete a building
class BuildingRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

# Lightning Rod ViewSet
class LightningRodViewSet(viewsets.ModelViewSet):  

    queryset = LightningRod.objects.all()
    serializer_class = LightningRodSerializer

# Create a new building
class BuildingInputView(generics.CreateAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
