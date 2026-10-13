import os

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg://tunescope:tunescope@localhost:5432/tunescope_test",
)

from app.database import Base, engine # noqa: E402
from app.models import activity, favorite, history, playlist, review, user # noqa: E402, F401

Base.metadata.create_all(bind=engine)