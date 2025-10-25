import axios from 'axios';

const BULKSMS_API_URL = 'https://api.bulksms.com/v1/messages';
const BULKSMS_USERNAME = process.env.BULKSMS_USERNAME!;
const BULKSMS_PASSWORD = process.env.BULKSMS_PASSWORD!;

interface SendSMSParams {
  to: string;
  body: string;
}

interface SMSResponse {
  id: string;
  status: string;
  to: string;
  body: string;
  createdAt: string;
}

export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  const auth = Buffer.from(`${BULKSMS_USERNAME}:${BULKSMS_PASSWORD}`).toString(
    'base64'
  );

  try {
    const response = await axios.post(
      BULKSMS_API_URL,
      {
        to: params.to,
        body: params.body,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('BulkSMS API Error:', error);
    throw new Error('Failed to send SMS via BulkSMS');
  }
}

export async function checkBalance(): Promise<{ balance: number }> {
  const auth = Buffer.from(`${BULKSMS_USERNAME}:${BULKSMS_PASSWORD}`).toString(
    'base64'
  );

  try {
    const response = await axios.get(`${BULKSMS_API_URL}/balance`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('BulkSMS Balance Check Error:', error);
    throw new Error('Failed to check SMS balance');
  }
}
