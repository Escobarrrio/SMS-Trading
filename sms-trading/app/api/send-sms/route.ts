import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/bulksms';
import { SendSMSSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validated = SendSMSSchema.parse(body);

    // Get client data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('used, allowance, plan')
      .eq('clerk_id', userId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check quota
    if (client.used >= client.allowance) {
      return NextResponse.json(
        { error: 'SMS quota exceeded' },
        { status: 403 }
      );
    }

    // Send SMS via BulkSMS
    const smsResult = await sendSMS({
      to: validated.to,
      body: validated.message,
    });

    // Log transaction
    const { error: txError } = await supabaseAdmin
      .from('sms_transactions')
      .insert({
        client_id: client.id,
        to_number: validated.to,
        message: validated.message,
        status: smsResult.status,
        cost: 0.68, // BulkSMS rate
      });

    // Update usage
    await supabaseAdmin
      .from('clients')
      .update({ used: client.used + 1 })
      .eq('clerk_id', userId);

    if (txError) {
      console.error('Transaction logging error:', txError);
    }

    return NextResponse.json({
      success: true,
      messageId: smsResult.id,
      remaining: client.allowance - client.used - 1,
    });
  } catch (error) {
    console.error('Send SMS Error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
