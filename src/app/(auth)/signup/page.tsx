import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthForm } from "@/components/auth-form"

export default function SignupPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
        </CardContent>
      </Card>
    </div>
  )
}
