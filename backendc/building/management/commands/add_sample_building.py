from django.core.management.base import BaseCommand
from building.models import Building
from building.management.commands.lightning_protection_calculation import calculate_protection_radius, calculate_lightning_rod_count

class Command(BaseCommand):
    help = 'Add a sample building to the database'

    def handle(self, *args, **kwargs):
        Building.objects.create(
            building_type='Residential',  # Updated to match the new model
            location='DKI Jakarta',  # Example location
            total_length=200.0,
            main_length=150.0,
            eastwing_length=50.0,
            total_width=100.0,
            main_height=80.0,
            eastwing_height=20.0,
            total_height=100.0,
            protection_radius=calculate_protection_radius(100.0),  # Example height
            number_of_lightning_rods=calculate_lightning_rod_count(200.0, 100.0, 100.0),  # Example dimensions
        )
        self.stdout.write(self.style.SUCCESS('Successfully added a sample building.'))
