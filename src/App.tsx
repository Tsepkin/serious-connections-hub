import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loading from "./pages/Loading";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import CreateProfile from "./pages/CreateProfile";
import Profiles from "./pages/Profiles";
import Chats from "./pages/Chats";
import Profile from "./pages/Profile";
import AdminBots from "./pages/AdminBots";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/bots" element={<AdminBots />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
