import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { IssuesProvider } from "@/context/IssuesContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ReportIssue from "./pages/ReportIssue";
import IssuesList from "./pages/IssuesList";
import MapView from "./pages/MapView";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <IssuesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/issues" element={<IssuesList />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </IssuesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
