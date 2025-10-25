import axios from 'axios';

const AT_API_URL = 'https://api.sandbox.africastalking.com/version1/messaging';
const AT_API_KEY = process.env.AT_API_KEY!;
const AT_USERNAME = process.env.AT_USERNAME!;

interface SendSMSParams {
  to: string;
  body: string;
}

interface ATResponse {
  SMSMessageData: {
    Message: string;
    Recipients: Array<{
      statusCode: number;
      number: string;
      status: string;
      cost: string;
      messageId: string;
    }>;
  };
}

export async function sendSMS(params: SendSMSParams): Promise<ATResponse> {
  try {
    const response = await axios.post(
      AT_API_URL,
      {
        username: AT_USERNAME,
        to: params.to,
        message: params.body,
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': AT_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Africa\'s Talking API Error:', error);
    throw new Error('Failed to send SMS via Africa\'s Talking');
  }
}

export async function checkBalance(): Promise<{ balance: number }> {
  try {
    const response = await axios.get(
      `${AT_API_URL.replace('/messaging', '')}/user`,
      {
        params: {
          username: AT_USERNAME,
        },
        headers: {
          'Accept': 'application/json',
          'apiKey': AT_API_KEY,
        },
      }
    );

    return {
      balance: response.data.UserData?.balance || 0,
    };
  } catch (error) {
    console.error('Africa\'s Talking Balance Check Error:', error);
    throw new Error('Failed to check SMS balance');
  }
}
