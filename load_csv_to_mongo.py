'''
Script: load_csv_to_mongo.py

Reads CSV files specified in the .env file and loads their contents into a MongoDB database. This script is designed to handle time-series data by creating MongoDB time-series collections.

Usage:
    python load_csv_to_mongo.py

Make sure MongoDB is running and accessible at the given URI.
'''

import os
import pandas as pd
from pymongo import MongoClient
from pymongo.errors import CollectionInvalid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = 'turbine'
CSV_FILES = {
    'TURBINE1_CSV_PATH': 'collection1',
    'TURBINE2_CSV_PATH': 'collection2'
}

def load_csv_to_mongo(csv_path: str, db, collection_name: str):
    """
    Load data from a CSV file into the specified MongoDB collection.

    :param csv_path: Path to the CSV file.
    :param db: MongoDB database instance.
    :param collection_name: Name of the collection to insert data into.
    """
    try:
        # Read CSV, use first row as header, skip the second row
        df = pd.read_csv(csv_path, delimiter=';', decimal=',', header=0, skiprows=[1])

        # Remove leading/trailing spaces from column headers
        df.columns = df.columns.str.strip()

        # Identify the first column as the timestamp column
        timestamp_column_name = df.columns[0]

        # Convert the first column to datetime
        df[timestamp_column_name] = pd.to_datetime(df[timestamp_column_name], format='%d.%m.%Y, %H:%M', errors='coerce')
        df.dropna(subset=[timestamp_column_name], inplace=True) # Drop rows where date conversion failed

        # Rename the timestamp column to 'timestamp' for the time-series collection
        df.rename(columns={timestamp_column_name: 'timestamp'}, inplace=True)

        # Ensure all column names are strings for MongoDB
        df.columns = [str(c) for c in df.columns]

        # Convert DataFrame to list of dictionaries
        records = df.to_dict(orient='records')
        if records:
            # Insert records into MongoDB collection
            result = db[collection_name].insert_many(records)
            print(f"Inserted {len(result.inserted_ids)} documents into '{collection_name}'")
        else:
            print(f"No records found in {csv_path} to insert.")
    except Exception as e:
        print(f"Error loading {csv_path} into MongoDB: {e}")


def main():
    # Initialize MongoDB client
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]

    # Iterate over CSV files and load
    for env_var, coll_name in CSV_FILES.items():
        csv_file = os.getenv(env_var)
        if csv_file and os.path.isfile(csv_file):
            print(f"Preparing to load {csv_file} into collection '{coll_name}'...")
            
            # Drop the collection if it exists to ensure we create it with the correct options
            if coll_name in db.list_collection_names():
                print(f"Dropping existing collection '{coll_name}'")
                db[coll_name].drop()

            # Create time-series collection
            try:
                print(f"Creating time-series collection '{coll_name}'")
                db.create_collection(
                    coll_name,
                    timeseries={'timeField': 'timestamp'}
                )
            except CollectionInvalid:
                # This may happen if another process created it in the meantime.
                print(f"Collection '{coll_name}' already exists. Attempting to proceed.")
            except Exception as e:
                print(f"Error creating collection '{coll_name}': {e}")
                continue # Skip to the next file

            load_csv_to_mongo(csv_file, db, coll_name)
        else:
            print(f"File not found or environment variable {env_var} not set. Skipping.")

    # Close the client connection
    client.close()


if __name__ == '__main__':
    main()
