from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class Activity(Base):
    __tablename__ = "activities"
    __table_args__ = (
        UniqueConstraint("activity_type", "reference_id", name="uq_activity_reference"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    activity_type: Mapped[str] = mapped_column(String(20))
    reference_id: Mapped[int] = mapped_column(Integer, index=True)
    item_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    external_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )