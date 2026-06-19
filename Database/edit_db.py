from Database.database import SessionLocal
from Backend.models import User
from datetime import datetime, timedelta

db = SessionLocal()

user = db.query(User).filter(User.id == 1).first()

if user:
    user.last_completed_date = datetime.utcnow() - timedelta(days=1)
    db.commit()
    print("last completed yesterday")
else:
    print("User not found")

db.close()
