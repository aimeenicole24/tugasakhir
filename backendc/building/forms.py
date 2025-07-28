from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth.models import User
from .models import Building, LightningRod  # Import the Building and LightningRod models

class BuildingForm(forms.ModelForm):
    class Meta:
        model = Building
        fields = [
            'building_type', 
            'location', 
            'total_length', 
            'main_length', 
            'eastwing_length', 
            'total_width', 
            'main_height', 
            'eastwing_height', 
            'total_height'
        ]  # Exclude protection_radius and number_of_lightning_rods

    def clean(self):
        cleaned_data = super().clean()
        location = cleaned_data.get("location")
        print("Location in clean method:", location)  # Debugging line

        # Ensure location is valid
        if location:
            thunder_days = Building.THUNDER_DAYS.get(location, None)
            if thunder_days:
                min_thunder, max_thunder = thunder_days
                # Call the model's get_thunder_day method using the location
                building = Building(location=location)  # Create a new Building instance for validation
                if not (min_thunder <= building.get_thunder_day() <= max_thunder):
                    raise forms.ValidationError(
                        f"Hari guntur harus antara {min_thunder}-{max_thunder} untuk {dict(Building.LOCATION_CHOICES).get(location, 'lokasi tidak diketahui')}."
                    )
            else:
                raise forms.ValidationError("Lokasi tidak valid")
        else:
            raise forms.ValidationError("Location cannot be empty.")
        
        return cleaned_data


class LightningRodForm(forms.ModelForm):
    class Meta:
        model = LightningRod
        fields = ['position_x', 'position_y', 'distance', 'protection_level']  # Fields for lightning rod input

class LoginForm(AuthenticationForm):
    username = forms.CharField(label='Email', max_length=254)
    password = forms.CharField(label='Password', widget=forms.PasswordInput)

class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
