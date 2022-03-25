from sqlalchemy import JSON, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class TransformationCatalogItem(Base):
    __tablename__ = "transformation_catalog_items"

    id = Column(String, primary_key=True, index=True)
    category = Column(String, ForeignKey("transformation_catalog_categories.id"))
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)
    required_column_types = Column(ARRAY(String), nullable=False)
    optional_column_types = Column(ARRAY(String), nullable=False)
    macro_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
    example_before = Column(JSON, nullable=False)
    example_after = Column(JSON, nullable=False)
