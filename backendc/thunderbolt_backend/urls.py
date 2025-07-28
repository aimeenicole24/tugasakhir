from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render

urlpatterns = [
    # **Homepage**
    path('', lambda request: render(request, 'index.html'), name='homepage'),  # Menampilkan index.html sebagai homepage

    # **Django Admin**
    path('admin/', admin.site.urls),  # URL untuk halaman admin Django

    # **API Endpoint**
    path('api/', include('building.urls')),  # Semua endpoint API ada di building.urls
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)  # Menyajikan file statis saat pengembangan
