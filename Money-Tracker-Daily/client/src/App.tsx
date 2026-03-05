import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { MonthProvider } from "@/components/layout/MonthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CalendarTab } from "@/pages/CalendarTab";
import { AnalyticsTab } from "@/pages/AnalyticsTab";
import { ListTab } from "@/pages/ListTab";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={CalendarTab} />
        <Route path="/analytics" component={AnalyticsTab} />
        <Route path="/list" component={ListTab} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MonthProvider>
          <div className="min-h-screen bg-neutral-100 dark:bg-black sm:py-8 flex justify-center">
            {/* Limit max width for desktop viewing to maintain mobile app feel */}
            <div className="w-full sm:w-[400px] h-[100dvh] sm:h-[800px] bg-background sm:rounded-[40px] sm:shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] sm:border-8 border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
              <Router />
            </div>
          </div>
          <Toaster />
        </MonthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
