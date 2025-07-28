from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView  # Import JWT Views
from .views import ProtectedView
from rest_framework_simplejwt.views import TokenVerifyView
from .views import LoginView, SignupView
from .views import DashboardDataView,  NewInputAPIView


# Import Views
from .api_views import (
    BuildingListCreateAPIView,
    BuildingRetrieveUpdateDestroyAPIView,
    LightningRodViewSet
)
from .views import (
    BuildingInputView,
    LightningRodInputView,
    ViewCalculationView,
    MainFeaturesView,
)

# Register Router
router = DefaultRouter()
router.register(r'lightning-rods', LightningRodViewSet)

# URL Patterns
# building/urls.py
urlpatterns = [
    path('token/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected/', ProtectedView.as_view(), name='protected_view'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard_data'),
    path('buildings/', BuildingListCreateAPIView.as_view(), name='building-list'),
    path('add-building/', BuildingInputView.as_view(), name='add_building'),
    path('lightning-rod-input/<int:building_id>/', LightningRodInputView.as_view(), name='lightning_rod_input'),
    path('calculation/<int:building_id>/', ViewCalculationView.as_view(), name='calculation_view'),
    path('main-features/', MainFeaturesView.as_view(), name='main_features'),
    path('new-input/', NewInputAPIView.as_view(), name='new-input'),
    path('', include(router.urls)),  # Automatically handles /lightning-rods/
]

# Tambahkan static file handler hanya di mode DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
