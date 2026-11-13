import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verify?: string }>;
}) {
  const { verify } = await searchParams;

  if (verify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              A sign-in link has been sent to your email address.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Uptime Monitor</CardTitle>
          <CardDescription>Sign in to manage your monitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email magic link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              await signIn("resend", formData);
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send magic link
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* GitHub OAuth */}
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
