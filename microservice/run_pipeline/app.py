"""
Flask application for the run_pipeline microservice.
"""
import logging
import json
from flask import Flask, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import db_utils
import pipeline_executor
import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize Flask app
app = Flask(__name__)

# Initialize scheduler
scheduler = BackgroundScheduler()

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'run_pipeline'
    })

@app.route('/run', methods=['GET'])
def run_pipeline():
    """
    Run a pipeline by pipeline_id.
    
    Query Parameters:
    - pipeline_id: The ID of the pipeline to run
    
    Returns:
    - JSON response with the result of the pipeline execution
    """
    pipeline_id = request.args.get('pipeline_id')
    
    if not pipeline_id:
        return jsonify({
            'success': False,
            'error': 'Missing required parameter: pipeline_id'
        }), 400
    
    try:
        # Get pipeline configuration
        pipeline_config = db_utils.get_pipeline_config(pipeline_id)
        
        if not pipeline_config:
            return jsonify({
                'success': False,
                'error': f'Pipeline not found: {pipeline_id}'
            }), 404
        
        # Execute pipeline
        result = pipeline_executor.execute_pipeline(pipeline_config)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error running pipeline {pipeline_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/run_new', methods=['GET'])
def run_new_pipeline():
    """
    Run a new pipeline (delivery_count = 0) by pipeline_id.
    
    Query Parameters:
    - pipeline_id: The ID of the pipeline to run
    
    Returns:
    - JSON response with the result of the pipeline execution
    """
    pipeline_id = request.args.get('pipeline_id')
    
    if not pipeline_id:
        return jsonify({
            'success': False,
            'error': 'Missing required parameter: pipeline_id'
        }), 400
    
    try:
        # Get pipeline configuration with delivery_count = 0
        pipeline_config = db_utils.get_pipeline_config(pipeline_id, delivery_count=0)
        
        if not pipeline_config:
            return jsonify({
                'success': False,
                'error': f'New pipeline not found: {pipeline_id}'
            }), 404
        
        # Execute pipeline
        result = pipeline_executor.execute_pipeline(pipeline_config)
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error running new pipeline {pipeline_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/schedule_check', methods=['GET'])
def schedule_check():
    """
    Check for scheduled pipelines and run them.
    
    Returns:
    - JSON response with the results of pipeline executions
    """
    try:
        result = pipeline_executor.run_scheduled_pipelines()
        return jsonify(result)
    except Exception as e:
        logging.error(f"Error checking scheduled pipelines: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def schedule_job():
    """
    Job to check for scheduled pipelines.
    """
    with app.app_context():
        try:
            logging.info("Running scheduled job to check pipelines")
            pipeline_executor.run_scheduled_pipelines()
        except Exception as e:
            logging.error(f"Error in scheduled job: {str(e)}")

def init_scheduler():
    """
    Initialize the scheduler to run the schedule_job function every minute.
    """
    if scheduler.running:
        scheduler.shutdown()
    
    scheduler.add_job(schedule_job, 'interval', minutes=1)
    scheduler.start()
    logging.info("Scheduler started")

@app.before_first_request
def before_first_request():
    """
    Initialize the scheduler before the first request.
    """
    init_scheduler()

@app.teardown_appcontext
def teardown_appcontext(exception=None):
    """
    Shutdown the scheduler when the application context is torn down.
    """
    if scheduler.running:
        scheduler.shutdown()
        logging.info("Scheduler shutdown")

if __name__ == '__main__':
    # Initialize scheduler
    init_scheduler()
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=config.PORT,
        debug=config.DEBUG
    )
