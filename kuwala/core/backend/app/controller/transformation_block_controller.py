import os
import subprocess

from controller.data_source.data_source import (
    get_data_source_and_data_catalog_item_id,
    get_table_preview,
)
from database.crud.common import generate_object_id, get_object_by_id
from database.database import get_db
from database.models.data_block import DataBlock
from database.models.transformation_block import TransformationBlock
from database.schemas.transformation_block import TransformationBlockCreate
from fastapi import Depends, HTTPException
import oyaml as yaml
from sqlalchemy.orm import Session


def get_dbt_dir(data_source_id: str) -> str:
    script_dir = os.path.dirname(__file__)

    return os.path.join(
        script_dir, f"../../../../tmp/kuwala/backend/dbt/{data_source_id}"
    )


def create_model(
    dbt_dir: str,
    name: str,
    base_data_block: DataBlock,
    base_transformation_block: TransformationBlock,
    transformation_block_id: str,
    transformation_catalog_item_id: str,
    args: dict,
    db: Session,
):
    _, data_catalog_item_id = get_data_source_and_data_catalog_item_id(
        data_source_id=base_data_block.data_source_id, db=db
    )
    schema_name = base_data_block.schema_name
    table_name = base_data_block.table_name

    if data_catalog_item_id == "bigquery":
        schema_name = base_data_block.dataset_name

    output = subprocess.run(
        f"dbt run-operation {transformation_catalog_item_id} --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    dbt_model_dir = f"{dbt_dir}/models/marts/{schema_name}/{table_name}"
    dbt_model = f"SELECT{output.stdout.decode('utf8').split('SELECT')[1][:-5]}"
    base_id = (
        base_data_block.id
        if not base_transformation_block
        else base_transformation_block.id
    )
    dbt_model_name = f"{'_'.join(map(lambda n: n.lower(), name.split()))}_{transformation_block_id}_{base_id}"

    with open(f"{dbt_model_dir}/{dbt_model_name}.sql", "w+") as file:
        file.write(dbt_model)
        file.close()

    return dbt_model_dir, dbt_model_name


def create_model_yaml(dbt_dir: str, dbt_model_dir: str, dbt_model_name: str):
    args = dict(model_name=dbt_model_name)
    output = subprocess.run(
        f"dbt run-operation generate_model_yaml --args '{args}' --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
        capture_output=True,
    )
    source_yml = yaml.safe_load(
        f"version{output.stdout.decode('utf8').split('version')[1][:-5]}"
    )

    with open(f"{dbt_model_dir}/{dbt_model_name}.yml", "w+") as file:
        yaml.safe_dump(source_yml, file, indent=4)
        file.close()


def get_base_data_block(
    db: Session,
    input_data_block_ids: list[str],
    input_transformation_block_ids: list[str],
) -> DataBlock:
    if (
        (not input_transformation_block_ids or len(input_transformation_block_ids) == 0)
        and input_data_block_ids
        and len(input_data_block_ids) == 1
    ):
        return get_object_by_id(
            db=db, model=DataBlock, object_id=input_data_block_ids[0]
        )
    elif (
        (not input_data_block_ids or len(input_data_block_ids) == 0)
        and input_transformation_block_ids
        and len(input_transformation_block_ids) == 1
    ):
        transformation_block = get_object_by_id(
            db=db,
            model=TransformationBlock,
            object_id=input_transformation_block_ids[0],
        )

        return get_base_data_block(
            db=db,
            input_data_block_ids=transformation_block.input_data_block_ids,
            input_transformation_block_ids=transformation_block.input_transformation_block_ids,
        )

    raise HTTPException(
        status_code=400,
        detail="Cannot find base data block",
    )


def get_base_transformation_block(
    db: Session, input_transformation_block_ids: list[str]
) -> TransformationBlock:
    if input_transformation_block_ids and len(input_transformation_block_ids) == 1:
        return get_object_by_id(
            db=db,
            model=TransformationBlock,
            object_id=input_transformation_block_ids[0],
        )

    raise HTTPException(
        status_code=400,
        detail="Cannot find base transformation block",
    )


def create_transformation_block(
    transformation_block: TransformationBlockCreate,
    db: Session,
):
    input_data_block_ids = transformation_block.input_data_block_ids
    input_transformation_block_ids = transformation_block.input_transformation_block_ids
    transformation_block_id = generate_object_id()
    base_data_block = get_base_data_block(
        db=db,
        input_data_block_ids=input_data_block_ids,
        input_transformation_block_ids=input_transformation_block_ids,
    )
    base_transformation_block = (
        get_base_transformation_block(
            db=db, input_transformation_block_ids=input_transformation_block_ids
        )
        if input_transformation_block_ids and len(input_transformation_block_ids) > 0
        else None
    )
    data_source_id = base_data_block.data_source_id
    args = dict(
        dbt_model=base_data_block.dbt_model
        if not base_transformation_block
        else base_transformation_block.dbt_model
    )

    for mp in transformation_block.macro_parameters:
        args[mp.id] = mp.value

    dbt_dir = get_dbt_dir(data_source_id=data_source_id)
    dbt_model_dir, dbt_model_name = create_model(
        db=db,
        name=transformation_block.name,
        dbt_dir=dbt_dir,
        transformation_block_id=transformation_block_id,
        base_data_block=base_data_block,
        base_transformation_block=base_transformation_block,
        transformation_catalog_item_id=transformation_block.transformation_catalog_item_id,
        args=args,
    )

    subprocess.call(
        f"dbt run --select {dbt_model_name} --profiles-dir .",
        cwd=dbt_dir,
        shell=True,
    )

    create_model_yaml(
        dbt_dir=dbt_dir, dbt_model_dir=dbt_model_dir, dbt_model_name=dbt_model_name
    )

    return data_source_id, transformation_block_id, dbt_model_name


def get_transformation_block_preview(
    transformation_block_id: str,
    limit_columns: int = None,
    limit_rows: int = None,
    db: Session = Depends(get_db),
):
    transformation_block = get_object_by_id(
        db=db, model=TransformationBlock, object_id=transformation_block_id
    )

    return get_table_preview(
        data_source_id=transformation_block.data_source_id,
        schema_name="dbt_kuwala",
        dataset_name="dbt_kuwala",
        table_name=transformation_block.dbt_model,
        columns=None,
        limit_columns=limit_columns,
        limit_rows=limit_rows,
        db=db,
    )
