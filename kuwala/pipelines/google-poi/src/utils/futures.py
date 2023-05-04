import asyncio

from quart import jsonify


def execute_futures(items, execute, parse):
    loop = asyncio.get_event_loop()
    futures = [loop.run_in_executor(None, execute, item) for item in items]
    results = loop.run_until_complete(asyncio.gather(*futures))
    parsed = [parse(result) for result in results]
    return jsonify({"success": True, "data": parsed})
