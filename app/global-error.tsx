"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A client-side error occurred. You can try again, or refresh the page.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => reset()} variant="default">Try again</Button>
                <Button onClick={() => location.reload()} variant="outline">Refresh</Button>
              </div>
              {error?.message && (
                <details className="text-xs text-muted-foreground mt-4 whitespace-pre-wrap">
                  <summary>Details</summary>
                  {error.message}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}


