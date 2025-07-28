from pathlib import Path  # Untuk menangani path secara dinamis
from decouple import config  # Untuk membaca variabel dari file .env
from datetime import timedelta  # Untuk mengatur lifetime JWT

# BASE_DIR: Direktori utama proyek
BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY dari file .env
SECRET_KEY = config('DJANGO_SECRET_KEY', default=None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY tidak boleh kosong. Harap tambahkan ke file .env.")

# Pengaturan debug untuk pengembangan
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# Aplikasi yang diinstal
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # Django REST Framework untuk API
    'corsheaders',  # Untuk mengizinkan akses lintas origin (React ke Django)
    'rest_framework_simplejwt',  # JWT Authentication
    'building',  # Aplikasi Building
]

# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Middleware CORS (harus ditempatkan di sini)
    'django.middleware.security.SecurityMiddleware',  # Middleware keamanan
    'django.contrib.sessions.middleware.SessionMiddleware',  # Middleware sesi (dibutuhkan untuk Django Admin)
    'django.middleware.common.CommonMiddleware',  # Middleware umum
    'django.contrib.auth.middleware.AuthenticationMiddleware',  # Autentikasi user
    'django.contrib.messages.middleware.MessageMiddleware',  # Middleware untuk pesan
    'django.middleware.clickjacking.XFrameOptionsMiddleware',  # Middleware untuk clickjacking
]

# Konfigurasi REST Framework agar menggunakan JWT untuk autentikasi
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Gunakan JWT
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # API hanya bisa diakses oleh user yang sudah login
    ],
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Pastikan folder 'templates' ada
        'APP_DIRS': True,  # Aktifkan pencarian template dalam aplikasi
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Konfigurasi JWT (Menyederhanakan pengaturan)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),  # Token berlaku selama 1 jam
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),  # Refresh token berlaku selama 7 hari
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Konfigurasi CORS agar React bisa mengakses API Django
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Ganti dengan URL frontend-mu
]
CORS_ALLOW_HEADERS = [
    'x-requested-with',
    'content-type',
    'authorization',
    'accept',
    'origin',
    'user-agent',
]

# Konfigurasi Database (Tidak diubah)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='thunderbolt'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='aimeeweb'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Pengaturan lainnya tidak berubah
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Pengaturan file statis
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Pengaturan file media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default Auto Field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

ROOT_URLCONF = 'thunderbolt_backend.urls'  # Sesuaikan dengan nama proyek Anda

