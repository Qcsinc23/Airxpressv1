// app/api/webhook/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

import { getConvexClient } from '../../../lib/convex/client';
// Webhook secret from Clerk Dashboard - will be validated at runtime
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

type ClerkWebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    created_at: number;
    updated_at: number;
    public_metadata: Record<string, any>;
    private_metadata: Record<string, any>;
  };
};

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret at runtime
    if (!WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Error occurred -- missing svix headers' }, { status: 400 });
    }

    // Get body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create new Svix instance with webhook secret
    const wh = new Webhook(WEBHOOK_SECRET!);

    let evt: ClerkWebhookEvent;

    // Verify payload with headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Error occurred -- invalid signature' }, { status: 400 });
    }

    // Handle the webhook
    const { type, data } = evt;
    console.log('Clerk webhook received:', type, 'for user:', data.id);

    try {
      switch (type) {
        case 'user.created':
          await handleUserCreated(data);
          console.log('User created successfully in Convex:', data.id);
          break;
          
        case 'user.updated':
          await handleUserUpdated(data);
          console.log('User updated successfully in Convex:', data.id);
          break;
          
        case 'user.deleted':
          await handleUserDeleted(data.id);
          console.log('User deleted successfully from Convex:', data.id);
          break;
          
        default:
          console.log('Unhandled webhook type:', type);
      }

      return NextResponse.json({ message: 'Webhook processed successfully' });
      
    } catch (convexError) {
      console.error('Convex operation failed:', convexError);
      return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handler functions
async function handleUserCreated(userData: ClerkWebhookEvent['data']) {
  const primaryEmail = userData.email_addresses.find(email => 
    email.id === userData.email_addresses[0]?.id
  )?.email_address;

  if (!primaryEmail) {
    throw new Error('No primary email found for user');
  }

  // Determine default role based on email domain or metadata
  let role: 'customer' | 'agent' | 'ops' | 'admin' = 'customer';
  
  // Check public metadata for role assignment
  if (userData.public_metadata?.role) {
    role = userData.public_metadata.role as typeof role;
  }
  
  // Auto-assign admin role for certain email domains (configure as needed)
  const adminDomains = ['admin.airxpress.com', 'airxpress.com'];
  const emailDomain = primaryEmail.split('@')[1];
  if (adminDomains.includes(emailDomain)) {
    role = 'admin';
  }

  const convex = getConvexClient();
  await convex.mutation(api.functions.users.createUser, {
    clerkId: userData.id,
    email: primaryEmail,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    imageUrl: userData.image_url || '',
    role,
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      language: 'en',
      timezone: 'America/New_York',
    },
  });
}

async function handleUserUpdated(userData: ClerkWebhookEvent['data']) {
  const primaryEmail = userData.email_addresses.find(email => 
    email.id === userData.email_addresses[0]?.id
  )?.email_address;

  if (!primaryEmail) {
    throw new Error('No primary email found for user');
  }

  // Check if role was updated in metadata
  let role: 'customer' | 'agent' | 'ops' | 'admin' | undefined;
  if (userData.public_metadata?.role) {
    role = userData.public_metadata.role as typeof role;
  }

  const convex = getConvexClient();
  await convex.mutation(api.functions.users.updateUser, {
    clerkId: userData.id,
    email: primaryEmail,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    imageUrl: userData.image_url || '',
    ...(role && { role }),
  });
}

async function handleUserDeleted(userId: string) {
  const convex = getConvexClient();
  await convex.mutation(api.functions.users.deleteUser, {
    clerkId: userId,
  });
}

// GET method for webhook verification (some webhook services require this)
export async function GET() {
  return NextResponse.json({ message: 'Clerk webhook endpoint active' });
}
