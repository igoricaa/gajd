"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const MOCK_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: 9,
    features: [
      'Basic features',
      'Email support',
      '1 user',
      'Basic analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for professionals',
    price: 29,
    features: [
      'All basic features',
      'Priority support',
      '5 users',
      'Advanced analytics',
      'API access'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    features: [
      'All pro features',
      '24/7 support',
      'Unlimited users',
      'Custom integrations',
      'Dedicated account manager'
    ]
  }
]

export function SubscriptionPlans() {
  const currentPlan = 'basic' // This would come from your user data

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {MOCK_PLANS.map((plan) => (
        <Card 
          key={plan.id}
          className={plan.isPopular ? 'border-primary' : undefined}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            {plan.isPopular && (
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Most Popular
              </span>
            )}
            <div className="mt-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === plan.id ? "outline" : "default"}
            >
              {currentPlan === plan.id ? "Current Plan" : "Switch to this plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 