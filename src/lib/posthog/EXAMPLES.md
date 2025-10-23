# PostHog Tracking Examples

Real-world examples of how to integrate PostHog event tracking into your components and functions.

## Table of Contents
- [Authentication Flow](#authentication-flow)
- [Onboarding Flow](#onboarding-flow)
- [Project Management](#project-management)
- [Chat Platform](#chat-platform)
- [Billing & Payments](#billing--payments)
- [Error Handling](#error-handling)

---

## Authentication Flow

### Sign Up Page

```typescript
'use client';

import { useAuthTracking } from '@/hooks/posthog/use-auth-tracking';
import { useRouter, useSearchParams } from 'next/navigation';

export function SignUpPage() {
  const { trackSignUp } = useAuthTracking();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp({ email, password });

      // Track successful sign up with UTM parameters
      trackSignUp({
        signupSource: 'email',
        utmSource: searchParams.get('utm_source') ?? undefined,
        utmMedium: searchParams.get('utm_medium') ?? undefined,
        utmCampaign: searchParams.get('utm_campaign') ?? undefined,
      });

      router.push('/onboarding');
    } catch (error) {
      // Handle error
    }
  };

  return <form onSubmit={handleSignUp}>...</form>;
}
```

### Middleware (Authentication Check)

```typescript
import { trackUnauthorizedAccess } from '@/lib/posthog/events/auth';

export function middleware(request: NextRequest) {
  const { isAuthed, user } = checkAuth(request);

  if (!isAuthed && isProtectedRoute(request.nextUrl.pathname)) {
    // Track unauthorized access attempt
    trackUnauthorizedAccess({
      attemptedPath: request.nextUrl.pathname,
      requiredRole: getRequiredRole(request.nextUrl.pathname),
    });

    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
```

---

## Onboarding Flow

### Multi-Step Onboarding

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/posthog/use-onboarding-tracking';

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [startTime] = useState(Date.now());
  const { trackStepViewed, trackCompleted, trackSkipped } = useOnboardingTracking();

  const steps = ['welcome', 'project', 'api_key', 'quickstart', 'complete'] as const;

  // Track step views
  useEffect(() => {
    trackStepViewed({
      step: steps[currentStep],
      stepNumber: currentStep + 1,
    });
  }, [currentStep, trackStepViewed]);

  const handleComplete = (projectId: string, hasApiKey: boolean, skippedSteps: string[]) => {
    const completionTimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    trackCompleted({
      projectId,
      hasApiKey,
      skippedSteps,
      completionTimeSeconds,
    });

    router.push('/dashboard');
  };

  const handleSkip = () => {
    trackSkipped({
      step: steps[currentStep],
      reason: 'user_clicked_skip',
    });

    setCurrentStep(currentStep + 1);
  };

  return (
    <div>
      {/* Step content */}
      <button onClick={handleSkip}>Skip</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

### Promotional Credits (Server Action)

```typescript
// app/api/onboarding/complete/route.ts
import { trackPromotionalCreditsAdded } from '@/lib/posthog/events/onboarding';

export async function POST(req: Request) {
  const { userId, organizationId } = await req.json();

  // Grant welcome credits
  const credits = await grantWelcomeCredits(organizationId, 5000);

  // Track promotional credits
  trackPromotionalCreditsAdded({
    amount: 5000,
    isFirstOrg: await isFirstOrganization(userId),
    userCountAtSignup: await getUserCountAtSignup(userId),
  });

  return Response.json({ success: true, credits });
}
```

---

## Project Management

### Create Project Form

```typescript
'use client';

import { useProjectTracking } from '@/hooks/posthog/use-project-tracking';
import { api } from '@/trpc/react';

export function CreateProjectForm({ orgId }: { orgId: string }) {
  const { trackCreated } = useProjectTracking();
  const createProject = api.projects.create.useMutation();

  const handleSubmit = async (values: { name: string; description: string }) => {
    try {
      const project = await createProject.mutateAsync({
        organizationId: orgId,
        name: values.name,
        description: values.description,
      });

      // Track project creation
      trackCreated({
        projectId: project.id,
        organizationId: orgId,
        projectName: values.name,
        description: values.description,
      });

      router.push(`/api-platform/orgs/${orgId}/projects/${project.id}`);
    } catch (error) {
      trackProjectCreationError({
        organizationId: orgId,
        errorMessage: error.message,
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Project Dashboard (Track Views)

```typescript
'use client';

import { useEffect } from 'react';
import { useProjectTracking } from '@/hooks/posthog/use-project-tracking';

export function ProjectDashboard({ projectId, orgId }: Props) {
  const { trackDashboardViewed } = useProjectTracking();

  useEffect(() => {
    // Track when user views the dashboard
    trackDashboardViewed({
      projectId,
      organizationId: orgId,
    });
  }, [projectId, orgId, trackDashboardViewed]);

  return <div>Dashboard content...</div>;
}
```

---

## Chat Platform

### Chat Message Form

```typescript
'use client';

import { useChatTracking } from '@/hooks/posthog/use-chat-tracking';
import { api } from '@/trpc/react';

export function ChatMessageForm({ conversationId }: Props) {
  const { trackMessageSent, trackMessageReceived } = useChatTracking();
  const sendMessage = api.messages.create.useMutation();

  const handleSend = async (message: string, attachments: File[]) => {
    const startTime = Date.now();

    // Track message sent
    trackMessageSent({
      conversationId,
      messageLength: message.length,
      hasAttachments: attachments.length > 0,
      provider: selectedProvider,
      model: selectedModel,
    });

    try {
      const response = await sendMessage.mutateAsync({
        conversationId,
        content: message,
        attachments: attachments.map(f => f.name),
      });

      const responseTime = Date.now() - startTime;

      // Track AI response received
      trackMessageReceived({
        conversationId,
        provider: response.provider,
        model: response.model,
        tokenCount: response.usage?.totalTokens,
        cost: response.cost,
        responseTimeMs: responseTime,
      });
    } catch (error) {
      trackChatMessageError({
        conversationId,
        errorMessage: error.message,
        errorCode: error.code,
      });
    }
  };

  return <form onSubmit={handleSend}>...</form>;
}
```

### Daily Message Limit Check

```typescript
'use client';

import { useChatTracking } from '@/hooks/posthog/use-chat-tracking';

export function ChatLimitChecker({ userId }: Props) {
  const { trackDailyLimitReached, trackUpgradePrompted } = useChatTracking();
  const { data: usage } = api.messages.getDailyUsage.useQuery({ userId });

  useEffect(() => {
    if (usage && usage.count >= usage.limit) {
      // Track limit reached
      trackDailyLimitReached({
        limitValue: usage.limit,
        remainingMessages: 0,
      });

      // Show upgrade modal
      setShowUpgradeModal(true);

      // Track upgrade prompt shown
      trackUpgradePrompted({
        context: 'daily_limit',
      });
    }
  }, [usage]);

  return <div>...</div>;
}
```

---

## Billing & Payments

### Pricing Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useBillingTracking } from '@/hooks/posthog/use-billing-tracking';

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { trackPricingPageViewed, trackBillingToggleSwitched, trackCheckoutSessionInitiated } =
    useBillingTracking();

  useEffect(() => {
    trackPricingPageViewed({
      source: 'navigation',
    });
  }, [trackPricingPageViewed]);

  const handleToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
    trackBillingToggleSwitched({ billingCycle: cycle });
  };

  const handleSelectPlan = async (priceId: string, planType: string, amount: number) => {
    trackCheckoutSessionInitiated({
      priceId,
      planType,
      amount,
    });

    const session = await createCheckoutSession({ priceId });
    window.location.href = session.url;
  };

  return (
    <div>
      <button onClick={() => handleToggle('monthly')}>Monthly</button>
      <button onClick={() => handleToggle('annual')}>Annual</button>
      {/* Plan cards */}
    </div>
  );
}
```

### Stripe Webhook Handler

```typescript
// app/api/stripe-checkout/route.ts
import { trackSubscriptionCreated, trackPaymentFailed } from '@/lib/posthog/events/billing';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Track subscription created
      trackSubscriptionCreated({
        stripePriceId: session.metadata?.priceId ?? '',
        amount: (session.amount_total ?? 0) / 100,
        billingCycle: session.metadata?.billingCycle as 'monthly' | 'annual',
        planType: session.metadata?.planType,
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      // Track payment failure
      trackPaymentFailed({
        reason: invoice.last_payment_error?.message ?? 'Unknown error',
        amount: (invoice.amount_due ?? 0) / 100,
        errorCode: invoice.last_payment_error?.code,
      });
      break;
    }
  }

  return Response.json({ received: true });
}
```

---

## Error Handling

### Global Error Boundary

```typescript
'use client';

import { useEffect } from 'react';
import { trackError } from '@/lib/posthog/events/errors';

export function ErrorBoundary({ error, reset }: Props) {
  useEffect(() => {
    // Track unexpected errors
    trackError({
      errorType: 'authentication', // or appropriate type
      errorMessage: error.message,
      errorCode: error.code,
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### API Route Error Tracking

```typescript
// app/api/v1/chat/completions/route.ts
import { trackApiRequestError } from '@/lib/posthog/events/errors';

export async function POST(req: Request) {
  try {
    // Process request
    const response = await processRequest(req);
    return Response.json(response);
  } catch (error) {
    // Track API error
    trackApiRequestError({
      endpoint: '/api/v1/chat/completions',
      statusCode: error.statusCode ?? 500,
      errorMessage: error.message,
      errorCode: error.code,
    });

    return Response.json(
      { error: error.message },
      { status: error.statusCode ?? 500 }
    );
  }
}
```

---

## Performance Tracking

### API Response Time Tracking

```typescript
// middleware or API route
import { trackApiResponseTime } from '@/lib/posthog/events/performance';

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const result = await processRequest(req);
    const duration = Date.now() - startTime;

    // Track successful response time
    trackApiResponseTime({
      endpoint: req.url,
      method: req.method,
      durationMs: duration,
      statusCode: 200,
    });

    return Response.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;

    // Track failed response time
    trackApiResponseTime({
      endpoint: req.url,
      method: req.method,
      durationMs: duration,
      statusCode: error.statusCode ?? 500,
    });

    throw error;
  }
}
```

### Usage Milestones

```typescript
// In your message creation handler
import { trackUsageMilestone } from '@/lib/posthog/events/performance';

const handleMessageCreated = async (userId: string, conversationId: string) => {
  const messageCount = await getMessageCount(userId);

  // Track milestones
  const milestones = [10, 50, 100, 500, 1000];
  if (milestones.includes(messageCount)) {
    trackUsageMilestone({
      milestone: `messages_${messageCount}`,
      milestoneValue: messageCount,
      context: 'chat',
    });
  }
};
```

---

## Tips for Best Practices

1. **Track Early**: Add tracking as you build features, not as an afterthought
2. **Be Consistent**: Use the provided hooks in components, pure functions in API routes
3. **Include Context**: Always provide as much relevant context as possible
4. **Track Errors**: Don't forget to track failures and errors
5. **Test Tracking**: Verify events appear in PostHog dashboard during development
6. **Performance**: Tracking is async and non-blocking, but avoid excessive high-frequency events
7. **Privacy**: Never track PII (passwords, credit cards, sensitive personal data)

---

For more examples, check the README.md or browse the event definition files in `src/lib/posthog/events/`.
