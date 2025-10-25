# SMS Trading - Bulk SMS Platform

A modern Next.js SaaS platform for sending bulk SMS messages with real-time tracking and usage monitoring.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Clerk account (free tier works)
- BulkSMS or Africa's Talking account

### Installation

```bash
# Clone and install
git clone https://github.com/Escobarrrio/SMS-Trading.git
cd sms-trading
npm install

# Copy environment template
cp .env.example .env.local
```

### Setup Environment

1. **Supabase Setup:**
   - Create project at supabase.com
   - Run database schema (see WARP.md)
   - Copy API keys to `.env.local`

2. **Clerk Setup:**
   - Create app at clerk.com
   - Copy publishable and secret keys

3. **SMS Provider:**
   - Register at bulksms.com or africastalking.com
   - Add credentials to `.env.local`

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
```

## 📋 Features

- **Customer Dashboard**: Send SMS, track balance, view history
- **Plan Management**: Starter (1000 SMS), Business (5000 SMS), Pro (10000 SMS)
- **Real-time Balance**: Live SMS quota tracking
- **Transaction Logging**: All SMS attempts logged for billing
- **Mobile Responsive**: Works perfectly on phones

## 🏗️ Project Structure

```
app/
├── api/send-sms/          # Send SMS endpoint
├── api/check-balance/     # Check remaining quota
├── dashboard/             # Customer dashboard
├── sign-in/              # Clerk auth
└── sign-up/

components/
└── SMSForm.tsx            # SMS sending form

lib/
├── supabase.ts            # Database client
├── bulksms.ts             # BulkSMS API wrapper
├── africastalking.ts      # Africa's Talking wrapper
└── schemas.ts             # Zod validation
```

## 💰 Pricing

- **Starter**: R1,500/month (1000 SMS)
- **Business**: R4,500/month (5000 SMS)
- **Pro**: R9,500/month (10000 SMS)

SMS cost: R0.65-0.68 per message (varies by provider)

## 📚 API Endpoints

### Send SMS
```
POST /api/send-sms
{
  "to": "+27123456789",
  "message": "Your message here"
}
```

### Check Balance
```
GET /api/check-balance
```

Returns:
```json
{
  "used": 150,
  "allowance": 1000,
  "remaining": 850,
  "plan": "starter"
}
```

## 🔐 Security

- Environment variables for all secrets
- Clerk authentication for users
- Rate limiting on API endpoints
- SQL injection protection via Supabase
- HTTPS enforced on production

## 📦 Dependencies

- **Next.js 15**: React framework
- **Supabase**: PostgreSQL database
- **Clerk**: User authentication
- **Tailwind CSS**: Styling
- **Zod**: Data validation
- **Axios**: HTTP requests
- **React Hook Form**: Form handling

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

```bash
git push origin main
```

Visit vercel.com and import your GitHub repo.

## 🧪 Testing

Currently no tests. Add Jest configuration for:
- Component testing (SMSForm)
- API route testing
- Integration testing with mocked SMS providers

## 📝 Database Schema

See `WARP.md` for complete schema. Key tables:
- `clients`: User accounts and quotas
- `sms_transactions`: SMS history and logs

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Create pull request

## 📄 License

MIT

## 📞 Support

For issues: Open GitHub issue

---

**Status**: MVP - Production ready
**Hosting**: Vercel (free tier)
**Database**: Supabase (free tier)
