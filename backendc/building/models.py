from django.core.exceptions import ValidationError
from django.db import models
from .management.commands.lightning_protection_calculation import calculate_protection_radius, calculate_lightning_rod_count
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
import math


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    remember_me = models.BooleanField(default=False)  # Jika Anda ingin menyimpan opsi "Remember me"

    def __str__(self):
        return self.name

class Building(models.Model):
    # Pilihan Tipe Bangunan
    BUILDING_TYPES = [
        ('education', 'Bangunan Pendidikan'),
        ('public', 'Bangunan Publik'),
        ('commercial', 'Bangunan Komersial'),
        ('hospital', 'Rumah Sakit'),
        ('religious', 'Bangunan Keagamaan'),
        ('industrial', 'Bangunan Industri')
    ]

    # Pilihan Lokasi
    LOCATION_CHOICES = [
        ('jakarta', 'DKI Jakarta'),
        ('jabar', 'Jawa Barat'),
        ('jatim', 'Jawa Timur'),
        ('sumut', 'Sumatera Utara'),
        ('sulsel', 'Sulawesi Selatan'),
        ('batam', 'Batam'),
    ]

    # Pilihan Hari Guntur per Tahun
    THUNDER_DAYS = {
        'jakarta': (150, 180),
        'jabar': (160, 200),
        'jatim': (80, 120),
        'sumut': (100, 120),
        'sulsel': (80, 100),
        'batam': (124, 124),
    }

    building_type = models.CharField(max_length=20, choices=BUILDING_TYPES, verbose_name="Building Type")
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES, verbose_name="Building Location")

    # Dimensi Bangunan
    total_length = models.FloatField(default=0.0, verbose_name="Total Building Length (m)")
    main_length = models.FloatField(default=0.0, verbose_name="Main Building Length (m)")
    eastwing_length = models.FloatField(default=0.0, verbose_name="Eastwing Building Length (m)")
    total_width = models.FloatField(default=0.0, verbose_name="Total Building Width (m)")
    total_height = models.FloatField(default=0.0, verbose_name="Total Building Height (m)")
    main_height = models.FloatField(default=0.0, verbose_name="Main Building Height (m)")
    eastwing_height = models.FloatField(default=0.0, verbose_name="Eastwing Building Height (m)")

    # New fields
    position_x = models.FloatField(blank=True, null=True)  # X-coordinate for building position
    position_y = models.FloatField(blank=True, null=True)  # Y-coordinate for building position
    distance = models.FloatField(blank=True, null=True)  # Distance for protection calculations
    protection_level = models.FloatField(blank=True, null=True)  # Level of protection
    protection_radius = models.FloatField(blank=True, null=True)  # Existing field
    number_of_lightning_rods = models.IntegerField(blank=True, null=True)  # Existing field
    strike_current = models.FloatField(blank=True, null=True)  # Arus sambaran petir
    strike_distance = models.FloatField(blank=True, null=True)  # Jarak sambaran petir
    min_strike_current = models.FloatField(blank=True, null=True)  # Arus minimal sambaran petir
    protection_efficiency = models.FloatField(blank=True, null=True)  # Efisiensi sistem proteksi petir

    def clean(self):
        """Validasi untuk memastikan lokasi sudah terisi dan valid"""
        cleaned_data = super().clean()
        location = self.location  # Use self.location instead of cleaned_data

        if not location:
            raise ValidationError("Location must be provided.")

        # Check if location is a valid choice
        if location not in dict(Building.LOCATION_CHOICES).keys():
            raise ValidationError(f"Lokasi '{location}' tidak valid.")

        # Check thunder days for the location
        thunder_days = Building.THUNDER_DAYS.get(location)
        if thunder_days:
            min_thunder, max_thunder = thunder_days
            # Ensure thunder days are within the correct range
            if not (min_thunder <= self.get_thunder_day() <= max_thunder):
                raise ValidationError(
                    f"Hari guntur harus antara {min_thunder}-{max_thunder} untuk {self.get_location_display()}."
                )
        else:
            raise ValidationError(f"Lokasi {location} tidak ditemukan dalam data hari guntur.")
        
        return cleaned_data

    def get_thunder_day(self):
        """Menghitung hari guntur per tahun berdasarkan lokasi"""
        location = self.location  # Pastikan location sudah ada
        print(f"Location is: {location}")  # Debugging line

        if not location:
            raise ValueError("Location is not set.")  # Ini akan selalu terjadi jika location tidak ada

        thunder_range = self.THUNDER_DAYS.get(location, None)
        if not thunder_range:
            raise ValueError(f"Location {location} is not valid.")
        
        # Mengambil rata-rata hari guntur untuk lokasi tersebut
        return (thunder_range[0] + thunder_range[1]) // 2

    def calculate_index_a(self):
        """Indeks A: Penggunaan dan Isi Bangunan"""
        usage_category = {
            'education': 2,
            'public': 3,
            'commercial': 2,
            'hospital': 5,
            'religious': 3,
            'industrial': 15,
        }
        return usage_category.get(self.building_type, 0)

    def calculate_index_b(self):
        """Indeks B: Konstruksi Bangunan"""
        construction_category = {
            'education': 1,
            'public': 1,
            'commercial': 2,
            'hospital': 1,
            'religious': 1,
            'industrial': 0,
        }
        return construction_category.get(self.building_type, 1)

    def calculate_index_c(self):
        """Indeks C: Tinggi Bangunan"""
        if self.total_height <= 6:
            return 0
        elif self.total_height <= 12:
            return 2
        elif self.total_height <= 17:
            return 3
        elif self.total_height <= 25:
            return 4
        else:
            return 10

    def calculate_index_d(self):
        """Indeks D: Situasi Bangunan"""
        # Situasi bangunan berdasarkan ketinggian atau kriteria lainnya
        if self.total_height < 11:
            return 10
        elif self.total_height < 14:
            return 12
        else:
            return 15

    def calculate_index_e(self):
        """Indeks E: Hari Guntur per Tahun (menggunakan data lokasi)"""
        thunder_days = self.get_thunder_day()  # Menggunakan rata-rata hari guruh

        # Menentukan kategori Indeks E berdasarkan jumlah hari guruh per tahun
        if self.location == 'jakarta' or self.location == 'jabar':
            if 150 <= thunder_days <= 200:
                return 3  # Kategori Indeks E = 3
        elif self.location == 'jatim' or self.location == 'sumut' or self.location == 'sulsel':
            if 80 <= thunder_days <= 120:
                return 2  # Kategori Indeks E = 2
        return 0  # Default jika tidak sesuai kriteria

    def calculate_risk_index(self):
        """Menghitung total risk index dengan rumus: A + B + C + D + E"""
        index_a = self.calculate_index_a()
        index_b = self.calculate_index_b()
        index_c = self.calculate_index_c()
        index_d = self.calculate_index_d()
        index_e = self.calculate_index_e()

        # Total risk index
        total_risk_index = index_a + index_b + index_c + index_d + index_e
        return total_risk_index
    
    def calculate_protection_level(self):
        if self.building_type == 'education':
            return 2  # Level II
        elif self.building_type == 'public':
            return 2  # Level II
        elif self.building_type == 'commercial':
            return 3  # Level III
        elif self.building_type == 'hospital':
            return 3  # Level III
        elif self.building_type == 'religious':
            return 1  # Level I
        elif self.building_type == 'industrial':
            if self.total_height > 45:
                return 4  # Level IV for tall factories
            else:
                return 3  # Level III for lower factories
        else:
            return 1  # Default to Level I if no matching category

    def calculate_level_of_damage(self, risk_index):
        """Menghitung Level of Damage berdasarkan Risk Index dan Protection Level"""
        # Standar Perlindungan Berdasarkan Nilai Risk Index (R)
        # R = A + B + C + D + E

        if self.protection_level == 1:  # Perlindungan rendah (Level I)
            if risk_index >= 35:  # R > 35 => Sangat dianjurkan
                return 'High'
            elif 25 <= risk_index < 35:  # 25 <= R < 35 => Sistem proteksi dianjurkan
                return 'Medium'
            elif 15 <= risk_index < 25:  # 15 ≤ R < 25 => Kurang perlu sistem proteksi
                return 'Low'
            else:  # R < 15 => Tidak perlu sistem proteksi petir
                return 'Safe'

        elif self.protection_level == 2:  # Perlindungan sedang (Level II)
            if risk_index >= 30:  # R > 30 => Sangat dianjurkan
                return 'High'
            elif 20 <= risk_index < 30:  # 20 ≤ R < 30 => Sistem proteksi dianjurkan
                return 'Medium'
            elif 10 <= risk_index < 20:  # 10 ≤ R < 20 => Kurang perlu sistem proteksi
                return 'Low'
            else:  # R < 10 => Tidak perlu sistem proteksi petir
                return 'Safe'

        elif self.protection_level == 3:  # Perlindungan tinggi (Level III)
            if risk_index >= 25:  # R > 25 => Sangat dianjurkan
                return 'High'
            elif 15 <= risk_index < 25:  # 15 ≤ R < 25 => Sistem proteksi dianjurkan
                return 'Medium'
            elif 5 <= risk_index < 15:  # 5 ≤ R < 15 => Kurang perlu sistem proteksi
                return 'Low'
            else:  # R < 5 => Tidak perlu sistem proteksi petir
                return 'Safe'

        elif self.protection_level == 4:  # Perlindungan sangat tinggi (Level IV)
            if risk_index >= 15:  # R > 15 => Sistem proteksi dianjurkan
                return 'Medium'
            elif 5 <= risk_index < 15:  # 5 ≤ R < 15 => Kurang perlu sistem proteksi
                return 'Low'
            else:  # R < 5 => Tidak perlu sistem proteksi petir
                return 'Safe'

        return 'Safe'  # Default jika tidak memenuhi kriteria lainnya

    
    def get_protection_recommendations(self, risk_index, level_of_damage):
        """Return protection recommendations based on Risk Index and Level of Damage"""
        recommendations = []
        
        if level_of_damage == 'High':
            recommendations.append("Install more lightning rods for better coverage.")
            recommendations.append("Consider upgrading to Level IV protection.")
        
        elif level_of_damage == 'Medium':
            recommendations.append("Install additional lightning rods.")
            recommendations.append("Consider upgrading to Level III protection.")
        
        elif level_of_damage == 'Low':
            recommendations.append("Install standard lightning rods.")
            recommendations.append("Level II protection should be sufficient.")
        
        else:
            recommendations.append("Ensure building is safely grounded and installed with basic lightning rods.")
        
        # Risk Index-based recommendations
        if risk_index >= 15:
            recommendations.append("Building is highly vulnerable; immediate action is recommended.")
        elif risk_index >= 10:
            recommendations.append("Building has medium vulnerability, but action is recommended.")
        elif risk_index >= 5:
            recommendations.append("Low vulnerability, but should still consider protection measures.")
        
        return recommendations
    
    def get_arrester_installation(self, building_type):
        """Return arrester installation data based on building type"""
        arrester_installations = {
            'public': [
                {'Building_Type': 'Public Buildings', 'Arrester_Type': 'Class I & II', 'Installation': 'Control panels, Elevators and Lift, Communication System'},
            ],
            'education': [
                {'Building_Type': 'Educational Buildings', 'Arrester_Type': 'Class I & III', 'Installation': 'Main panels, Laboratory, Servers'},
            ],
            'commercial': [
                {'Building_Type': 'Commercial Buildings', 'Arrester_Type': 'Class I & II', 'Installation': 'Main panels, Sub Panels, Servers, Elevator and Lift'},
            ],
            'hospital': [
                {'Building_Type': 'Hospitals', 'Arrester_Type': 'Class I, II & III', 'Installation': 'Main panels, Distribution Panels, MRI, CT-Scan, Ventilation, Elevator and Lift'},
            ],
            'religious': [
                {'Building_Type': 'Religion Buildings', 'Arrester_Type': 'Class I', 'Installation': 'Main panels, Lighting, Audio'},
            ],
            'industrial': [
                {'Building_Type': 'Industrial Buildings', 'Arrester_Type': 'Class II & III', 'Installation': 'Main panels, Lighting, Control panels'},
            ],
        }

        return arrester_installations.get(building_type, [])
    
    def get_td(self):
        """Get the Td (thunder days) for the building based on its location."""
        if self.location.lower() in self.THUNDER_DAYS:
            return self.THUNDER_DAYS[self.location.lower()]
        return 0, 0  # Default if location not found

    def calculate_area_equivalent(self, a, b, h):
        """Menghitung Area Cakupan Ekivalen (Ae)."""
        return a * b + 6 * h * (a + b) + 9 * math.pi * (h ** 2)

    def calculate_ng(self, Td):
        """Menghitung Kerapatan sambaran petir ke tanah (Ng)."""
        try:
            # Mengambil nilai Td berdasarkan lokasi
            Td_min, Td_max = self.THUNDER_DAYS.get(self.location, (0, 0))
            Td = (Td_min + Td_max) / 2  # Gunakan rata-rata sebagai nilai Td
            
            return 0.04 * (Td ** 1.25)
        except ValueError:
            raise ValueError("Td harus berupa angka yang valid.")
        except KeyError:
            raise ValueError(f"Lokasi {self.location} tidak ditemukan dalam data hari guruh.")

    def calculate_nd(self, Ae, Ng):
        """Menghitung Jumlah rata-rata frekuensi sambaran petir langsung per-tahun (Nd)."""
        return Ng * Ae * 10 ** -6

    def calculate_protection_efficiency(self, Nd):
        """Menghitung efisiensi proteksi petir berdasarkan Nd dan Nc = 10**-1."""
        Nc = 10**-1  # Nilai Nc tetap 10^-1
    
        if Nd == 0:
           raise ValueError("Nd (jumlah frekuensi sambaran petir) tidak bisa nol.")
    
        # Menghitung efisiensi proteksi petir E = 1 - Nc / Nd
        efficiency = 1 - (Nc / Nd)
    
        # Pastikan hasil efisiensi tidak lebih dari 1 atau kurang dari 0
        efficiency = max(0, min(1, efficiency))
    
        # Mengembalikan hasil efisiensi dalam persen
        return efficiency * 100
    
    def calculate_strike_current(self):
       """Menghitung arus sambaran petir berdasarkan radius perlindungan."""
       # Menggunakan rumus I = R^(1/0.75) untuk menghitung arus sambaran petir
       strike_current = self.protection_radius ** (1 / 0.75)
       return strike_current

    def calculate_strike_distance(self):
        """Menghitung jarak sambaran petir (R_s) berdasarkan arus sambaran petir (I)."""
        strike_current = self.calculate_strike_current()  # Mengambil arus sambaran petir dari perhitungan sebelumnya
        strike_distance = 10 * (strike_current ** 0.65)  # R_s = 10 * I^0.65
        return strike_distance
    
    def calculate_min_strike_current(self):
        """Menghitung arus minimal sambaran petir yang dapat ditangkap oleh terminasi udara (I_min)."""
        strike_current = self.calculate_strike_current()  # Mengambil arus sambaran petir dari perhitungan sebelumnya
        I_min = math.sqrt((strike_current / 10) ** 0.65)  # I_min = sqrt(I * 10^(-0.65))
        return I_min
    
    def calculate_number_of_rods(self):
        area = self.total_length * self.total_width
        return math.ceil(area / 500)

    def save(self, *args, **kwargs):
        """Simpan perhitungan radius perlindungan dan jumlah petir."""
    
        if self.total_height:
            self.protection_radius = min(self.total_height * 2.5, 60)

        # Pastikan total_length, total_width sudah ada sebelum menghitung jumlah petir
        self.number_of_lightning_rods = self.calculate_number_of_rods()

        # Tambahkan perhitungan lainnya setelah save
        self.strike_current = self.calculate_strike_current()
        self.strike_distance = self.calculate_strike_distance()
        self.min_strike_current = self.calculate_min_strike_current()

        # Perhitungan posisi dan jarak perlindungan
        self.position_x, self.position_y, self.distance = self.calculate_position_and_distance()

        # Perhitungan efisiensi proteksi petir
        Td_min, Td_max = self.get_td()  # Ambil Td berdasarkan lokasi bangunan
        Ae = self.calculate_area_equivalent(self.total_length, self.total_width, self.total_height)
        Ng = self.calculate_ng(Td_min)  # Menggunakan nilai Td_min
        Nd = self.calculate_nd(Ae, Ng)
        strike_frequency = Td_min  # Anggap Td_min sebagai strike frequency jika diperlukan
        self.protection_efficiency = self.calculate_protection_efficiency(Nd)

        # Simpan objek ke database setelah perhitungan dilakukan
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_building_type_display()} - {self.get_location_display()}"
    
    def calculate_position_and_distance(self):
        """Calculate position, distance, and protection level based on building data."""
        position_x = self.total_length / 2  # Example: position in the middle of the building
        position_y = self.total_width / 2  # Example: position in the middle of the building
        distance = self.total_height * 2  # Example: distance based on building height

        return position_x, position_y, distance
    
    def get_spp_cable_recommendation(self):
        """Returns the recommended SPP cable specifications based on maximum lightning strike current (strike_current)."""
        current = self.strike_current 

        if current is None:
            return None

        if 0 <= current <= 50:
            return {
                'cable_material': 'Copper (Cu) / Aluminum (Al) / Iron (Fe)',
                'cable_cross_section': '≥ 16 mm² (Cu) / ≥ 25 mm² (Al) / ≥ 50 mm² (Fe)',
                'air_termination': '≥ 35 mm² (Cu) / ≥ 70 mm² (Al) / ≥ 50 mm² (Fe)',
                'earth_termination': '≥ 50 mm² (Cu) / ≥ 80 mm² (Fe)',
                'air_termination_thickness': '5 mm (Cu) / 7 mm (Al) / 4 mm (Fe)',
                'note': 'Low current, economical dimensions'
            }
        elif 50 < current <= 100:
            return {
                'cable_material': 'Copper (Cu) / Aluminum (Al) / Iron (Fe)',
                'cable_cross_section': '≥ 25 mm² (Cu) / ≥ 35 mm² (Al) / ≥ 50 mm² (Fe)',
                'air_termination': '≥ 50 mm² (Cu) / ≥ 80 mm² (Al) / ≥ 60 mm² (Fe)',
                'earth_termination': '≥ 70 mm² (Cu) / ≥ 100 mm² (Fe)',
                'air_termination_thickness': '5 mm (Cu) / 7 mm (Al) / 4 mm (Fe)',
                'note': 'Medium current, increased dimensions'
            }
        elif 100 < current <= 150:
            return {
                'cable_material': 'Copper (Cu) / Aluminum (Al) / Iron (Fe)',
                'cable_cross_section': '≥ 35 mm² (Cu) / ≥ 50 mm² (Al) / ≥ 60 mm² (Fe)',
                'air_termination': '≥ 70 mm² (Cu) / ≥ 100 mm² (Al) / ≥ 80 mm² (Fe)',
                'earth_termination': '≥ 100 mm² (Cu) / ≥ 120 mm² (Fe)',
                'air_termination_thickness': '5 mm (Cu) / 7 mm (Al) / 4 mm (Fe)',
                'note': 'High current, large termination and grounding'
            }
        elif 150 < current <= 200:
            return {
                'cable_material': 'Copper (Cu) / Aluminum (Al) / Iron (Fe)',
                'cable_cross_section': '≥ 50 mm² (Cu) / ≥ 70 mm² (Al) / ≥ 70 mm² (Fe)',
                'air_termination': '≥ 80 mm² (Cu) / ≥ 120 mm² (Al) / ≥ 100 mm² (Fe)',
                'earth_termination': '≥ 120 mm² (Cu) / ≥ 150 mm² (Fe)',
                'air_termination_thickness': '5 mm (Cu) / 7 mm (Al) / 4 mm (Fe)',
                'note': 'Very high current, increased safety margins'
            }
        elif current > 200:
            return {
                'cable_material': 'Copper (Cu) / Aluminum (Al) / Iron (Fe)',
                'cable_cross_section': '≥ 70 mm² (Cu) / ≥ 95 mm² (Al) / ≥ 100 mm² (Fe)',
                'air_termination': '≥ 100 mm² (Cu) / ≥ 140 mm² (Al) / ≥ 120 mm² (Fe)',
                'earth_termination': '≥ 150 mm² (Cu) / ≥ 180 mm² (Fe)',
                'air_termination_thickness': '5 mm (Cu) / 7 mm (Al) / 4 mm (Fe)',
                'note': 'Extremely high current, maximum dimensions required'
            }

        return None

    def calculate_rod_recommendation(self):
        """Calculate recommended lightning rod height and total height from ground."""
        if not isinstance(self.total_height, (int, float)) or self.total_height <= 0:
            return {
                "recommended_rod_height": None,
                "total_height_from_ground": None,
                "error": "Invalid building height"
            }

        # Kategori tinggi bangunan, tentukan tinggi penangkal (meter)
        if self.total_height <= 20:
            rod_height = 3
        elif self.total_height <= 35:
            rod_height = 5
        elif self.total_height <= 50:
            rod_height = 7
        elif self.total_height <= 70:
            rod_height = 9
        else:
            rod_height = 12

        total_height_from_ground = self.total_height + rod_height

        return {
            "recommended_rod_height": rod_height,
            "total_height_from_ground": total_height_from_ground
        }

class LightningRod(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name="lightning_rods")
    position_x = models.FloatField()  # x-coordinate for placement
    position_y = models.FloatField()  # y-coordinate for placement
    distance = models.FloatField()  # Distance between rods
    protection_level = models.FloatField()  # Level of protection this rod provides

    def __str__(self):
        return f"Rod {self.id} at {self.position_x}, {self.position_y}"

class MainFeature(models.Model):
    # Judul fitur utama
    title = models.CharField(max_length=200)
    
    # Deskripsi singkat dari fitur
    description = models.TextField()
    
    # Ikon fitur utama (misalnya untuk ikon di UI, gunakan class icon font-awesome)
    icon_class = models.CharField(max_length=100)  # Class font-awesome icon atau lainnya
    
    # Urutan tampil di halaman (opsional)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title
    
User = get_user_model() 

class Project(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('pending', 'Pending'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    simulation = models.BooleanField(default=False)
    calculation = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name