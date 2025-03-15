"""
Utility functions for handling time and schedule-related operations.
"""
from datetime import datetime, timedelta
import pytz

def should_run_pipeline(schedule, delivery_time, last_delivered, lead_time_minutes=30):
    """
    Determine if a pipeline should be run based on its schedule and last delivery time.
    
    Args:
        schedule (str): The schedule type ('daily', 'weekly', or 'monthly')
        delivery_time (str): The time of day for delivery (format: 'HH:MM:SS')
        last_delivered (str): ISO format datetime of last delivery
        lead_time_minutes (int): Minutes before delivery time to run the pipeline
        
    Returns:
        bool: True if the pipeline should be run, False otherwise
    """
    now = datetime.now(pytz.UTC)
    
    # Parse delivery time
    hour, minute, second = map(int, delivery_time.split(':'))
    
    # Calculate target delivery datetime
    target_date = now.date()
    target_time = datetime.combine(target_date, datetime.min.time().replace(hour=hour, minute=minute, second=second))
    target_time = pytz.UTC.localize(target_time)
    
    # Adjust for lead time
    run_time = target_time - timedelta(minutes=lead_time_minutes)
    
    # If run_time is in the past for today, it means we're looking at tomorrow's delivery
    if run_time < now:
        run_time += timedelta(days=1)
    
    # Parse last delivered time
    if last_delivered:
        last_delivered_dt = datetime.fromisoformat(last_delivered.replace('Z', '+00:00'))
    else:
        # If never delivered, return True to run it
        return True
    
    # Check if it's time to run based on schedule
    if schedule == 'daily':
        # Check if it's been delivered today already
        return last_delivered_dt.date() < now.date() and now >= run_time
    
    elif schedule == 'weekly':
        # Check if it's been a week since last delivery
        week_ago = now - timedelta(days=7)
        return last_delivered_dt <= week_ago and now >= run_time
    
    elif schedule == 'monthly':
        # Check if it's been a month (30 days) since last delivery
        month_ago = now - timedelta(days=30)
        return last_delivered_dt <= month_ago and now >= run_time
    
    return False

def get_current_utc_timestamp():
    """
    Get the current UTC timestamp in ISO format.
    
    Returns:
        str: Current UTC timestamp in ISO format
    """
    return datetime.now(pytz.UTC).isoformat()
