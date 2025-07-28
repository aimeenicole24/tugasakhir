from rest_framework import serializers
from .models import Building, LightningRod, Project
from .management.commands.lightning_protection_calculation import calculate_protection_radius, calculate_lightning_rod_count, get_protection_radius_and_mesh
from django.contrib.auth.models import User
from django.contrib.auth import authenticate  # Pastikan ini ada


# =======================================================
# 1️⃣ Login Serializer
# =======================================================
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

    def validate(self, data):
        # Menambahkan logika validasi, seperti memeriksa apakah username dan password cocok
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user  # Menyimpan objek user agar bisa diakses nanti
        return data

# =======================================================
# 2️⃣ Signup Serializer
# =======================================================
class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']

    def create(self, validated_data):
        # Tambahkan validasi jika perlu, seperti memeriksa kekuatan password
        password = validated_data.get('password')
        if len(password) < 8:  # Contoh validasi panjang password
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        user = User.objects.create_user(**validated_data)
        return user


# =======================================================
# 3️⃣ Building Serializer
# =======================================================
class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = [
            'id', 
            'location', 
            'total_length', 
            'main_length', 
            'eastwing_length', 
            'total_width', 
            'main_height', 
            'eastwing_height', 
            'total_height', 
            'building_type',
            'protection_level',  # Protection level field
            'protection_radius',  # Protection radius field
            'number_of_lightning_rods',  # Number of lightning rods
        ]

    def create(self, validated_data):
        """
        Create method for BuildingSerializer.
        This method will calculate protection radius and number of lightning rods.
        """
        # Extract values from validated data
        protection_level = validated_data.get('protection_level', 'III')  # Default to 'III' if not provided
        total_height = validated_data.get('total_height')
        total_length = validated_data.get('total_length')
        total_width = validated_data.get('total_width')

        # Calculate protection radius and mesh distance based on total height and protection level
        protection_radius, mesh_distance = get_protection_radius_and_mesh(total_height, protection_level)

        # Calculate the number of lightning rods based on the building size
        number_of_lightning_rods = calculate_lightning_rod_count(total_length, total_width, total_height)

        # Update validated data with calculated fields
        validated_data['protection_radius'] = protection_radius
        validated_data['number_of_lightning_rods'] = number_of_lightning_rods

        # Call parent create method to save building
        return super().create(validated_data)

# =======================================================
# 4️⃣ LightningRod Serializer
# =======================================================
class LightningRodSerializer(serializers.ModelSerializer):
    class Meta:
        model = LightningRod
        fields = ['id', 'building', 'position_x', 'position_y', 'distance', 'protection_level']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'location']

class DashboardSerializer(serializers.Serializer):
    user = serializers.CharField(max_length=255)
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    simulations = serializers.IntegerField()
    calculations = serializers.IntegerField()
    active_project = serializers.DictField()
    quick_actions = serializers.ListField(child=serializers.DictField())
    projects = ProjectSerializer(many=True)  # Serialize list of projects