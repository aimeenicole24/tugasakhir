from django.test import TestCase
from django.urls import reverse

class BuildingInputViewTests(TestCase):
    def test_add_building_view(self):
        response = self.client.get(reverse('add_building'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'bulding/add_building.html')

    def test_csrf_protection(self):
        response = self.client.post(reverse('add_building'), {
            'total_height': 25,  # Example data
            'building_type': 'Residential',  # Example data
            # Add other required fields here
        })
        self.assertEqual(response.status_code, 403)  # Check for CSRF protection

    def test_add_building_post(self):

        response = self.client.post(reverse('add_building'), {
            'total_height': 25,  # Example data
            'building_type': 'Residential',  # Example data
            # Add other required fields here
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Building added successfully")  # Adjust based on actual response
