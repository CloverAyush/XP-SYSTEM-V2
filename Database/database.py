from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")

engine = create_engine(
    DATABASE_URL
)

SessionLocal = sessionmaker(autocommit= False, autoflush = False, bind=engine)

Base= declarative_base()

# At the END of database.py, after Base definition
from Backend import models  # This auto-registers all models with Base
