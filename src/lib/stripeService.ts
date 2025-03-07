/**
 * Stripe Service
 * 
 * This service handles all interactions with the Stripe backend API.
 */

// Get the backend URL from environment variables
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://oxinews-stripe-backend-production.up.railway.app';

/**
 * Create a Stripe checkout session for a new subscription
 * @param userId The user's ID
 * @returns The checkout session URL
 */
export async function createCheckoutSession(userId: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a Stripe customer portal session for managing subscriptions
 * @param userId The user's ID
 * @returns The portal session URL
 */
export async function createPortalSession(userId: string): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create portal session');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

/**
 * Get the user's subscription status
 * @param userId The user's ID
 * @returns The subscription status
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/subscription-status/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}

/**
 * Subscription status interface
 */
export interface SubscriptionStatus {
  is_pro: boolean;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'no_subscription';
  current_period_end: number | null;
  cancel_at_period_end?: boolean;
}
