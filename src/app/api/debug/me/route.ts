import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanityClient } from '@/lib/sanity.client';

// Opt out of caching so it always returns the latest state
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const status: any = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {},
    env: {},
  };

  // 1. Check DB Connection (Prisma)
  try {
    const userCount = await db.user.count();
    status.services.database = { 
      status: 'connected', 
      provider: 'prisma', 
      metrics: { users: userCount } 
    };
  } catch (error: any) {
    status.services.database = { 
      status: 'error', 
      message: error?.message || 'Unknown database error' 
    };
    status.status = 'error';
  }

  // 2. Check Sanity Connection
  try {
    const sanityCheck = await sanityClient.fetch(`count(*[_type == "course"])`);
    status.services.sanity = { 
      status: 'connected', 
      metrics: { courses: sanityCheck } 
    };
  } catch (error: any) {
    status.services.sanity = { 
      status: 'error', 
      message: error?.message || 'Unknown sanity error' 
    };
    status.status = 'error';
  }

  // 3. Environment Variables (Obfuscated)
  const envKeys = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'SANITY_API_READ_TOKEN',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'MERCADOPAGO_ACCESS_TOKEN',
    'NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
  ];

  envKeys.forEach((key) => {
    const val = process.env[key];
    if (!val) {
      status.env[key] = 'MISSING ❌';
    } else {
      // Obfuscate the value, show only first 4 and last 4 characters if it's long enough
      if (val.length > 10) {
        status.env[key] = `PRESENT ✅ (starts: ${val.substring(0, 4)}... ends: ${val.substring(val.length - 4)}, length: ${val.length})`;
      } else {
        status.env[key] = `PRESENT ✅ (length: ${val.length})`;
      }
    }
  });

  return NextResponse.json(status);
}
