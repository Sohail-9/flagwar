import { NextRequest, NextResponse } from 'next/server';
import { getTeamById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      team_id,
      amount_dollars = 1,
      contributor_name = 'Anonymous Backer',
      handle,
      message,
      referral_slug,
    } = body;

    const team = await getTeamById(team_id);
    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Fixed conversion rate $1 = 85 INR (8500 paise)
    const amountINR = Math.round(Number(amount_dollars) * 85);
    const amountPaise = amountINR * 100;

    if (!keyId || !keySecret) {
      // In demo mode without Razorpay API keys, return mock order for client-side sandbox
      return NextResponse.json({
        success: true,
        is_demo: true,
        order_id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount_inr: amountINR,
        amount_paise: amountPaise,
        currency: 'INR',
        key_id: keyId || 'rzp_test_placeholder',
        team,
        notes: {
          team_id: team.id,
          contributor_name,
          handle,
          message,
          referral_slug,
        },
      });
    }

    // Call Razorpay API to generate order
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          team_id: team.id,
          contributor_name,
          handle: handle || '',
          message: message || '',
          referral_slug: referral_slug || '',
        },
      }),
    });

    const orderData = await response.json();
    if (!response.ok) {
      throw new Error(orderData.error?.description || 'Failed creating Razorpay order');
    }

    return NextResponse.json({
      success: true,
      order_id: orderData.id,
      amount_inr: amountINR,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: keyId,
      team,
    });
  } catch (err: any) {
    console.error('Razorpay order error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
