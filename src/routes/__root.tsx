import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "PwnWächter";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0c0d0f" },
      {
        name: "description",
        content:
          "Passwortfilter für Domain Controller: prüft Identitäten gegen Have I Been Pwned und hebt die Passwortrichtlinie gezielt an.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="de" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <TooltipProvider delayDuration={250}>
            <AppShell>
              <Outlet />
            </AppShell>
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#1b1d22",
                  border: "1px solid rgba(232,230,227,0.12)",
                  color: "#e8e6e3",
                },
              }}
            />
          </TooltipProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
