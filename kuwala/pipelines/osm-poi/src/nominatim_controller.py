import json
import logging
import os
from time import sleep

import requests


def get_geo_json_by_id(df_ids):
    proxy = os.environ.get("PROXY_ADDRESS")
    proxies = dict(http=proxy, https=proxy)

    test_request = requests.get("https://api.ipify.org?format=json", proxies=proxies)

    if test_request.ok:
        logging.info("Successfully connected to proxy")
    else:
        logging.info("Couldn't connect to proxy.")

    for index, row in df_ids.iterrows():
        geo_json = get_geo_json(row.osm_id, proxies=proxies)
        df_ids.at[index, "geo_json"] = json.dumps(geo_json)

    return df_ids


def get_geo_json(relation_id, proxies):
    max_sleep_time = 120
    sleep_time = 1
    geo_json = None

    while not geo_json and (sleep_time < max_sleep_time):
        # noinspection PyBroadException
        try:
            if result := requests.get(
                f"https://nominatim.openstreetmap.org/lookup?osm_ids=R{relation_id}&polygon_geojson=1&format=json",
                proxies=proxies,
            ):
                result_json = result.json()

                if len(result_json) > 0 and "geojson" in result_json[0]:
                    geo_json = result_json[0]["geojson"]

                sleep_time = max_sleep_time
            else:
                sleep(sleep_time)
                sleep_time *= 2
        except Exception:
            sleep(sleep_time)
            sleep_time *= 2

    if not geo_json:
        logging.warning(f"Could not fetch GeoJSON for relation {relation_id}")

    return geo_json
