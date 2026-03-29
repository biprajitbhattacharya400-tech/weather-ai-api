import redis
import json

try:
    redis_client = redis.Redis(
        host="localhost",
        port=6379,
        db=0,
        decode_responses=True
    )
    redis_client.ping()  # test connection
except Exception:
    redis_client = None


def get_cache(key):
    if not redis_client:
        return None

    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        return None

    return None


def set_cache(key, value, expiry=300):
    if not redis_client:
        return

    try:
        redis_client.setex(key, expiry, json.dumps(value))
    except Exception:
        pass