import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BULKSMS_API_URL = 'https://api.bulksms.com/v1/messages';
const BULKSMS_AUTH_HEADER = process.env.BULKSMS_AUTH_HEADER!;

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing to or message parameter' },
        { status: 400 }
      );
    }

    // Normalize phone number (ensure it has country code)
    let phoneNumber = to.replace(/\D/g, '');
    if (!phoneNumber.startsWith('27')) {
      phoneNumber = '27' + phoneNumber.slice(-9);
    }
    phoneNumber = '+' + phoneNumber;

    console.log('Sending SMS to:', phoneNumber);
    console.log('Message:', message);

    const response = await axios.post(
      BULKSMS_API_URL,
      {
        to: phoneNumber,
        body: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: BULKSMS_AUTH_HEADER,
        },
      }
    );

    console.log('BulkSMS Response:', response.data);

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      data: response.data,
    });
  } catch (error: any) {
    console.error('BulkSMS Error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error: 'Failed to send SMS',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check balance
export async function GET(request: NextRequest) {
  try {
    const walletResponse = await axios.get(
      'https://api.bulksms.com/v1/wallet',
      {
        headers: {
          Authorization: BULKSMS_AUTH_HEADER,
        },
      }
    );

    return NextResponse.json({
      success: true,
      wallet: walletResponse.data,
    });
  } catch (error: any) {
    console.error('BulkSMS Wallet Error:', error.response?.data || error.message);

    return NextResponse.json(
      {
        error: 'Failed to check wallet',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
