from django.contrib import admin
from .models import Building
from .forms import BuildingForm
from .models import Project

class BuildingAdmin(admin.ModelAdmin):
    form = BuildingForm
    list_display = ['building_type', 'location', 'total_length', 'total_width', 'total_height', 'protection_radius', 'number_of_lightning_rods']  # Updated to include new fields

admin.site.register(Building, BuildingAdmin)
admin.site.register(Project)
