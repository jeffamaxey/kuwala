from typing import List

from pydantic import BaseModel, Json


class TransformationCatalogItemBase(BaseModel):
    id: str
    category: str
    name: str
    icon: str
    description: str
    required_column_types: List[str]
    optional_column_types: List[str]
    macro_parameters: Json
    example_before: Json
    example_after: Json


class TransformationCatalogItem(TransformationCatalogItemBase):
    class Config:
        orm_mode = True


class TransformationCatalogItemCreate(TransformationCatalogItemBase):
    pass
