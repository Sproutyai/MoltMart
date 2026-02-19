export interface PaymentMethod {
  id: string
  type: "visa" | "mastercard" | "amex" | "discover" | "unknown"
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  createdAt: string
}

export interface BillingAddress {
  name: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}
