"""Emit bounded operational events without retaining request identifiers."""
import json
import logging
from urllib.parse import urlsplit

class AccessFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        args = record.args
        if not isinstance(args, tuple) or len(args) != 5:
            return False
        _, _, target, _, status = args
        path = urlsplit(str(target)).path
        if path not in {"/health", "/api/v1/ready", "/metrics"}:
            return False
        record.msg = json.dumps({"event":"probe", "route":path, "status":status})
        record.args = ()
        return True

def configure_access_logging() -> None:
    logger = logging.getLogger("uvicorn.access")
    if not any(isinstance(f, AccessFilter) for f in logger.filters):
        logger.addFilter(AccessFilter())
