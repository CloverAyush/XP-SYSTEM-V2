from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from Backend.models import QuestTemplate, User, Task, XPlog, QuestInstance
from Database.database import engine, Base, SessionLocal
from datetime import datetime, timedelta, date
from typing import Optional
import calendar

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="XP System API",
    description="An XP tracking and leveling system",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def apply_pending_penalty(user, db):
    """Apply penalties for incomplete tasks from previous days"""
    today = datetime.utcnow().date()

    if user.last_penalty_date:
        last_checked = user.last_penalty_date.date()
    else:
        last_checked = user.last_completed_date.date() if user.last_completed_date else today - timedelta(days=1)
    
    current_day = last_checked + timedelta(days=1)

    while current_day < today:
       
        instances = db.query(QuestInstance).filter(
            QuestInstance.user_id == user.id,
            QuestInstance.deadline_date <= current_day,
            QuestInstance.state == "ACTIVE"
        ).all()

        if not instances:
            current_day += timedelta(days=1)
            continue

        all_completed = all(instance.state == "COMPLETED" for instance in instances)

        if not all_completed:
            # Calculate penalty for incomplete tasks
            user.streak = 0
            penalty = 0
            for instance in instances:

                template = db.query(QuestTemplate).filter(QuestTemplate.id == instance.template_id).first()

                if instance.state != "COMPLETED":
                    if template.difficulty == "easy":
                        penalty += 150
                    elif template.difficulty == "medium":
                        penalty += 100
                    else:
                        penalty += 50

                    instance.state = "FAILED"

            # Apply fail streak multiplier
            penalty *= (user.fail_streak + 1)

            # Apply penalty to user XP
            user.xp -= penalty
            user.level = calc_level(user.xp)
            user.fail_streak += 1
           

            # Log the penalty (negative xp_change)
            log = XPlog(
                user_id=user.id,
                xp_change=-penalty,
                level_change=user.level,
                streak_change=user.fail_streak,
                reason=f"Penalty for incomplete tasks on {current_day} ({penalty} XP)"
            )
            db.add(log)
        else:
            # All tasks completed - reset fail streak
            user.fail_streak = 0
            user.last_penalty_date = datetime(current_day.year, current_day.month, current_day.day)

        current_day += timedelta(days=1)
    
    # Update the last penalty date
    user.last_penalty_date = datetime(today.year, today.month, today.day)
    db.commit()              


@app.get("/")
def read_root():
    return {"message": "Welcome to the XP System API!"}

#------------------------Users----------------------------------

@app.post("/users")
def create_user(name: str, db: Session = Depends(get_db)):
    user = User(username=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

#-----------------------------Tasks-------------------------------------

@app.post("/tasks")
def create_task(title: str,
                user_id: int,
                difficulty: str,
                is_recurring: bool = False,
                db: Session = Depends(get_db)
                ):
    """Create a new task"""
    task = Task(title=title,
                user_id=user_id, 
                difficulty=difficulty, 
                is_recurring=is_recurring)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def calc_level(xp: int):
    """Calculate level based on XP (simple formula)"""
    return int((xp/100)**0.5)

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """Check completion of a task and award XP"""
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        return {"error": "Task not found"}
    
    if task.is_completed:
        return {"message": "Task already completed"}
    
    task.is_completed = True

    user = db.query(User).filter(User.id == task.user_id).first()

    apply_pending_penalty(user, db)

    if task.difficulty == "easy":
        xp_gain = 50
    elif task.difficulty == "medium":
        xp_gain = 100
    else:
        xp_gain = 150

    user.xp += xp_gain
    user.level = calc_level(user.xp)

    previous_completed_date= user.last_completed_date
    today = datetime.utcnow().date()
    
    tasks_today = db.query(Task).filter(
        Task.user_id == user.id,
        Task.created_at >= datetime(today.year, today.month, today.day)
        ).all()
    
    all_completed_today = all(task.is_completed for task in tasks_today)

    if previous_completed_date is None:
        if all_completed_today:
         user.streak = 1
    else:
        last_date = previous_completed_date.date()

        if last_date == today:
          pass
        elif last_date == today - timedelta(days=1):
            if all_completed_today:
                user.streak += 1
            else:
                pass
        else:
            user.streak = 1

    if all_completed_today:
       user.last_completed_date = datetime.utcnow()


    db.commit()
    db.refresh(user)

    log = XPlog(
        user_id=user.id,
        xp_change=xp_gain,
        level_change=user.level,
        streak_change=user.streak,
        reason=f"Completed task '{task.title, task.difficulty}'"
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Task completed",
        "xp_gained": xp_gain,
        "total_xp": user.xp,
        "level": user.level,
        "user_id": user.id,
        "username": user.username,
        "last_completed_date": user.last_completed_date,
        "streak": user.streak
    }

@app.post("/quests/{instance_id}/complete")
def complete_quest(instance_id: int, db: Session = Depends(get_db)):
    """Check completion of a task and award XP"""
    instance = db.query(QuestInstance).filter(QuestInstance.id == instance_id).first()

    if not instance:
        return {"error": "Task not found"}
    
    if instance.state == "COMPLETED":
        return {"message": "Task already completed"}

    if instance.state == "FAILED":
        return {"message": "Task failed"}
    
    instance.state = "COMPLETED"
    instance.completed_at = datetime.utcnow()

    template = db.query(QuestTemplate).filter(
        QuestTemplate.id == instance.template_id
    ).first()

    user = db.query(User).filter(User.id == instance.user_id).first()

    apply_pending_penalty(user, db)

    if template.difficulty == "easy":
        xp_gain = 50
    elif template.difficulty == "medium":
        xp_gain = 100
    else:
        xp_gain = 150

    user.xp += xp_gain
    user.level = calc_level(user.xp)

    previous_completed_date= user.last_completed_date
    today = datetime.utcnow().date()
    
    daily_one_time = db.query(QuestInstance).join(
        QuestTemplate,
        QuestInstance.template_id == QuestTemplate.id
        ).filter(QuestInstance.user_id== user.id,
                 QuestInstance.date== today,
                 QuestTemplate.quest_type.in_(["DAILY", "ONE_TIME","scheduled"])).all()
    
    all_completed_today = all(instance.state == "COMPLETED" for instance in daily_one_time)

   

    if all_completed_today:
       user.last_completed_date = datetime.utcnow()


    db.commit()
    db.refresh(user)

    log = XPlog(
        user_id=user.id,
        xp_change=xp_gain,
        level_change=user.level,
        streak_change=user.streak,
        reason=f"Completed task '{template.title, template.difficulty}'"
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "message": "Task completed",
        "xp_gained": xp_gain,
        "total_xp": user.xp,
        "level": user.level,
        "user_id": user.id,
        "username": user.username,
        "last_completed_date": user.last_completed_date,
    }




@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    #Get user info and apply any pending penalties before returning data
    user= db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"Error": "no user found"}
    
    apply_pending_penalty(user, db)

    return{
        "id": user.id,
        "username": user.username,
        "xp": user.xp,
        "level": user.level,
        "streak": user.streak,
        "fail_streak": user.fail_streak
    }

@app.post("/quest-templates")
def create_template(user_id: int,
                    title: str,
                    description: str,
                    quest_type: str,
                    difficulty: str,
                    scheduled_days: Optional[str] = None,
                    target_deadline: date = None,
                    db: Session = Depends(get_db)):
    
    today = datetime.utcnow().date()

    template = QuestTemplate(title=title,
                user_id=user_id, 
                difficulty=difficulty, 
                scheduled_days= scheduled_days,
                quest_type= quest_type
                )
    db.add(template)
    db.commit()
    db.refresh(template)

    if(quest_type== "ONE_TIME"):
        instance= QuestInstance(
            template_id= template.id,
            user_id= user_id,
            date= today,
            deadline_date = template.target_deadline,
            state= "ACTIVE"
        )

        db.add(instance)
        db.commit()
        db.refresh(instance)

    return template



@app.get("/tasks")
def get_tasks(user_id: int, db: Session = Depends(get_db)):
 #Get all tasks for a user
    tasks = db.query(Task).filter(Task.user_id == user_id).all()

    return tasks


@app.get("/quests")
def get_quests(user_id, db: Session = Depends(get_db)):

    generate_today_instances(user_id, db)
    
    today = datetime.utcnow().date()

    quests = db.query(QuestInstance).filter(
        QuestInstance.user_id== user_id,
        QuestInstance.date == today
    ).all()

    return quests

def generate_today_instances(user_id, db):
    today = datetime.utcnow().date()
    week_key= f"{today.year}-W{today.isocalendar().week}"
    month_key= f"{today.year}-{today.month:02d}"
    today_day= today.strftime("%a").lower()

   
        

    templates = db.query(QuestTemplate).filter(
        QuestTemplate.user_id== user_id,
        QuestTemplate.is_active== True
    ).all()

    

    for template in templates:

        period_key = None
        
        

        if template.quest_type =="DAILY":
           period_key= str(today) 
    
        elif template.quest_type == "WEEKLY":
           period_key= week_key
    
        elif template.quest_type == "MONTHLY":
           period_key= month_key

        elif template.quest_type == "scheduled":

            if not template.scheduled_days:
                print(f"error scheduled days required for scheduled type quests, missing from template:{template.id}")
                continue
            
            
            allowed_days= template.scheduled_days.lower().split(",")
        

            if today_day in allowed_days:
               period_key= str(today)
            if today_day not in allowed_days:
                continue

        if period_key is None:
            print("no period key:", template.id, template.quest_type)
            continue

        existing_instance = db.query(QuestInstance).filter(QuestInstance.template_id == template.id,
                                                           QuestInstance.period_key == period_key).first()
        if existing_instance:
            continue

       
        
        if template.quest_type== "scheduled":
            
            template.scheduled_days = template.scheduled_days.lower()
            allowed_days= template.scheduled_days.split(",")

            if today_day not in allowed_days:
                continue
            if today_day in allowed_days:
                new_instance = QuestInstance(
                template_id= template.id,
                user_id = user_id,
                date = today,
                period_key= str(today),
                deadline_date = today,
                state = "ACTIVE",
            )
                
            db.add(new_instance)

        if template.quest_type == "DAILY":
            new_instance = QuestInstance(
                template_id= template.id,
                user_id = user_id,
                date = today,
                period_key= str(today),
                deadline_date = today,
                state = "ACTIVE",
            )

            db.add(new_instance)


        if template.quest_type == "WEEKLY":

            week_end = today + timedelta(days=(6-today.weekday()))

            existing_instance = db.query(QuestInstance).filter(QuestInstance.template_id == template.id,
                                                           QuestInstance.period_key == week_key).first()


            new_instance= QuestInstance(
                template_id = template.id,
                user_id = user_id,
                date = today,
                period_key= week_key,
                deadline_date = week_end,
                state = "ACTIVE"
            )

            db.add(new_instance)

        if template.quest_type == "MONTHLY":

            last_day = calendar.monthrange(
                today.year,
                today.month
            )[1]

            month_end = date(
                today.year,
                today.month,
                last_day
            )

            existing_instance = db.query(QuestInstance).filter(QuestInstance.template_id == template.id,
                                                           QuestInstance.period_key == month_key).first()


            new_instance= QuestInstance(
                template_id = template.id,
                user_id = user_id,
                date = today,
                period_key= month_key,
                deadline_date = month_end,
                state = "ACTIVE"
            )

            db.add(new_instance)
    db.commit()    


    


