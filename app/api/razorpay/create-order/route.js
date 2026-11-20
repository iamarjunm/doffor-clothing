import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const body = await req.json();
    const amountINR = Number(body.amountINR);

    if (!amountINR || amountINR <= 0) {
      return NextResponse.json({ error: 'Valid payable amount is required.' }, { status: 400 });
    }

    const amountPaise = Math.round(amountINR * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (keyId && keySecret) {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: `dfr_rcpt_${Date.now()}`,
        notes: {
          brand: 'Doffor Clothing',
          coupon: body.couponCode || 'NONE',
        },
      });

      return NextResponse.json({
        mode: 'live-sdk',
        keyId,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    }

    // Zero-config Razorpay Test Simulator mode (works before Razorpay keys are added)
    const simulatedOrderId = `order_DFR${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    return NextResponse.json({
      mode: 'simulator',
      keyId: 'rzp_test_DOFFOR_SANDBOX',
      razorpayOrderId: simulatedOrderId,
      amount: amountPaise,
      currency: 'INR',
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]', err);
    return NextResponse.json(
      { error: 'Unable to initialize Razorpay order.' },
      { status: 500 }
    );
  }
}
