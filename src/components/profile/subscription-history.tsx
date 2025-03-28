"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

const MOCK_HISTORY = [
  {
    id: '1',
    date: '2024-03-15',
    type: 'Subscription Renewal',
    amount: 29.00,
    status: 'Completed',
    plan: 'Pro'
  },
  {
    id: '2',
    date: '2024-02-15',
    type: 'Subscription Renewal',
    amount: 29.00,
    status: 'Completed',
    plan: 'Pro'
  },
  {
    id: '3',
    date: '2024-01-15',
    type: 'Plan Upgrade',
    amount: 29.00,
    status: 'Completed',
    plan: 'Pro'
  },
  {
    id: '4',
    date: '2024-01-15',
    type: 'Subscription Renewal',
    amount: 9.00,
    status: 'Completed',
    plan: 'Basic'
  }
]

export function SubscriptionHistory() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_HISTORY.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {format(new Date(item.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>${item.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  item.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>{item.plan}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 