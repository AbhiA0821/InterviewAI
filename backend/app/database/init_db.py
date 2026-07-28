from app.database.base import Base
from app.database.session import engine
from app.models import Feedback, Interview, Resume, User


def init_db():
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
    except Exception as e:
        # Ignore table already exists or schema already up to date error
        pass


