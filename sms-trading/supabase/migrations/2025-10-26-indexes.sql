-- Additional indexes for rate limiting and webhook lookups
create index if not exists idx_sms_transactions_client_created on sms_transactions(client_id, created_at);
create index if not exists idx_campaign_messages_provider_id on campaign_messages(provider_id);
