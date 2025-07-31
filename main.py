from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/get")
def read_root():
    logger.info("Backend /get endpoint was hit")
    return {"message": "Hello from backend"}

# Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = 'turbine'
COLLECTIONS_MAPPING = {
    'turbine1': 'collection1',
    'turbine2': 'collection2'
}

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DATABASE_NAME]

@app.get("/turbine/{turbine_id}")
def get_turbine_data(turbine_id: str, start_time: datetime = None, end_time: datetime = None):
    logger.info(f"Request received for turbine_id: {turbine_id}")
    logger.info(f"Query parameters - start_time: {start_time}, end_time: {end_time}")

    if start_time and end_time and start_time > end_time:
        logger.warning(f"Invalid date range for turbine_id '{turbine_id}': start_time > end_time.")
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")

    if turbine_id not in COLLECTIONS_MAPPING:
        logger.warning(f"Invalid turbine_id '{turbine_id}' requested.")
        raise HTTPException(status_code=404, detail="Turbine not found")

    collection_name = COLLECTIONS_MAPPING[turbine_id]
    db = get_db()
    collection = db[collection_name]

    query = {}
    if start_time and end_time:
        query['timestamp'] = {'$gte': start_time, '$lte': end_time}
    elif start_time:
        query['timestamp'] = {'$gte': start_time}
    elif end_time:
        query['timestamp'] = {'$lte': end_time}
    
    logger.info(f"Executing query on collection '{collection_name}': {query}")

    try:
        data = list(collection.find(query, {'_id': 0})) # Exclude the '_id' field
        logger.info(f"Found {len(data)} records for turbine_id '{turbine_id}'")
        return data
    except Exception as e:
        logger.error(f"An error occurred while fetching data for turbine_id '{turbine_id}': {e}")
        raise HTTPException(status_code=500, detail=str(e)) 