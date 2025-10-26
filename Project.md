Project Overview

**SMS Trading** is a Next.js-based SMS platform that enables customers to send bulk SMS messages with real-time tracking and usage monitoring. It's a multi-tenant SaaS platform with customer dashboards and admin management capabilities.

## Project Structure

```
sms-trading/
├── app/
│   ├── api/
│   │   ├── send-sms/route.ts          # Send SMS endpoint
│   │   ├── check-balance/route.ts     # Check remaining quota
│   │   └── webhook/route.ts           # Payment webhooks (future)
│   ├── dashboard/                     # Customer dashboard
│   ├── admin/                         # Admin panel (future)
│   ├── sign-in/                       # Clerk auth pages
│   ├── sign-up/
│   └── page.tsx                       # Landing page
├── components/
│   ├── SMSForm.tsx                    # Send SMS form
│   ├── UsageChart.tsx                 # Usage stats (future)
│   └── ClientList.tsx                 # Admin client list (future)
├── lib/
│   ├── supabase.ts                    # Supabase client
│   ├── bulksms.ts                     # BulkSMS API wrapper
│   ├── africastalking.ts              # Africa's Talking API wrapper
│   └── schemas.ts                     # Zod validation schemas
├── .env.example                       # Environment variables template
├── package.json
└── README.md
```

## Key Components

- **SMS Service**: Integrations with BulkSMS or Africa's Talking (lib/bulksms.ts, lib/africastalking.ts)
- **Customer Dashboard**: SMS sending interface with quota tracking (app/dashboard/)
- **API Layer**: Next.js API routes for sending SMS and checking balance
- **Authentication**: Clerk for user auth with multi-tenant support
- **Data Persistence**: Supabase PostgreSQL database for clients, transactions, and usage

## Technology Stack

- **Frontend/Backend**: Next.js 15 + TypeScript
- **UI**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk (free tier)
- **SMS Providers**: BulkSMS (~R0.68/SMS) or Africa's Talking (~R0.65/SMS)
- **Hosting**: Vercel (free tier handles 100+ clients)
- **Validation**: Zod
- **HTTP Client**: Axios

## Premium Components Integrated

### 1. **AOS (Animate On Scroll)**
- **File**: `components/AnimatedSection.tsx`
- **Usage**: Scroll-triggered animations on all sections
- **Features**:
  - Fade, slide, zoom animations
  - Customizable duration and delay
  - Mobile-optimized
- **Example**: 
  ```tsx
  <AnimatedSection animation="fade-up" duration={800} delay={200}>
    <div>Your content</div>
  </AnimatedSection>
  ```

### 2. **Chart.js**
- **File**: `components/UsageAnalytics.tsx`
- **Usage**: Beautiful SMS usage statistics dashboard
- **Features**:
  - Doughnut chart for usage distribution
  - Progress bar visualization
  - Gradient stat cards
  - Real-time data updates
- **Example**:
  ```tsx
  <UsageAnalytics data={balanceData} />
  ```

### 3. **Typed.js**
- **File**: `components/HeroTyped.tsx`
- **Usage**: Animated typing effect on hero section
- **Features**:
  - Multiple string rotation
  - Customizable typing speed
  - Gradient text effect
  - Smooth backspacing
- **Example**:
  ```tsx
  <HeroTyped
    strings={['Send SMS', 'Track Delivery', 'Grow Business']}
    typeSpeed={50}
  />
  ```

### 4. **Swiper.js**
- **File**: `components/PricingCarousel.tsx`
- **Usage**: Interactive pricing plans carousel
- **Features**:
  - Coverflow effect with 3D rotation
  - Auto-play with pause on interaction
  - Touch/mouse drag support
  - Responsive slide sizing
  - Pagination controls
- **Note**: Uses dynamic imports for Next.js SSR compatibility
- **Example**:
  ```tsx
  <PricingCarousel />
  ```

### 5. **CareerIcons Pro**
- **Available for integration**: 150+ premium icons
- **Categories**: Suitable for dashboard, status indicators, navigation
- **Potential use**: Replace emoji icons with professional SVG icons

### 6. **Particles.js** (Recommended future enhancement)
- **Use case**: Animated background particles on landing page
- **Integration**: Can be added to layout with client component wrapper

## Premium Components Architecture

```
components/
├── AnimatedSection.tsx      # AOS wrapper (scroll animations)
├── HeroTyped.tsx           # Typed.js component (typing effect)
├── UsageAnalytics.tsx      # Chart.js analytics dashboard
├── PricingCarousel.tsx     # Swiper.js carousel
└── SMSForm.tsx             # Original form component

app/
├── page.tsx                # Enhanced homepage with all premium components
├── dashboard/page.tsx      # Dashboard with analytics
└── api/
    ├── send-sms/route.ts
    └── check-balance/route.ts
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npx prettier --write .
```

## Database Schema (Supabase)

```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'business', 'pro')),
  allowance INT NOT NULL DEFAULT 1000,
  used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- SMS transactions table
CREATE TABLE sms_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  to_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  cost DECIMAL(5,2) DEFAULT 0.68,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_client_id ON sms_transactions(client_id);
```

## Implementation Notes

- SMS sending is rate-limited per client based on plan allowance
- All transactions logged for audit and billing purposes
- Store credentials in .env - never commit to git
- Client quotas reset monthly (use Supabase scheduled functions)
- Error handling includes retry logic for API failures
- Input validation via Zod schemas before SMS sending

## Testing Strategy

- Unit tests for SMSForm component validation
- Integration tests for API routes with mocked SMS providers
- E2E tests for complete SMS sending flow
- Mock BulkSMS/Africa's Talking responses

## Using Premium Components

### AnimatedSection (AOS)
**Available Animations:**
- `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`
- `slide-up`, `slide-down`, `slide-left`, `slide-right`
- `zoom-in`, `zoom-out`, `flip-left`, `flip-right`

**Best Practices:**
- Use staggered delays for cascading effects
- Set `duration` between 400-1200ms for smooth feel
- Use `once={false}` for re-animation on scroll back up

### HeroTyped (Typed.js)
**Customization:**
- `typeSpeed`: milliseconds per character (default 40)
- `backSpeed`: backspace speed (default 60)
- `backDelay`: pause before backspacing (default 1500)
- `loop`: enable infinite cycling (default true)

### UsageAnalytics (Chart.js)
**Real-time Updates:**
- Component automatically re-renders on data changes
- Charts use gradient colors from `tailwind.config.js`
- Mobile-responsive with proper aspect ratios

### PricingCarousel (Swiper.js)
**Key Features:**
- Next.js SSR-safe with dynamic imports
- Touch gestures on mobile
- Auto-advance every 5 seconds
- Coverflow 3D effect

**Customization in code:**
```typescript
const PLANS = [
  { name, price, sms, features, highlight }
  // Add/modify plans here
]
```

## Deployment Checklist

- Create Supabase project and run schema migrations
- Set up Clerk authentication
- Register SMS provider account (BulkSMS/Africa's Talking)
- Configure environment variables in Vercel
- Test SMS sending in staging
- Deploy via Vercel GitHub integration
- Verify Chart.js renders correctly in production
- Test Swiper.js carousel on mobile devices
- Check AOS animations on different browsers
