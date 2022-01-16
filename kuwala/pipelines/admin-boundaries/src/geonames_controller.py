import os
import zipfile
from kuwala.common.python_utils.src.file_converter import txt_to_csv
from kuwala.common.python_utils.src.FileDownloader import download_file
from pyspark.sql.functions import split
from pyspark.sql.types import DateType, DoubleType, IntegerType, StructType, StringType


def download_geonames_file(file_path):
    download_file(url='https://download.geonames.org/export/dump/cities15000.zip', path=file_path)

    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(file_path.split('/cities15000.zip')[0])

    os.remove(file_path)


def get_schema():
    return StructType() \
        .add('geoname_id', IntegerType(), False) \
        .add('name', StringType(), False) \
        .add('ascii_name', StringType(), False) \
        .add('alternate_names', StringType(), False) \
        .add('lat', DoubleType(), False) \
        .add('lng', DoubleType(), False) \
        .add('feature_class', StringType(), False) \
        .add('feature_code', StringType(), False) \
        .add('country_code', StringType(), False) \
        .add('alternate_country_codes', StringType(), True) \
        .add('admin_1_code', StringType(), False) \
        .add('admin_2_code', StringType(), True) \
        .add('admin_3_code', StringType(), True) \
        .add('admin_4_code', StringType(), True) \
        .add('population', IntegerType(), False) \
        .add('elevation', IntegerType(), True) \
        .add('digital_elevation_model', IntegerType(), False) \
        .add('timezone', StringType(), False) \
        .add('modification_date', DateType(), False)


def get_geonames_cities(sp):
    script_dir = os.path.dirname(__file__)
    file_path_zip = os.path.join(script_dir, '../../../tmp/kuwala/admin_boundary_files/cities15000.zip')
    file_path_txt = file_path_zip.replace('.zip', '.txt')
    file_path_csv = file_path_zip.replace('.zip', '.csv')
    file_path_parquet = file_path_zip.replace('cities15000.zip', 'cities_15000.parquet')

    download_geonames_file(file_path_zip)
    txt_to_csv(file_path=file_path_txt)

    df = sp.read.csv(file_path_csv, schema=get_schema())
    df = df.withColumn('alternate_names', split('alternate_names', ',')) \
        .withColumn('alternate_country_codes', split('alternate_country_codes', ','))

    df.write.mode('overwrite').parquet(file_path_parquet)
    os.remove(file_path_txt)
    os.remove(file_path_csv)
