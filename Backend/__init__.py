# Auto-import all models to ensure they're registered with SQLAlchemy
from Backend.models import User

__all__ = ['User']
