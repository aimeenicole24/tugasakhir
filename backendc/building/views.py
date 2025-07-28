import math
import logging
import json
from django.shortcuts import render, get_object_or_404
from django.views import View
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import BuildingForm, LightningRodForm
from .models import Building, LightningRod, MainFeature
from .models import Project
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpResponseForbidden
from django.views.generic import TemplateView
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import AuthenticationFailed
from .serializers import LoginSerializer
from .serializers import SignupSerializer
from .serializers import DashboardSerializer, ProjectSerializer, BuildingSerializer

# Configure logging
logging.basicConfig(level=logging.INFO)

class BuildingInputView(View):  
    def get(self, request): 
        form = BuildingForm()
        return render(request, 'building/add_building.html', {'form': form})

    def post(self, request):
        form = BuildingForm(request.POST)
        if form.is_valid():
            building = form.save(commit=False)
            building.save()  # Save the building instance

            # Automatically determine the protection level based on building characteristics
            protection_level = self.infer_protection_level(building)
            
            # Calculate Protection Radius and Number of Lightning Rods
            protection_radius = self.calculate_protection_radius(building.total_height)
            number_of_rods = self.calculate_number_of_rods(building.total_length, building.total_width, building.total_height)
            rods_placement = self.calculate_rod_placement(protection_radius, 10)  # Assuming mesh distance of 10
            
            # Get Arrester Installation based on building type
            arrester_data = self.get_arrester_installation(building.building_type)

            # Automatically calculate position, distance, and protection level
            position_x, position_y, distance = self.calculate_position_and_distance(building)

            # Calculate Risk Index based on updated model
            risk_index = building.calculate_risk_index()

            # Calculate Level of Damage based on Risk Index and Protection Level
            level_of_damage = self.calculate_level_of_damage(risk_index, building.protection_level)

             # Get Protection Recommendations based on Risk Index and Level of Damage
            protection_recommendations = self.get_protection_recommendations(risk_index, level_of_damage)

            # Get SPP Recomendations
            spp_cable = building.get_spp_cable_recommendation()

            # Return calculated results to the page
            return render(request, 'building/add_building.html', {
                'form': form,
                'protection_radius': protection_radius,
                'number_of_lightning_rods': number_of_rods,
                'rods_placement': rods_placement,
                'position_x': position_x,
                'position_y': position_y,
                'distance': distance,
                'protection_level': protection_level,  
                'risk_index': risk_index, 
                'level_of_damage': level_of_damage,  
                'protection_recommendations': protection_recommendations, 
                'arrester_data': arrester_data,
                'spp_cable': spp_cable
            })
        else:
            return render(request, 'building/add_building.html', {'form': form})
    
    def calculate_level_of_damage(self, risk_index, protection_level):
        """
        Menghitung level kerusakan berdasarkan Risk Index dan Protection Level.
    
        Args:
        risk_index (int): Nilai Risk Index bangunan (hasil perhitungan dari A + B + C + D + E).
        protection_level (int): Level perlindungan yang dimiliki bangunan (Level I, II, III, IV).
    
        Returns:
        string: Level kerusakan (High, Medium, Low, Safe).
        """
        # Perlindungan Level 1 (Level I: Rendah)
        if protection_level == 1:
           if risk_index >= 150:  # Skala lebih tinggi
              return 'High'
           elif 100 <= risk_index < 150:
              return 'Medium'
           elif 50 <= risk_index < 100:
              return 'Low'
           else:
              return 'Safe'

        # Perlindungan Level 2 (Level II: Sedang)
        elif protection_level == 2:
            if risk_index >= 120:
                return 'High'
            elif 80 <= risk_index < 120:
                return 'Medium'
            elif 40 <= risk_index < 80:
                return 'Low'
            else:
                return 'Safe'

        # Perlindungan Level 3 (Level III: Tinggi)
        elif protection_level == 3:
            if risk_index >= 100:
                return 'Medium'
            elif 50 <= risk_index < 100:
                return 'Low'
            else:
                return 'Safe'

        # Perlindungan Level 4 (Level IV: Sangat Tinggi)
        elif protection_level == 4:
            if risk_index >= 50:
                return 'Low'
            else:
                return 'Safe'

        return 'Safe'  # Default jika tidak memenuhi kondisi lainnya
            
    def infer_protection_level(self, building):
        """Infer protection level based on the building characteristics (e.g., building type, location, height)."""
        if building.building_type == 'education':
            return '2'  # Level II
        elif building.building_type == 'public':
            return '2'  # Level II
        elif building.building_type == 'commercial':
            return '3'  # Level III
        elif building.building_type == 'hospital':
            return '3'  # Level III
        elif building.building_type == 'religious':
            return '1'  # Level I
        elif building.building_type == 'industrial':
            if building.total_height > 45:
                return '4'  # Level IV for tall factories
            else:
                return '3'  # Level III for lower factories
        else:
            return '1'  # Default to Level I if no matching category

    def calculate_protection_radius(self, height):
        """Calculate protection radius with a maximum limit of 60 meters."""
        if not isinstance(height, (int, float)) or height <= 0:
            return 0  # Avoid errors for invalid values
        return min(height * 2.5, 60)  # Maximum radius of 60 meters

    def calculate_number_of_rods(self, length, width, height):
        area = length * width
        min_radius = self.calculate_protection_radius(height)
        
        # Setiap 500 m² butuh 1 rod, dibulatkan ke atas (ceil)
        return max(1, math.ceil(area / 500))

    def calculate_rod_placement(self, protection_radius, mesh_distance):
        """Calculate lightning rod placement based on protection radius and mesh distance.z"""
        num_rods_per_row = math.ceil((2 * protection_radius) / mesh_distance)
        
        rods_placement = []
        for i in range(num_rods_per_row):
            for j in range(num_rods_per_row):
                x = i * mesh_distance
                y = j * mesh_distance
                rods_placement.append([x, y])  # Each rod is placed at a specific x, y coordinate
        
        return rods_placement

class ViewCalculationView(View):
    def get(self, request, building_id):
        # Ambil building berdasarkan id atau tampilkan error 404 jika tidak ditemukan
        building = get_object_or_404(Building, id=building_id)

        # Hitung ulang protection_radius dari total_height (maksimum 60m)
        protection_radius = min(building.total_height * 2.5, 60)

        # Lakukan perhitungan
        area_of_protection = self.calculate_area_of_protection(building, protection_radius)
        lightning_strike_current = self.calculate_lightning_strike_current(building)
        radius_graph = self.calculate_radius_graph(protection_radius)
        
        # Jika radius perlindungan tidak menutupi seluruh bangunan
        warning_message = ""
        if protection_radius < building.total_length:
            warning_message = "The protection radius does not cover the entire building area. Please double check the input parameters."

        # Kirim data ke template untuk ditampilkan
        return render(request, 'view_calculation.html', {
            'building': building, 
            'protection_radius': protection_radius,
            'area_of_protection': area_of_protection,
            'lightning_strike_current': lightning_strike_current,
            'radius_graph': radius_graph,
            'warning_message': warning_message,
        })
    
    def calculate_area_of_protection(self, building, protection_radius):
        """Menghitung persentase area yang terlindungi berdasarkan radius perlindungan"""
        total_area = building.total_length * building.total_width  # Total area bangunan
        area_covered = math.pi * (protection_radius ** 2)  # Area lingkaran perlindungan
        return (area_covered / total_area) * 100  # Persentase area yang terlindungi

    def calculate_lightning_strike_current(self, building):
        """Menghitung arus petir berdasarkan bangunan"""
        return 163  # W/km (Contoh, bisa disesuaikan lebih lanjut)

    def calculate_radius_graph(self, protection_radius):
        """Menghitung perubahan radius atau membuat grafik"""
        return f"+{protection_radius * 0.2}%"  # Sebagai contoh, perubahan 20% dari radius

class LightningRodInputView(View):
    def get(self, request, building_id):
        building = Building.objects.get(id=building_id)
        form = LightningRodForm()
        return render(request, 'bulding/lightning_rod_input.html', {'form': form, 'building': building})

    def post(self, request, building_id):
        building = Building.objects.get(id=building_id)
        form = LightningRodForm(request.POST)
        if form.is_valid():
            rod = form.save(commit=False)
            rod.building = building
            rod.save()  # Save the lightning rod instance
            return redirect('homepage')  # Redirect after saving
        return render(request, 'bulding/lightning_rod_input.html', {'form': form, 'building': building})
    
class NewInputAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = BuildingSerializer(data=request.data)

        if serializer.is_valid():
            building = serializer.save()

             # Ambil data yang dihitung setelah save
            a = building.total_length
            b = building.total_width
            h = building.total_height
            Td = building.location.lower()  # Asumsikan Td berdasarkan lokasi gedung (misal: jakarta, sumut, dsb)

            # Perhitungan Area Cakupan Ekivalen (Ae)
            Ae = building.calculate_area_equivalent(a, b, h)

            # Perhitungan Kerapatan Sambaran Petir ke Tanah (Ng)
            Ng = building.calculate_ng(Td)

            # Perhitungan Jumlah rata-rata frekuensi sambaran petir langsung per-tahun (Nd)
            Nd = building.calculate_nd(Ae, Ng)

            # Hitung nilai masing-masing indeks
            index_a = building.calculate_index_a()
            index_b = building.calculate_index_b()
            index_c = building.calculate_index_c()
            index_d = building.calculate_index_d()
            index_e = building.calculate_index_e()

            # Hitung total risk index
            total_risk_index = index_a + index_b + index_c + index_d + index_e

            # Hitung level kerusakan berdasarkan total risk index
            level_of_damage = building.calculate_level_of_damage(total_risk_index)

            # Hitung Position X, Position Y, dan Distance dari model
            position_x, position_y, distance = building.calculate_position_and_distance()

             # Perhitungan strike current dan jarak sambaran petir
            strike_current = building.calculate_strike_current()
            strike_distance = building.calculate_strike_distance()
            min_strike_current = building.calculate_min_strike_current()

            # Perhitungan efisiensi proteksi petir
            protection_efficiency = building.calculate_protection_efficiency(Nd)

            # SPP dan Rod Data
            spp_cable = building.get_spp_cable_recommendation()
            rod_data = building.calculate_rod_recommendation()

            # Hasil yang dikirimkan ke frontend
            result = {
                "Ae": Ae,  # Area Cakupan Ekivalen
                "Ng": Ng,  # Kerapatan Sambaran Petir ke Tanah
                "Nd": Nd,  # Jumlah rata-rata frekuensi sambaran petir langsung per-tahun
                "index_a": index_a,  # Kirimkan hasil Index A
                "index_b": index_b,  # Kirimkan hasil Index B
                "index_c": index_c,  # Kirimkan hasil Index C
                "index_d": index_d,  # Kirimkan hasil Index D
                "index_e": index_e,  # Kirimkan hasil Index E
                "total_risk_index": total_risk_index,  # Kirimkan hasil total risk index
                "protection_radius": building.protection_radius,
                "number_of_lightning_rods": building.number_of_lightning_rods,
                "position_x": position_x,
                "position_y": position_y,
                "distance": distance,
                "protection_level": building.calculate_protection_level(),
                "risk_index": total_risk_index,
                "level_of_damage": level_of_damage,
                "protection_recommendations": building.get_protection_recommendations(total_risk_index, level_of_damage),
                "arrester_data": building.get_arrester_installation(building.building_type),
                "strike_current": strike_current,  # Sending strike current
                "strike_distance": strike_distance,  # Sending strike distance
                "min_strike_current": min_strike_current,  # Sending min strike current
                "protection_efficiency": protection_efficiency,  # Sending protection efficiency
                "recommended_rod_height": rod_data.get("recommended_rod_height"),
                "total_height_from_ground": rod_data.get("total_height_from_ground"),
                "spp_cable": spp_cable
                
            }

            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]  # Hanya bisa diakses oleh pengguna yang terautentikasi

    def get(self, request):
        user = request.user  # Mendapatkan user yang terautentikasi
        
        # Mengambil semua proyek milik user
        projects = Project.objects.filter(user=user)

        # Statistik proyek
        active_projects = projects.filter(status='active').count()
        completed_projects = projects.filter(status='completed').count()
        simulations = projects.filter(simulation=True).count()
        calculations = projects.filter(calculation=True).count()

        # Ambil proyek aktif TERBARU (id terbesar)
        active_project = projects.filter(status='active').order_by('-id').first()
        
        # Data yang akan dikirim ke frontend
        data = {
            'user': user.username,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'simulations': simulations,
            'calculations': calculations,
            'active_project': {
                'name': active_project.name if active_project else 'No Active Project',
                'location': active_project.location if active_project else 'N/A'
            },
            'quick_actions': [
                {"name": "New Input", "icon": "🍏", "url": "/new-input"},
                {"name": "View Simulation", "icon": "📊", "url": "/view-simulation"},
                {"name": "Generate Report", "icon": "📄", "url": "/generate-report"}
            ]
        }

        # Serialisasi data proyek dengan ProjectSerializer
        project_data = ProjectSerializer(projects, many=True).data  # Serialize semua proyek yang dimiliki oleh user

        # Gabungkan data proyek ke dalam response
        data['projects'] = project_data

        # Menggunakan DashboardSerializer untuk merender data ke dalam format JSON
        serializer = DashboardSerializer(data)
        
        # Kirimkan response ke frontend
        return Response(serializer.data)
    
class ProtectedPageView(TemplateView):
    template_name = 'protected.html'

    def dispatch(self, request, *args, **kwargs):
        jwt_authenticator = JWTAuthentication()
        auth_result = jwt_authenticator.authenticate(request)

        if auth_result is None:  # Jika user tidak memiliki JWT token, tolak akses
            return HttpResponseForbidden("Unauthorized")

        return super().dispatch(request, *args, **kwargs)

class MyView(TemplateView):
    template_name = 'dashboard.html'

    def dispatch(self, request, *args, **kwargs):
        jwt_authenticator = JWTAuthentication()
        auth_result = jwt_authenticator.authenticate(request)

        if auth_result is None:  # Jika user tidak memiliki JWT token, tolak akses
            return HttpResponseForbidden("Unauthorized")

        return super().dispatch(request, *args, **kwargs)
    
class MainFeaturesView(View):
    def get(self, request):
        # Ambil semua fitur utama yang ada dan urutkan berdasarkan 'order'
        features = MainFeature.objects.all().order_by('order')
        return render(request, 'building/main_features.html', {'features': features})
    
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "This is a protected endpoint!"})

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Validasi dan deserialisasi data login menggunakan LoginSerializer
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            # Autentikasi pengguna menggunakan username dan password
            user = authenticate(username=username, password=password)
            
            if user is None:
                raise AuthenticationFailed("Invalid credentials")

            # Jika autentikasi berhasil, buat token JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            return Response({
                "access": access_token,
                "refresh": str(refresh),
                "user": {"username": user.username}
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Deserialize and validate the signup data
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Create the user
            
            # Generate JWT token for the user
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            # Return the tokens and user info
            return Response({
                'access': access_token,
                'refresh': str(refresh),
                'user': {'username': user.username}
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# **Homepage View**
def homepage(request):
    return render(request, 'index.html')  # Ensure 'index.html' is in the templates directory

class TokenRefreshView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Ambil refresh token dari header Authorization atau request body
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response({"detail": "Refresh token is missing"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Buat RefreshToken object dari string yang diterima
            refresh = RefreshToken(refresh_token)

            # Generate access token baru
            new_access_token = str(refresh.access_token)

            return Response({"access": new_access_token}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
