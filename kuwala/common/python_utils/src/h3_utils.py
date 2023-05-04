import geojson
import h3


def polyfill_polygon(polygon: geojson.Polygon, resolution):
    return h3.polyfill(
        dict(type=polygon.type, coordinates=polygon.coordinates),
        resolution,
        geo_json_conformant=True,
    )
