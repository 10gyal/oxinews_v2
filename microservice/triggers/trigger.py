"""
curl -X GET "http://127.0.0.1:5000/trigger?pipeline_id=your_pipeline_id"
"""


from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Supabase setup
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(supabase_url, supabase_key)

@app.route('/trigger', methods=['GET'])
def trigger_pipeline():
    """
    GET endpoint that retrieves a row for the given pipeline_id where delivery_count is 0.
    
    Query Parameters:
    - pipeline_id: The ID of the pipeline to retrieve
    
    Returns:
    - JSON response with the pipeline data or an error message
    """
    pipeline_id = request.args.get('pipeline_id')
    
    if not pipeline_id:
        return jsonify({'error': 'Missing required parameter: pipeline_id'}), 400
    
    try:
        # Query Supabase for the pipeline config with the given pipeline_id and delivery_count = 0
        response = supabase.table('pipeline_configs') \
            .select('*') \
            .eq('pipeline_id', pipeline_id) \
            .eq('delivery_count', 0) \
            .execute()
        
        data = response.data
        
        if data and len(data) > 0:
            return jsonify({'success': True, 'data': data[0]})
        else:
            return jsonify({'success': False, 'error': 'No matching pipeline found with delivery_count = 0'}), 404
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
