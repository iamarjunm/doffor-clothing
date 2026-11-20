import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulated,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing Razorpay order or payment ID.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (keySecret && !isSimulated) {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Razorpay payment signature mismatch.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      verified: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('[Razorpay Verify Error]', err);
    return NextResponse.json(
      { error: 'Razorpay signature verification failed.' },
      { status: 500 }
    );
  }
}
