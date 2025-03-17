# Tier Implementation Plan

## Overview

This document outlines the implementation plan for adding tier restrictions to the application. Currently, there are two tiers (Free and Pro) displayed in the pricing section, but no actual restrictions are enforced. This plan details how to implement the restrictions so that the free tier is limited and the pro tier has all the features described in the pricing page.

## Database Changes

### 1. User Table Modifications

The `users` table already has:
- `is_pro` field to track subscription status
- `stripe_customer_id` and `stripe_subscription_id` fields

We need to add:
- `pipeline_count` field to track the number of pipelines for free tier limits

```sql
-- Add pipeline_count to users table
alter table public.users
add column pipeline_count integer default 0;
```

### 2. Triggers for Pipeline Count

Create a trigger to automatically update the pipeline count when pipelines are created or deleted:

```sql
-- Create a function to update pipeline_count
create or replace function update_pipeline_count()
returns trigger as $$
begin
  update public.users
  set pipeline_count = (
    select count(*)
    from public.pipeline_configs
    where user_id = NEW.user_id
  )
  where id = NEW.user_id;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to maintain pipeline_count
create trigger update_pipeline_count_trigger
after insert or delete on public.pipeline_configs
for each row
execute function update_pipeline_count();
```

### 3. Row Level Security (RLS) Policies

Add RLS policies to enforce tier restrictions at the database level:

```sql
-- Policy for pipeline creation
create policy "Enforce free tier pipeline limit"
on public.pipeline_configs
for insert
to authenticated
with check (
  (select is_pro from public.users where id = auth.uid())
  or
  (select pipeline_count from public.users where id = auth.uid()) < 2
);

-- Policy for content sources
create policy "Enforce free tier source limit"
on public.pipeline_configs
for insert
to authenticated
with check (
  (select is_pro from public.users where id = auth.uid())
  or
  (array_length(subreddits, 1) <= 2 and array_length(source, 1) <= 2)
);
```

## Backend Changes

### 1. API Validation in Pipeline Creation

Update the `createPipeline` function in `src/components/pipeline/utils/api.ts` to validate tier restrictions:

```typescript
export const createPipeline = async (userId: string, data: PipelineFormData) => {
  // Check user tier and limits
  const { data: userData } = await supabase
    .from('users')
    .select('is_pro, pipeline_count')
    .eq('id', userId)
    .single();

  if (!userData.is_pro) {
    // Validate pipeline count
    if (userData.pipeline_count >= 2) {
      return {
        error: {
          message: "Free tier limited to 2 pipelines. Upgrade to Pro for unlimited pipelines.",
          code: "FREE_TIER_LIMIT"
        }
      };
    }

    // Validate source counts
    if ((data.subreddits?.length || 0) > 2 || (data.source?.length || 0) > 2) {
      return {
        error: {
          message: "Free tier limited to 2 sources per pipeline. Upgrade to Pro for unlimited sources.",
          code: "FREE_TIER_SOURCE_LIMIT"
        }
      };
    }
  }

  // Proceed with pipeline creation...
}
```

### 2. Analytics Restrictions

Create middleware to limit analytics data for free tier users:

```typescript
// New middleware to check analytics access
export const checkAnalyticsAccess = async (req, res, next) => {
  const user = await getUser(req);
  
  if (!user.is_pro) {
    // Limit analytics data for free tier
    req.analyticsLimit = {
      timeRange: '7d', // Last 7 days only
      metrics: ['basic_views', 'basic_engagement'] // Basic metrics only
    };
  }
  
  next();
};
```

## Frontend Changes

### 1. AuthProvider Enhancement

Update the AuthProvider to include tier status and pipeline count:

```typescript
// src/components/providers/auth/AuthProvider.tsx
type AuthContextType = {
  // ... existing types
  isPro: boolean;
  pipelineCount: number;
  upgradeRequired: boolean;
  showUpgradeModal: () => void;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [pipelineCount, setPipelineCount] = useState(0);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Fetch user data including pro status
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data } = await supabase
          .from('users')
          .select('is_pro, pipeline_count')
          .eq('id', user.id)
          .single();
        
        setIsPro(data?.is_pro || false);
        setPipelineCount(data?.pipeline_count || 0);
      };
      
      fetchUserData();
    }
  }, [user]);

  // ... rest of the provider
}
```

### 2. PipelineForm Updates

Update the PipelineForm to enforce tier restrictions:

```typescript
// src/components/pipeline/PipelineForm.tsx
export const PipelineForm = () => {
  const { isPro, pipelineCount } = useAuth();
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

  // Add validation before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro) {
      // Check pipeline limit
      if (pipelineCount >= 2) {
        setShowUpgradeAlert(true);
        return;
      }

      // Check source limits
      if ((subreddits.filter(s => s.trim()).length > 2) || 
          (sources.filter(s => s.trim()).length > 2)) {
        setShowUpgradeAlert(true);
        return;
      }
    }

    // Proceed with creation...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Existing form fields */}
      
      {showUpgradeAlert && (
        <Alert variant="warning">
          <AlertTitle>Upgrade Required</AlertTitle>
          <AlertDescription>
            You've reached the free tier limit. Upgrade to Pro for unlimited pipelines and sources.
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => router.push('/pricing')}
            >
              View Pricing
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};
```

### 3. ContentSourcesCard Enhancement

Update the ContentSourcesCard to limit inputs for free tier:

```typescript
// src/components/pipeline/cards/ContentSourcesCard.tsx
export const ContentSourcesCard = () => {
  const { isPro } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Sources</CardTitle>
        <CardDescription>
          {!isPro && (
            <Badge variant="secondary">
              Free Tier: Max 2 sources each
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Subreddits */}
        <div className="space-y-2">
          {subreddits.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={subreddits[index]}
                onChange={(e) => handleSubredditChange(index, e.target.value)}
                disabled={!isPro && index >= 2}
                placeholder={!isPro && index >= 2 ? "Upgrade to Pro for more" : "Enter subreddit"}
              />
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubreddit(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSubreddit}
            disabled={!isPro && subreddits.length >= 2}
          >
            {!isPro && subreddits.length >= 2 ? (
              <Link href="/pricing">Upgrade for More</Link>
            ) : (
              "Add Subreddit"
            )}
          </Button>
        </div>

        {/* Similar changes for Sources section */}
      </CardContent>
    </Card>
  );
};
```

### 4. Dashboard Updates

Update the Dashboard to show tier status and limits:

```typescript
// src/components/dashboard/DashboardLayout.tsx
export function DashboardLayout() {
  const { isPro, pipelineCount } = useAuth();

  return (
    <div>
      {!isPro && pipelineCount > 0 && (
        <div className="mb-4">
          <Alert>
            <AlertTitle>
              Free Tier: {pipelineCount}/2 Pipelines Used
            </AlertTitle>
            <AlertDescription>
              {pipelineCount >= 2 ? (
                <span>
                  You've reached the pipeline limit. 
                  <Link href="/pricing" className="ml-2 underline">
                    Upgrade to Pro
                  </Link>
                </span>
              ) : (
                <span>
                  {2 - pipelineCount} pipelines remaining in free tier
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Existing dashboard content */}
    </div>
  );
}
```

### 5. Analytics UI Restrictions

Update the analytics components to show limited data for free tier:

```typescript
// src/components/dashboard/AnalyticsSection.tsx
export function AnalyticsSection() {
  const { isPro } = useAuth();
  
  return (
    <div>
      <h2>Analytics</h2>
      
      {/* Basic analytics - available to all */}
      <BasicAnalytics />
      
      {/* Advanced analytics - pro only */}
      {isPro ? (
        <AdvancedAnalytics />
      ) : (
        <div className="rounded-lg border p-4 text-center">
          <h3>Advanced Analytics</h3>
          <p>Upgrade to Pro to access advanced analytics</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/pricing')}
          >
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Implementation Steps

1. **Database Changes**
   - Add pipeline_count field to users table
   - Create trigger for pipeline count
   - Add RLS policies

2. **Backend Changes**
   - Update createPipeline function
   - Add analytics middleware

3. **Frontend Changes**
   - Enhance AuthProvider
   - Update PipelineForm
   - Modify ContentSourcesCard
   - Update Dashboard
   - Restrict Analytics UI

4. **Testing**
   - Test free tier limits
   - Test pro tier features
   - Test upgrade flow

## Free Tier Limitations

- Maximum 2 pipelines
- Maximum 2 content sources per pipeline
- Basic analytics only
- Standard support

## Pro Tier Features

- Unlimited pipelines
- Unlimited content sources
- Advanced analytics
- Priority support

## Upgrade Flow

1. User hits a free tier limit
2. System shows upgrade prompt
3. User clicks "Upgrade to Pro"
4. User is redirected to pricing page
5. User completes payment
6. User is redirected to dashboard with pro features enabled
