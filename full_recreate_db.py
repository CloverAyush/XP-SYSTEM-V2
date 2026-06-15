#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive database recreation script
This ensures ALL models are imported and the database is created correctly
"""
import sys
import os
import shutil

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

# Step 2: Delete old database
print("\n[2] Deleting old database...")
db_path = 'c:\\Users\\OM CHICKS\\Desktop\\XP-System\\xp_system.db'
if os.path.exists(db_path):
    try:
        os.remove(db_path)
        print(f"  [OK] Deleted {db_path}")
    except PermissionError:
        print(f"  [WARN] Could not delete {db_path} (locked by another process)")
        print("  [WARN] Will recreate schema by dropping tables")

# Step 3: Clear module cache
print("\n[3] Clearing Python module cache...")
modules_to_clear = [k for k in sys.modules.keys() if 'Backend' in k or 'Database' in k]
for mod in modules_to_clear:
    del sys.modules[mod]
print(f"  [OK] Cleared {len(modules_to_clear)} cached modules")

# Step 4: Import models (this automatically registers them)
print("\n[4] Importing all models...")
from Backend.models import User, Task, XPlog, QuestTemplate, QuestInstance
from Database.database import Base, engine
print("  [OK] User model imported")
print("  [OK] Task model imported")
print("  [OK] XPlog model imported")
print("  [OK] QuestTemplate model imported")
print("  [OK] QuestInstance model imported")

# Step 5: Verify all columns are in the models
print("\n[5] Verifying model definitions...")
print("\n  User model columns:")
for col in User.__table__.columns:
    print(f"    - {col.name}")

print("\n  Task model columns:")
for col in Task.__table__.columns:
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
print("\n[7] Verifying database columns...")
import sqlite3
conn = sqlite3.connect('xp_system.db')
cursor = conn.cursor()

print("\n  Users table in database:")
cursor.execute("PRAGMA table_info(users);")
for col in cursor.fetchall():
    print(f"    - {col[1]}: {col[2]}")

print("\n  Tasks table in database:")
cursor.execute("PRAGMA table_info(tasks);")
for col in cursor.fetchall():
    print(f"    - {col[1]}: {col[2]}")

print("\n  Xp_logs table in database:")
cursor.execute("PRAGMA table_info(Xp_logs);")
for col in cursor.fetchall():
    print(f"    - {col[1]}: {col[2]}")

print("\n  quest_templates table in database:")
cursor.execute("PRAGMA table_info(quest_templates);")
for col in cursor.fetchall():
    print(f"    - {col[1]}: {col[2]}")

print("\n  quest_instances table in database:")
cursor.execute("PRAGMA table_info(quest_instances);")
for col in cursor.fetchall():
    print(f"    - {col[1]}: {col[2]}")

conn.close()

print("\n" + "=" * 60)
print("[OK] DATABASE RECREATION COMPLETE")
print("=" * 60)
