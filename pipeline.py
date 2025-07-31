"""
Pipeline script for the Turbine project.

Functionality:
1. Verify that the CSV files declared in the environment (.env) really exist.
2. Load the CSV data into MongoDB (delegates to the existing `load_csv_to_mongo` script).
3. Start the FastAPI backend server.

Usage::
    python pipeline.py [--host 0.0.0.0] [--port 8000]

The script will abort early with a clear error message if any of the CSV files are not found.
"""

import os
import sys
import logging
from pathlib import Path
from typing import List

from dotenv import load_dotenv
import uvicorn

# Import the loader's main function.  We rely on its internal logic for the heavy lifting.
import load_csv_to_mongo

# ---------------------------------------------------------------------------
# Configuration & logging
# ---------------------------------------------------------------------------

# Load env vars from .env (same behaviour as other project scripts)
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
logger = logging.getLogger("pipeline")

# The env-var → collection mapping is defined in load_csv_to_mongo.CSV_FILES.
CSV_ENV_VARS = list(load_csv_to_mongo.CSV_FILES.keys())

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _validate_csv_files() -> List[Path]:
    """Make sure the CSV paths exist on disk.

    Returns a list of Path objects pointing at the validated CSV files.
    Exits the program with code 1 if any file is missing.
    """
    missing_vars = []
    missing_files = []
    validated_paths = []

    for env_var in CSV_ENV_VARS:
        value = os.getenv(env_var)
        if not value:
            missing_vars.append(env_var)
            continue

        path = Path(value).expanduser().resolve()
        if not path.is_file():
            missing_files.append(str(path))
            continue

        validated_paths.append(path)

    if missing_vars or missing_files:
        if missing_vars:
            logger.error(
                "Required environment variables are not set: %s",
                ", ".join(missing_vars),
            )
        if missing_files:
            logger.error(
                "CSV files not found on disk: %s",
                ", ".join(missing_files),
            )
        sys.exit(1)

    return validated_paths

# ---------------------------------------------------------------------------
# Main entrypoint
# ---------------------------------------------------------------------------

def main(host: str = "0.0.0.0", port: int = 8000):
    # 1. Check that CSV files exist.
    logger.info("Validating CSV paths declared in environment variables …")
    validated_paths = _validate_csv_files()
    logger.info("All CSV files found: %s", ", ".join(map(str, validated_paths)))

    # 2. Load data into MongoDB.
    logger.info("Loading CSV data into MongoDB …")
    # Re-use the existing script's public main() so we don't duplicate logic.
    load_csv_to_mongo.main()

    # 3. Launch the FastAPI server.
    logger.info("Starting backend server …")
    uvicorn.run("main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run the full Turbine pipeline → load data then start API server.")
    parser.add_argument("--host", default="0.0.0.0", help="Host bind address for uvicorn (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port for uvicorn (default: 8000)")

    args = parser.parse_args()
    main(host=args.host, port=args.port)
