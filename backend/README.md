# OxiNews Stripe Integration Backend

This is the backend service for handling Stripe payments in the OxiNews application. It provides endpoints for creating checkout sessions, handling webhooks, and managing subscriptions.

## Features

- Create Stripe checkout sessions for Pro subscription
- Process Stripe webhook events
- Retrieve subscription status
- Create customer portal sessions for subscription management
- Update Supabase user records based on subscription events

## Prerequisites

- Python 3.8+
- Stripe account with a Pro subscription product set up
- Supabase project with user authentication

## Setup

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Fill in the environment variables in the `.env` file:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_stripe_price_id

# Supabase Configuration
SUPABASE_URL=https://your_supabase_project_url.supabase.co
SUPABASE_KEY=your_supabase_service_role_key

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

## Setting up Stripe

1. Create a Stripe account if you don't have one
2. In the Stripe Dashboard, create a new product:
   - Name: "OxiNews Pro"
   - Description: "Create custom pipelines tailored to your specific interests"
   - Price: $11/month (recurring)
   - Billing period: Monthly
3. Copy the Price ID and add it to your `.env` file
4. Get your API keys from the Stripe Dashboard and add them to your `.env` file
5. Set up webhook endpoints:
   - For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events
   - For production, add the webhook URL to your Stripe Dashboard: `https://your-backend-url.up.railway.app/api/webhook`

## Setting up Supabase

1. Run the SQL migration in `supabase/migrations/add_stripe_fields_to_users.sql` to add the required fields to the users table
2. Make sure you're using the service role key in your `.env` file to allow updating user records

## Running Locally

```bash
python wsgi.py
```

The server will start at http://localhost:5000

## Deploying to Railway

1. Create a new project in Railway
2. Connect your GitHub repository
3. Add the environment variables from your `.env` file
4. Deploy the application
5. Update the `REACT_APP_BACKEND_URL` in your frontend `.env` file to point to your Railway app URL

## API Endpoints

- `POST /api/create-checkout-session`: Create a Stripe checkout session
- `POST /api/webhook`: Handle Stripe webhook events
- `GET /api/subscription-status/<user_id>`: Get subscription status for a user
- `POST /api/create-portal-session`: Create a Stripe customer portal session

## Testing

1. Use Stripe's test mode for development
2. Test cards:
   - Success: 4242 4242 4242 4242
   - Requires Authentication: 4000 0025 0000 3155
   - Declined: 4000 0000 0000 0002
3. Test the webhook handling using the Stripe CLI:

```bash
stripe listen --forward-to http://localhost:5000/api/webhook
```

## Troubleshooting

- Check the logs for any errors
- Verify that your Stripe API keys are correct
- Make sure your webhook secret is properly configured
- Ensure that your Supabase service role key has the necessary permissions
