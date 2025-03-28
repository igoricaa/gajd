// import type Stripe from "stripe"

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
}

export interface SubscriptionHistoryItem {
  id: string
  date: string
  type: string
  amount: number
  status: string
  plan: string
}

// export interface CurrentSubscription {
//   id: string
//   status: Stripe.Subscription.Status
//   currentPeriodEnd: number
//   planId: string
//   cancelAtPeriodEnd: boolean
// }

export interface PaymentMethod {
  id: string
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
} 