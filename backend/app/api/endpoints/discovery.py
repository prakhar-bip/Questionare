from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse

router = APIRouter()

@router.post("/", response_model=StudentResponse)
def create_student_profile(student_in: StudentCreate, db: Session = Depends(get_db)):
    """
    Step 1 & 2: Receive student discovery data and save the dynamic student profile to the database.
    """
    student_data = student_in.model_dump()
    db_student = Student(**student_data)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student
