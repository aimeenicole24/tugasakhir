import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Fungsi untuk menghitung luas cakupan ekivalen
def calculate_ae(length, width, height):
    return (length * width) + (6 * height * (length + width)) + (9 * np.pi * height**2)

# Fungsi menghitung radius proteksi berdasarkan Rolling Sphere Method
def calculate_protection_radius(height):
    return 2.5 * height  # Sesuai metode Rolling Sphere

# Fungsi menghitung jumlah penangkal petir
def calculate_lightning_rod_count(length, width, height):
    area = length * width
    min_radius = calculate_protection_radius(height)
    return max(1, int(area / 500))  # 1 penangkal petir per 500 m²

def get_protection_radius_and_mesh(height, protection_level):
    """ Menghitung radius perlindungan dan mesh distance berdasarkan tinggi dan level perlindungan """
    if protection_level == 'I':
        protection_radius = height * 2  # Lebih besar
    elif protection_level == 'II':
        protection_radius = height * 2.5
    else:
        protection_radius = height * 3  # Lebih besar
    
    mesh_distance = protection_radius / 5
    return protection_radius, mesh_distance

# Fungsi untuk validasi input
def valid_input(prompt):
    while True:
        try:
            value = float(input(prompt))
            if value <= 0:
                print("Nilai harus lebih dari 0. Coba lagi.")
                continue
            return value
        except ValueError:
            print("Input tidak valid, masukkan angka.")

# Commenting out the interactive input section
# def get_building_data():
#     building_types = [
#         "Bangunan Pendidikan",
#         "Bangunan Publik",
#         "Bangunan Komersial",
#         "Rumah Sakit",
#         "Bangunan Keagamaan",
#         "Bangunan Industri"
#     ]
#     ...
#     return {
#         "building_type": building_types[building_choice - 1],
#         "location": location_name,
#         "thunder_days_per_year": Td,
#         "total_length": total_length,
#         "total_width": total_width,
#         "total_height": total_height,
#         "main_length": main_length,
#         "main_height": main_height,
#         "east_length": east_length,
#         "east_height": east_height,
#         "protection_radius": protection_radius,
#         "number_of_lightning_rods": number_of_lightning_rods
#     }

# Ambil data dari user
# building_data = get_building_data()

# Hitung luas cakupan ekivalen
# ae_main = calculate_ae(building_data["main_length"], building_data["total_width"], building_data["main_height"])
# ae_east = calculate_ae(building_data["east_length"], building_data["total_width"], building_data["east_height"])
# ae_total = ae_main + ae_east

# Cetak hasil
# print("\n=== Hasil Perhitungan ===")
# print(f"Jenis Bangunan: {building_data['building_type']}")
# print(f"Lokasi: {building_data['location']}")
# print(f"Hari Guruh per Tahun: {building_data['thunder_days_per_year']}")
# print(f"Radius Proteksi: {building_data['protection_radius']:.2f} m")
# print(f"Jumlah Penangkal Petir: {building_data['number_of_lightning_rods']}")
# print(f"Luas Cakupan Ekivalen Main Building: {ae_main:.2f} m²")
# print(f"Luas Cakupan Ekivalen East Wing: {ae_east:.2f} m²")
# print(f"Total Luas Cakupan Ekivalen: {ae_total:.2f} m²")

# Visualisasi Rolling Sphere
# def generate_sphere(center_x, center_y, center_z, radius):
#     u = np.linspace(0, 2 * np.pi, 100)
#     v = np.linspace(0, np.pi, 100)
#     x = center_x + radius * np.outer(np.cos(u), np.sin(v))
#     y = center_y + radius * np.outer(np.sin(u), np.sin(v))
#     z = center_z + radius * np.outer(np.ones(np.size(u)), np.cos(v))
#     return x, y, z

# fig = plt.figure(figsize=(12, 10))
# ax = fig.add_subplot(111, projection='3d')

# Plot Main Building
# ax.bar3d(0, 0, 0, building_data["main_length"], building_data["total_width"], building_data["main_height"], color='brown', alpha=0.7)

# Plot East Wing
# ax.bar3d(building_data["main_length"] + 5, 0, 0, building_data["east_length"], building_data["total_width"], building_data["east_height"], color='green', alpha=0.7)

# Plot Rolling Spheres
# sphere_centers = [
#     (0, 0, building_data["main_height"]),
#     (building_data["main_length"] + 5, 0, building_data["east_height"]),
#     (building_data["main_length"] / 2, building_data["total_width"] / 2, building_data["total_height"]),
# ]

# radius = building_data["protection_radius"]
# for center in sphere_centers:
#     x, y, z = generate_sphere(center[0], center[1], center[2], radius)
#     ax.plot_surface(x, y, z, color='blue', alpha=0.3, edgecolor='grey')

# ax.set_title("Rolling Sphere Method Visualization", fontsize=16)
# ax.set_xlabel("X-axis (m)")
# ax.set_ylabel("Y-axis (m)")
# ax.set_zlabel("Z-axis (m)")
# ax.view_init(elev=20, azim=30)

# plt.show()
