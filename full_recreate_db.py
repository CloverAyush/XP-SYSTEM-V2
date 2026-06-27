#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive database recreation script
This ensures ALL models are imported and the configured PostgreSQL schema is created correctly
"""
import sys
import os
import shutil
from sqlalchemy import inspect

# Add the project to path
sys.path.insert(0, 'c:\\Users\\OM CHICKS\\Desktop\\XP-System')

print("=" * 60)
print("DATABASE RECREATION SCRIPT")
print("=" * 60)

# Step 1: Clean Python cache
print("\n[1] Clearing Python cache...")
for root, dirs, files in os.walk('c:\\Users\\OM CHICKS\\Desktop\\XP-System'):
    if '__pycache__' in dirs:
        pycache_path = os.path.join(root, '__pycache__')
        shutil.rmtree(pycache_path)
        print(f"  [OK] Removed {pycache_path}")

# Step 2: Validate database configuration
print("\n[2] Validating database configuration...")
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL environment variable is required")
print("  [OK] DATABASE_URL detected")

# Step 3: Clear module cache
print("\n[3] Clearing Python module cache...")
modules_to_clear = [k for k in sys.modules.keys() if 'Backend' in k or 'Database' in k]
for mod in modules_to_clear:
    del sys.modules[mod]
print(f"  [OK] Cleared {len(modules_to_clear)} cached modules")

# Step 4: Import models (this automatically registers them)
print("\n[4] Importing all models...")
from Backend.models import User, XPlog, QuestTemplate, QuestInstance
from Database.database import Base, engine
print("  [OK] User model imported")
print("  [OK] XPlog model imported")
print("  [OK] QuestTemplate model imported")
print("  [OK] QuestInstance model imported")

# Step 5: Verify all columns are in the models
print("\n[5] Verifying model definitions...")
print("\n  User model columns:")
for col in User.__table__.columns:
    print(f"    - {col.name}")

print("\n  XPlog model columns:")
for col in XPlog.__table__.columns:
    print(f"    - {col.name}")

print("\n  QuestTemplate model columns:")
for col in QuestTemplate.__table__.columns:
    print(f"    - {col.name}")

print("\n  QuestInstance model columns:")
for col in QuestInstance.__table__.columns:
    print(f"    - {col.name}")

# Step 6: Create database
print("\n[6] Creating database schema...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("  [OK] Database created")

# Step 7: Verify database
print("\n[7] Verifying database schema...")
inspector = inspect(engine)
for table_name in inspector.get_table_names():
    print(f"\n  {table_name} table in database:")
    for col in inspector.get_columns(table_name):
        print(f"    - {col['name']}: {col['type']}")

print("\n" + "=" * 60)
print("[OK] DATABASE RECREATION COMPLETE")
print("=" * 60)
