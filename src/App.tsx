import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/config/wagmi';
import { Navigation } from '@/components/Layout/Navigation';
import { ProtectedRoute } from '@/components/Layout/ProtectedRoute';
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Deposit from "./pages/Deposit";
import Markets from "./pages/Markets";
import Testing from "./pages/Testing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
            <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
