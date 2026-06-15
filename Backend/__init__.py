# Auto-import all models to ensure they're registered with SQLAlchemy
from Backend.models import User, Task

__all__ = ['User', 'Task']
