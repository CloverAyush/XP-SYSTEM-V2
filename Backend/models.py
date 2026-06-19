from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date
from Database.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_completed_date = Column(DateTime, nullable=True)
    fail_streak = Column(Integer, default=0)
    last_penalty_date = Column(DateTime, nullable=True)

class XPlog(Base):
    __tablename__= "Xp_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    xp_change = Column(Integer)
    level_change = Column(Integer)
    streak_change = Column(Integer)
    reason = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestTemplate(Base):
    __tablename__ = "quest_templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    quest_type = Column(String)  # daily, weekly, monthly, etc.
    difficulty = Column(String)  # easy, medium, hard
    scheduled_days = Column(String, nullable=True)  # JSON string or comma-separated days
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    target_deadline = Column(Date, nullable= True) 
    

class QuestInstance(Base):
    __tablename__ = "quest_instances"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("quest_templates.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    date = Column(Date, index=True)  # The date this quest instance is for
    period_key = Column(String, nullable= True, index= True)
    state = Column(String)  # pending, completed, failed, skipped
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deadline_date = Column(Date, nullable= True)
