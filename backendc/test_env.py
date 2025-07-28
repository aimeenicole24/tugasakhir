from decouple import Config, RepositoryEnv
from pathlib import Path

try:
    env_path = Path.cwd() / '.env'
    print(f"Using .env file at: {env_path}")
    config = Config(RepositoryEnv(env_path))

    # Coba baca variabel dari .env
    print("DJANGO_SECRET_KEY:", config('DJANGO_SECRET_KEY', default='SECRET_KEY_NOT_FOUND'))
    print("DEBUG:", config('DEBUG', default=False, cast=bool))
    print("ALLOWED_HOSTS:", config('ALLOWED_HOSTS', default='localhost').split(','))
except Exception as e:
    print(f"ERROR: {e}")
