import logging
from bson import ObjectId
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import Config

logger = logging.getLogger("codeguard.database")

_client = None
_db = None
_is_mock = False

def get_database():
    global _client, _db, _is_mock
    if _db is not None:
        return _db

    mongo_uri = Config.MONGO_URI
    db_name = Config.MONGO_DB_NAME

    try:
        # Try real MongoDB with 5000ms timeout
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        _client = client
        _db = _client[db_name]
        _is_mock = False
        logger.info(f"Connected successfully to MongoDB at {mongo_uri} (Database: {db_name})")
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        logger.warning(f"Could not connect to MongoDB server ({e}). Falling back to in-memory mongomock database.")
        try:
            import mongomock
            _client = mongomock.MongoClient()
            _db = _client[db_name]
            _is_mock = True
            logger.info("Initialized in-memory mongomock database for seamless local execution.")
        except ImportError:
            raise RuntimeError("Neither MongoDB nor mongomock is available. Please install dependencies.")

    _init_indexes(_db)
    return _db

def _init_indexes(db):
    try:
        # Indexes for fast lookup & integrity
        db.users.create_index([("email", ASCENDING)], unique=True)
        db.submissions.create_index([("id", ASCENDING)], unique=True)
        db.submissions.create_index([("assignmentId", ASCENDING)])
        db.submissions.create_index([("studentId", ASCENDING)])
        db.assignments.create_index([("id", ASCENDING)], unique=True)
        db.similarity_results.create_index([("id", ASCENDING)], unique=True)
        db.similarity_results.create_index([("submissionAId", ASCENDING), ("submissionBId", ASCENDING)])
        db.reviews.create_index([("id", ASCENDING)], unique=True)
        db.clusters.create_index([("id", ASCENDING)], unique=True)
        db.timeline_events.create_index([("id", ASCENDING)], unique=True)
        db.timeline_events.create_index([("timestamp", ASCENDING)])
        db.settings.create_index([("key", ASCENDING)], unique=True)
        # Coding Activity Events indexes (student monitoring)
        db.coding_activity_events.create_index([("studentId", ASCENDING)])
        db.coding_activity_events.create_index([("questionId", ASCENDING)])
        db.coding_activity_events.create_index([("submissionId", ASCENDING)])
        db.coding_activity_events.create_index([("sessionId", ASCENDING)])
        db.coding_activity_events.create_index([("timestampEpoch", ASCENDING)])
        db.coding_activity_events.create_index(
            [("studentId", ASCENDING), ("questionId", ASCENDING), ("timestampEpoch", ASCENDING)]
        )
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")

def serialize_doc(doc):
    """Recursively converts MongoDB BSON documents/lists with ObjectId into JSON serializable dicts."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        res = {}
        for k, v in doc.items():
            if k == "_id":
                res["_id"] = str(v)
            elif isinstance(v, ObjectId):
                res[k] = str(v)
            elif isinstance(v, (dict, list)):
                res[k] = serialize_doc(v)
            else:
                res[k] = v
        return res
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc

def is_mock_db():
    return _is_mock
