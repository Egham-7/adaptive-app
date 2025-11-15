# PostHog Event Tracking System

A comprehensive, type-safe event tracking system for the Adaptive App, organized by domain with both pure functions and React hooks.

## 📁 Structure

```
src/lib/posthog/
├── types.ts                    # TypeScript type definitions
├── client.ts                   # PostHog client wrapper utilities
├── events/                     # Pure tracking functions by domain
│   ├── auth.ts                # Authentication events
│   ├── organizations.ts       # Organization management
│   ├── projects.ts            # Project management
│   ├── api-keys.ts            # API key operations
│   ├── chat.ts                # Chat platform events
│   ├── billing.ts             # Subscription & payments
│   ├── settings.ts            # User preferences
│   ├── analytics.ts           # Dashboard & usage views
│   ├── errors.ts              # Error tracking
│   └── performance.ts         # Performance monitoring
└── index.ts                   # Main export

src/hooks/posthog/
├── use-track-event.ts         # Generic event tracking hook
├── use-track-page-view.ts     # Page view tracking hook
├── use-auth-tracking.ts       # Auth event tracking hooks
├── use-org-tracking.ts        # Organization hooks
├── use-project-tracking.ts    # Project hooks
├── use-api-key-tracking.ts    # API key hooks
├── use-chat-tracking.ts       # Chat platform hooks
├── use-billing-tracking.ts    # Billing/subscription hooks
├── use-settings-tracking.ts   # Settings hooks
└── index.ts                   # Main export
```

## 🚀 Quick Start

### Using Pure Functions (Server/Client)

```typescript
import { trackProjectCreated } from '@/lib/posthog/events/projects';

// In any component or function
const handleCreateProject = async (name: string) => {
  const project = await createProject({ name });

  trackProjectCreated({
    projectId: project.id,
    organizationId: org.id,
    projectName: name,
  });
};
```

### Using React Hooks (Client Components)

```typescript
'use client';

import { useProjectTracking } from '@/hooks/posthog/use-project-tracking';

function ProjectForm() {
  const { trackCreated } = useProjectTracking();

  const handleSubmit = async (name: string) => {
    const project = await createProject({ name });
    trackCreated({
      projectId: project.id,
      organizationId: org.id,
      projectName: name
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Generic Event Tracking

```typescript
'use client';

import { useTrackEvent } from '@/hooks/posthog/use-track-event';

function MyComponent() {
  const track = useTrackEvent();

  const handleClick = () => {
    track('custom_event', {
      action: 'button_clicked',
      value: 42
    });
  };

  return <button onClick={handleClick}>Track Me</button>;
}
```

## 📚 Event Categories

### 1. Authentication Events

```typescript
import { trackSignUp, trackSignIn, trackSignOut } from '@/lib/posthog/events/auth';

// Track sign up
trackSignUp({
  signupSource: 'landing_page',
  utmSource: 'google',
  utmCampaign: 'winter_2024',
});

// Track sign in
trackSignIn({
  signInMethod: 'google',
});

// Track sign out
trackSignOut();
```

**Hook Usage:**
```typescript
const { trackSignUp, trackSignIn, trackSignOut } = useAuthTracking();
```

### 2. Organization Events

```typescript
import {
  trackOrganizationCreated,
  trackMemberInvited,
  trackMemberRoleChanged
} from '@/lib/posthog/events/organizations';

// Track organization creation
trackOrganizationCreated({
  organizationId: 'org_123',
  organizationName: 'Acme Corp',
});

// Track member invitation
trackMemberInvited({
  organizationId: 'org_123',
  email: 'user@example.com',
  role: 'member',
  inviteResult: 'success',
});

// Track role change
trackMemberRoleChanged({
  organizationId: 'org_123',
  memberId: 'user_456',
  oldRole: 'member',
  newRole: 'admin',
});
```

**Hook Usage:**
```typescript
const { trackCreated, trackMemberInvited, trackMemberRoleChanged } = useOrgTracking();
```

### 3. Project Events

```typescript
import {
  trackProjectCreated,
  trackProjectViewed,
  trackProjectDashboardViewed
} from '@/lib/posthog/events/projects';

// Track project creation
trackProjectCreated({
  projectId: 'proj_123',
  organizationId: 'org_123',
  projectName: 'My Project',
  description: 'Project description',
});

// Track project view
trackProjectViewed({
  projectId: 'proj_123',
  organizationId: 'org_123',
});

// Track dashboard view
trackProjectDashboardViewed({
  projectId: 'proj_123',
  organizationId: 'org_123',
});
```

**Hook Usage:**
```typescript
const { trackCreated, trackViewed, trackDashboardViewed } = useProjectTracking();
```

### 5. API Key Events

```typescript
import {
  trackApiKeyCreated,
  trackApiKeyCopied,
  trackApiKeyRevoked
} from '@/lib/posthog/events/api-keys';

// Track API key creation
trackApiKeyCreated({
  projectId: 'proj_123',
  organizationId: 'org_123',
  keyName: 'Production Key',
  expirationDate: '2024-12-31',
});

// Track key copied
trackApiKeyCopied({
  keyId: 'key_123',
  projectId: 'proj_123',
});

// Track key revoked
trackApiKeyRevoked({
  keyId: 'key_123',
  projectId: 'proj_123',
  reason: 'security_breach',
});
```

**Hook Usage:**
```typescript
const { trackCreated, trackCopied, trackRevoked } = useApiKeyTracking();
```

### 6. Chat Events

```typescript
import {
  trackChatMessageSent,
  trackChatMessageReceived,
  trackDailyMessageLimitReached
} from '@/lib/posthog/events/chat';

// Track message sent
trackChatMessageSent({
  conversationId: 'conv_123',
  messageLength: 150,
  hasAttachments: false,
  provider: 'openai',
  model: 'gpt-4',
});

// Track message received
trackChatMessageReceived({
  conversationId: 'conv_123',
  provider: 'openai',
  model: 'gpt-4',
  tokenCount: 500,
  cost: 0.015,
  responseTimeMs: 2300,
});

// Track daily limit reached
trackDailyMessageLimitReached({
  limitValue: 10,
  remainingMessages: 0,
});
```

**Hook Usage:**
```typescript
const { trackMessageSent, trackMessageReceived, trackDailyLimitReached } = useChatTracking();
```

### 7. Billing & Subscription Events

```typescript
import {
  trackCheckoutSessionInitiated,
  trackSubscriptionCreated,
  trackCreditPurchased
} from '@/lib/posthog/events/billing';

// Track checkout initiated
trackCheckoutSessionInitiated({
  priceId: 'price_123',
  planType: 'pro',
  amount: 2900,
});

// Track subscription created
trackSubscriptionCreated({
  stripePriceId: 'price_123',
  amount: 2900,
  billingCycle: 'monthly',
  planType: 'pro',
});

// Track credit purchase
trackCreditPurchased({
  organizationId: 'org_123',
  amount: 10000,
  cost: 100,
  transactionId: 'txn_456',
});
```

**Hook Usage:**
```typescript
const { trackCheckoutSessionInitiated, trackSubscriptionCreated, trackCreditPurchased } = useBillingTracking();
```

### 8. Settings Events

```typescript
import {
  trackThemeChanged,
  trackProviderConfigured,
  trackPreferencesSaved
} from '@/lib/posthog/events/settings';

// Track theme change
trackThemeChanged({
  theme: 'dark',
});

// Track provider configured
trackProviderConfigured({
  provider: 'anthropic',
  context: 'chat',
});

// Track preferences saved
trackPreferencesSaved({
  preferenceType: 'notifications',
  organizationId: 'org_123',
});
```

**Hook Usage:**
```typescript
const { trackThemeChanged, trackProviderConfigured, trackPreferencesSaved } = useSettingsTracking();
```

### 9. Error Events

```typescript
import {
  trackChatMessageError,
  trackApiRequestError,
  trackRateLimitExceeded
} from '@/lib/posthog/events/errors';

// Track chat error
trackChatMessageError({
  conversationId: 'conv_123',
  errorMessage: 'Failed to connect to provider',
  errorCode: 'CONNECTION_FAILED',
  retryCount: 2,
});

// Track API error
trackApiRequestError({
  endpoint: '/api/v1/chat/completions',
  statusCode: 500,
  errorMessage: 'Internal server error',
  errorCode: 'INTERNAL_ERROR',
});

// Track rate limit
trackRateLimitExceeded({
  endpoint: '/api/v1/messages',
  retryAfter: 60,
});
```

### 10. Performance Events

```typescript
import {
  trackApiResponseTime,
  trackChatResponseTime,
  trackUsageMilestone
} from '@/lib/posthog/events/performance';

// Track API response time
trackApiResponseTime({
  endpoint: '/api/v1/chat/completions',
  method: 'POST',
  durationMs: 1250,
  statusCode: 200,
});

// Track chat response time
trackChatResponseTime({
  conversationId: 'conv_123',
  provider: 'openai',
  model: 'gpt-4',
  tokenCount: 500,
  durationMs: 2300,
});

// Track milestone
trackUsageMilestone({
  milestone: 'first_100_messages',
  milestoneValue: 100,
  context: 'chat',
});
```

## 🎯 Best Practices

### 1. Use Type-Safe Event Properties

All events have typed properties for autocomplete and validation:

```typescript
// ✅ Good - TypeScript will validate properties
trackProjectCreated({
  projectId: project.id,
  organizationId: org.id,
  projectName: project.name,
});

// ❌ Bad - Will error at compile time
trackProjectCreated({
  projectId: project.id,
  // Missing required organizationId
});
```

### 2. Track Events Close to User Actions

Track events immediately after the action completes:

```typescript
const handleCreateProject = async () => {
  try {
    const project = await createProject(data);

    // ✅ Track immediately after success
    trackProjectCreated({
      projectId: project.id,
      organizationId: org.id,
      projectName: data.name,
    });
  } catch (error) {
    // Track errors too
    trackProjectCreationError({
      organizationId: org.id,
      errorMessage: error.message,
    });
  }
};
```

### 3. Include Rich Context

Provide as much context as possible for better analytics:

```typescript
// ✅ Good - Rich context
trackChatMessageSent({
  conversationId: conv.id,
  messageLength: message.length,
  hasAttachments: attachments.length > 0,
  provider: selectedProvider,
  model: selectedModel,
});

// ❌ Okay but less useful
trackChatMessageSent({
  conversationId: conv.id,
  messageLength: message.length,
  hasAttachments: false,
});
```

### 4. Use Hooks in Client Components

For React components, always prefer using hooks:

```typescript
'use client';

// ✅ Good - Using hook
function MyComponent() {
  const { trackCreated } = useProjectTracking();
  return <button onClick={() => trackCreated({...})}>Create</button>;
}

// ⚠️ Okay but less idiomatic
function MyComponent() {
  return <button onClick={() => trackProjectCreated({...})}>Create</button>;
}
```

### 5. Track Both Success and Failure

Always track both successful actions and errors:

```typescript
try {
  const result = await performAction();
  trackActionSuccess({ result });
} catch (error) {
  trackActionError({
    errorMessage: error.message,
    errorCode: error.code,
  });
}
```

## 🔍 Client Utilities

The `client.ts` file provides low-level utilities:

```typescript
import {
  identifyUser,
  setUserProperties,
  setGlobalProperties,
  isFeatureEnabled,
  getFeatureFlagValue
} from '@/lib/posthog/client';

// Identify user (usually done in auth provider)
identifyUser('user_123', {
  email: 'user@example.com',
  name: 'John Doe',
});

// Set persistent user properties
setUserProperties({
  plan: 'pro',
  organizationCount: 3,
});

// Set global properties for all events
setGlobalProperties({
  environment: 'production',
  version: '1.0.0',
});

// Check feature flags
if (isFeatureEnabled('new-dashboard')) {
  // Show new dashboard
}

const variant = getFeatureFlagValue('ab-test', 'control');
```

## 📊 Event Naming Convention

All events follow a consistent naming pattern:

- **Format**: `{domain}_{action}_{past_tense}`
- **Examples**:
  - `project_created`
  - `chat_message_sent`
  - `subscription_upgraded`
  - `api_key_revoked`

## 🧪 Testing

When testing components that use tracking:

```typescript
import { vi } from 'vitest';

// Mock the tracking hook
vi.mock('@/hooks/posthog/use-project-tracking', () => ({
  useProjectTracking: () => ({
    trackCreated: vi.fn(),
    trackViewed: vi.fn(),
  }),
}));

// Test your component
test('tracks project creation', () => {
  // Your test code
});
```

## 🚫 What NOT to Track

- **Personally Identifiable Information (PII)**: Don't track sensitive data like passwords, credit card numbers, or private messages
- **High-Frequency Events**: Avoid tracking mouse movements, scroll events, or other high-frequency actions
- **Redundant Events**: Don't track the same event multiple times with identical properties

## 📝 Adding New Events

To add a new event:

1. **Add types** to `src/lib/posthog/types.ts`:
```typescript
export interface MyNewEventProps extends BaseEventContext {
  myProperty: string;
  otherProperty?: number;
}
```

2. **Add event to EventName union**:
```typescript
export type EventName =
  | 'existing_event'
  | 'my_new_event'; // Add here
```

3. **Create tracking function** in appropriate domain file:
```typescript
export function trackMyNewEvent(props: MyNewEventProps): void {
  captureEvent('my_new_event', props);
}
```

4. **Add to hook** (if applicable):
```typescript
const handleMyNewEvent = useCallback((props: MyNewEventProps) => {
  trackMyNewEvent(props);
}, []);
```

## 🔗 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React Integration](https://posthog.com/docs/libraries/react)
- [Event Naming Best Practices](https://posthog.com/docs/data/events#best-practices)

## 💡 Tips

- Use PostHog's dashboard to create insights and funnels from tracked events
- Set up alerts for critical events (errors, payment failures)
- Create user segments based on tracked events
- Use feature flags to control rollouts and A/B tests
- Monitor event volume to catch tracking issues early

---

**Need help?** Check the existing event implementations for examples or refer to the PostHog documentation.
