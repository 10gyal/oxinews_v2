import os
import stripe
import json
from flask import Blueprint, request, jsonify, current_app
from .supabase_client import supabase_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

# Create blueprint
stripe_bp = Blueprint('stripe', __name__, url_prefix='/api')

@stripe_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Check if user already exists in Stripe
        user_data = supabase_client.table('users').select('stripe_customer_id').eq('id', user_id).execute()
        
        customer_id = None
        if user_data.data and user_data.data[0].get('stripe_customer_id'):
            customer_id = user_data.data[0].get('stripe_customer_id')
        else:
            # Get user email from Supabase using the public view
            user_email_data = supabase_client.table('users').select('email').eq('id', user_id).execute()
            if not user_email_data.data or not user_email_data.data[0].get('email'):
                return jsonify({'error': 'User not found'}), 404
            
            user_email = user_email_data.data[0].get('email')
            
            # Create a new customer in Stripe
            customer = stripe.Customer.create(
                email=user_email,
                metadata={'user_id': user_id}
            )
            customer_id = customer.id
            
            # Update user in Supabase with Stripe customer ID
            try:
                supabase_client.rpc('update_user_stripe_info', {'user_id': user_id, 'stripe_customer_id_val': customer_id}).execute()
                current_app.logger.info(f"Successfully updated user {user_id} with stripe_customer_id {customer_id}")
            except Exception as e:
                current_app.logger.error(f"Error updating user with stripe_customer_id: {str(e)}")
                # Try direct update as fallback
                supabase_client.table('users').update({'stripe_customer_id': customer_id}).eq('id', user_id).execute()
                current_app.logger.info(f"Used fallback method to update user {user_id} with stripe_customer_id {customer_id}")
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': os.getenv('STRIPE_PRO_PRICE_ID'),
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{os.getenv('FRONTEND_URL')}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.getenv('FRONTEND_URL')}/pricing",
        )
        
        return jsonify({'url': checkout_session.url})
    
    except Exception as e:
        current_app.logger.error(f"Error creating checkout session: {str(e)}")
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    current_app.logger.info(f"Received webhook with signature: {sig_header[:10]}...")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        current_app.logger.info(f"Webhook event type: {event['type']}")
        current_app.logger.debug(f"Webhook payload: {json.dumps(event, indent=2)}")
    except ValueError as e:
        # Invalid payload
        current_app.logger.error(f"Invalid payload: {str(e)}")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        current_app.logger.error(f"Invalid signature: {str(e)}")
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'customer.subscription.created' or event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        subscription_id = subscription.get('id')
        subscription_status = subscription.get('status')
        
        current_app.logger.info(f"Processing {event['type']} event for customer: {customer_id}, subscription: {subscription_id}, status: {subscription_status}")
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        customer_id = invoice.get('customer')
        subscription_id = invoice.get('subscription')
        
        current_app.logger.info(f"Processing invoice.payment_succeeded event for customer: {customer_id}, subscription: {subscription_id}")
        
        if not subscription_id:
            current_app.logger.info("No subscription ID in invoice, skipping")
            return jsonify({'status': 'success'})
            
        # Get subscription details from Stripe
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            subscription_status = subscription.get('status')
            current_app.logger.info(f"Retrieved subscription status: {subscription_status}")
        except Exception as e:
            current_app.logger.error(f"Error retrieving subscription: {str(e)}")
            return jsonify({'error': str(e)}), 500
        
        if not customer_id:
            current_app.logger.error(f"Missing customer_id in {event['type']} event")
            return jsonify({'error': 'Missing customer_id'}), 400
            
        try:
            # Update user in Supabase
            current_app.logger.info(f"Looking up user with stripe_customer_id: {customer_id}")
            user_data = supabase_client.table('users').select('id, is_pro').eq('stripe_customer_id', customer_id).execute()
            
            if not user_data.data:
                current_app.logger.error(f"No user found with stripe_customer_id: {customer_id}")
                return jsonify({'error': 'User not found'}), 404
            
            user_id = user_data.data[0].get('id')
            is_pro = user_data.data[0].get('is_pro', False)
            
            # Only update if subscription is active and user is not already pro
            if subscription_status == 'active' and not is_pro:
                current_app.logger.info(f"Setting user {user_id} to pro status")
                
                try:
                    update_result = supabase_client.rpc('update_user_stripe_info', {
                        'user_id': user_id,
                        'stripe_subscription_id_val': subscription_id,
                        'is_pro_val': True
                    }).execute()
                    current_app.logger.info(f"Successfully updated user {user_id} with subscription details using RPC")
                except Exception as e:
                    current_app.logger.error(f"Error updating user with subscription details via RPC: {str(e)}")
                    # Try direct update as fallback
                    update_result = supabase_client.table('users').update({
                        'stripe_subscription_id': subscription_id,
                        'is_pro': True
                    }).eq('id', user_id).execute()
                    current_app.logger.info(f"Used fallback method to update user {user_id} with subscription details")
                
                current_app.logger.info(f"Update result: {json.dumps(update_result.data if hasattr(update_result, 'data') else {})}")
                current_app.logger.info(f"User {user_id} successfully updated with subscription {subscription_id} and is_pro=True")
            else:
                current_app.logger.info(f"No update needed for user {user_id}: subscription_status={subscription_status}, is_pro={is_pro}")
                
        except Exception as e:
            current_app.logger.error(f"Error processing {event['type']} event: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    elif event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        current_app.logger.info(f"Processing checkout.session.completed event, session ID: {session.get('id')}")
        
        # Get customer and subscription details
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        
        current_app.logger.info(f"Customer ID: {customer_id}, Subscription ID: {subscription_id}")
        
        if not customer_id:
            current_app.logger.error("Missing customer_id in checkout session")
            return jsonify({'error': 'Missing customer_id'}), 400
            
        if not subscription_id:
            current_app.logger.error("Missing subscription_id in checkout session")
            return jsonify({'error': 'Missing subscription_id'}), 400
        
        try:
            # Update user in Supabase
            current_app.logger.info(f"Looking up user with stripe_customer_id: {customer_id}")
            user_data = supabase_client.table('users').select('id').eq('stripe_customer_id', customer_id).execute()
            
            if not user_data.data:
                current_app.logger.error(f"No user found with stripe_customer_id: {customer_id}")
                return jsonify({'error': 'User not found'}), 404
            
            user_id = user_data.data[0].get('id')
            current_app.logger.info(f"Found user with ID: {user_id}, updating subscription details")
            
            # Update user subscription details
            try:
                update_result = supabase_client.rpc('update_user_stripe_info', {
                    'user_id': user_id,
                    'stripe_subscription_id_val': subscription_id,
                    'is_pro_val': True
                }).execute()
                current_app.logger.info(f"Successfully updated user {user_id} with subscription details using RPC")
            except Exception as e:
                current_app.logger.error(f"Error updating user with subscription details via RPC: {str(e)}")
                # Try direct update as fallback
                update_result = supabase_client.table('users').update({
                    'stripe_subscription_id': subscription_id,
                    'is_pro': True
                }).eq('id', user_id).execute()
                current_app.logger.info(f"Used fallback method to update user {user_id} with subscription details")
            
            current_app.logger.info(f"Update result: {json.dumps(update_result.data if hasattr(update_result, 'data') else {})}")
            current_app.logger.info(f"User {user_id} successfully updated with subscription {subscription_id} and is_pro=True")
        except Exception as e:
            current_app.logger.error(f"Error updating user subscription: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        customer_id = subscription.get('customer')
        current_app.logger.info(f"Processing customer.subscription.deleted event for customer: {customer_id}")
        
        if not customer_id:
            current_app.logger.error("Missing customer_id in subscription deleted event")
            return jsonify({'error': 'Missing customer_id'}), 400
            
        try:
            # Update user in Supabase
            current_app.logger.info(f"Looking up user with stripe_customer_id: {customer_id}")
            user_data = supabase_client.table('users').select('id').eq('stripe_customer_id', customer_id).execute()
            
            if not user_data.data:
                current_app.logger.error(f"No user found with stripe_customer_id: {customer_id}")
                return jsonify({'error': 'User not found'}), 404
            
            user_id = user_data.data[0].get('id')
            current_app.logger.info(f"Found user with ID: {user_id}, setting is_pro=False")
            
            # Update user subscription status
            try:
                update_result = supabase_client.rpc('update_user_pro_status', {
                    'user_id': user_id,
                    'is_pro_status': False
                }).execute()
                current_app.logger.info(f"Successfully updated user {user_id} pro status to False using RPC")
            except Exception as e:
                current_app.logger.error(f"Error updating user pro status via RPC: {str(e)}")
                # Try direct update as fallback
                update_result = supabase_client.table('users').update({
                    'is_pro': False
                }).eq('id', user_id).execute()
                current_app.logger.info(f"Used fallback method to update user {user_id} pro status to False")
            
            current_app.logger.info(f"Update result: {json.dumps(update_result.data if hasattr(update_result, 'data') else {})}")
            current_app.logger.info(f"User {user_id} successfully updated with is_pro=False")
        except Exception as e:
            current_app.logger.error(f"Error updating user subscription: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    current_app.logger.info("Webhook processed successfully")
    return jsonify({'status': 'success'})

@stripe_bp.route('/subscription-status/<user_id>', methods=['GET'])
def subscription_status(user_id):
    try:
        current_app.logger.info(f"Getting subscription status for user: {user_id}")
        
        # Get user from Supabase
        user_data = supabase_client.table('users').select('stripe_customer_id, stripe_subscription_id, is_pro').eq('id', user_id).execute()
        
        if not user_data.data:
            current_app.logger.error(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        user = user_data.data[0]
        current_app.logger.info(f"User data: {json.dumps(user)}")
        
        subscription_id = user.get('stripe_subscription_id')
        is_pro = user.get('is_pro', False)
        
        if not subscription_id:
            current_app.logger.info(f"No subscription ID found for user: {user_id}")
            return jsonify({
                'is_pro': is_pro,
                'status': 'no_subscription',
                'current_period_end': None
            })
        
        # Get subscription details from Stripe
        current_app.logger.info(f"Retrieving subscription details from Stripe: {subscription_id}")
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        response_data = {
            'is_pro': is_pro,
            'status': subscription.status,
            'current_period_end': subscription.current_period_end,
            'cancel_at_period_end': subscription.cancel_at_period_end
        }
        current_app.logger.info(f"Subscription status response: {json.dumps(response_data)}")
        
        return jsonify(response_data)
    
    except Exception as e:
        current_app.logger.error(f"Error getting subscription status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/update-pro-status/<user_id>', methods=['POST'])
def update_pro_status(user_id):
    """
    Admin endpoint to manually update a user's pro status.
    This is for testing and troubleshooting purposes.
    """
    try:
        data = request.json
        is_pro = data.get('is_pro', True)
        
        current_app.logger.info(f"Manually updating pro status for user {user_id} to {is_pro}")
        
        # Get user from Supabase
        user_data = supabase_client.table('users').select('id').eq('id', user_id).execute()
        
        if not user_data.data:
            current_app.logger.error(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        # Update user in Supabase
        try:
            update_result = supabase_client.rpc('update_user_pro_status', {
                'user_id': user_id,
                'is_pro_status': is_pro
            }).execute()
            current_app.logger.info(f"Successfully updated user {user_id} pro status to {is_pro} using RPC")
        except Exception as e:
            current_app.logger.error(f"Error updating user pro status via RPC: {str(e)}")
            # Try direct update as fallback
            update_result = supabase_client.table('users').update({
                'is_pro': is_pro
            }).eq('id', user_id).execute()
            current_app.logger.info(f"Used fallback method to update user {user_id} pro status to {is_pro}")
        
        current_app.logger.info(f"Manual update result: {json.dumps(update_result.data if hasattr(update_result, 'data') else {})}")
        
        return jsonify({
            'status': 'success',
            'user_id': user_id,
            'is_pro': is_pro
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating pro status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@stripe_bp.route('/create-portal-session', methods=['POST'])
def create_portal_session():
    try:
        data = request.json
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        
        # Get user from Supabase
        user_data = supabase_client.table('users').select('stripe_customer_id').eq('id', user_id).execute()
        
        if not user_data.data:
            return jsonify({'error': 'User not found'}), 404
        
        customer_id = user_data.data[0].get('stripe_customer_id')
        
        if not customer_id:
            return jsonify({'error': 'No Stripe customer found for this user'}), 404
        
        try:
            # Create portal session
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=f"{os.getenv('FRONTEND_URL')}/dashboard",
            )
            
            return jsonify({'url': session.url})
        except stripe.error.InvalidRequestError as e:
            # Check if this is the portal configuration error
            if "No configuration provided" in str(e) and "customer portal settings" in str(e):
                current_app.logger.error("Stripe Customer Portal not configured: " + str(e))
                return jsonify({
                    'error': 'Stripe Customer Portal not configured. Please contact support.',
                    'details': 'Admin needs to configure the Customer Portal in Stripe Dashboard.',
                    'admin_action_required': True
                }), 400
            else:
                raise e
    
    except Exception as e:
        current_app.logger.error(f"Error creating portal session: {str(e)}")
        return jsonify({'error': str(e)}), 500
