"use client"

import { useRouter } from "next/navigation"
import { ReviewForm } from "@/components/review-form"

export function ReviewFormWrapper({ templateId }: { templateId: string }) {
  const router = useRouter()
  return <ReviewForm templateId={templateId} onSuccess={() => router.refresh()} />
}
