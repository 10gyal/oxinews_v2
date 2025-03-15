"""
Test script for the run_pipeline microservice.
"""
import requests
import argparse
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_health(base_url):
    """
    Test the health check endpoint.
    """
    url = f"{base_url}/health"
    print(f"Testing health check endpoint: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_run_pipeline(base_url, pipeline_id):
    """
    Test the run pipeline endpoint.
    """
    url = f"{base_url}/run?pipeline_id={pipeline_id}"
    print(f"Testing run pipeline endpoint: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_run_new_pipeline(base_url, pipeline_id):
    """
    Test the run new pipeline endpoint.
    """
    url = f"{base_url}/run_new?pipeline_id={pipeline_id}"
    print(f"Testing run new pipeline endpoint: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_schedule_check(base_url):
    """
    Test the schedule check endpoint.
    """
    url = f"{base_url}/schedule_check"
    print(f"Testing schedule check endpoint: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test the run_pipeline microservice.')
    parser.add_argument('--base-url', type=str, default='http://localhost:5000', help='Base URL of the microservice')
    parser.add_argument('--pipeline-id', type=str, help='Pipeline ID to test')
    parser.add_argument('--test-all', action='store_true', help='Test all endpoints')
    parser.add_argument('--test-health', action='store_true', help='Test health check endpoint')
    parser.add_argument('--test-run', action='store_true', help='Test run pipeline endpoint')
    parser.add_argument('--test-run-new', action='store_true', help='Test run new pipeline endpoint')
    parser.add_argument('--test-schedule', action='store_true', help='Test schedule check endpoint')
    
    args = parser.parse_args()
    
    # If no specific tests are specified, test health by default
    if not (args.test_all or args.test_health or args.test_run or args.test_run_new or args.test_schedule):
        args.test_health = True
    
    # Test health check endpoint
    if args.test_all or args.test_health:
        test_health(args.base_url)
        print()
    
    # Test run pipeline endpoint
    if (args.test_all or args.test_run) and args.pipeline_id:
        test_run_pipeline(args.base_url, args.pipeline_id)
        print()
    elif (args.test_all or args.test_run) and not args.pipeline_id:
        print("Pipeline ID is required for testing run pipeline endpoint")
        print()
    
    # Test run new pipeline endpoint
    if (args.test_all or args.test_run_new) and args.pipeline_id:
        test_run_new_pipeline(args.base_url, args.pipeline_id)
        print()
    elif (args.test_all or args.test_run_new) and not args.pipeline_id:
        print("Pipeline ID is required for testing run new pipeline endpoint")
        print()
    
    # Test schedule check endpoint
    if args.test_all or args.test_schedule:
        test_schedule_check(args.base_url)
        print()

if __name__ == '__main__':
    main()
