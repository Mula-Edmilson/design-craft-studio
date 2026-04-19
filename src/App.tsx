import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { MainLayout } from "@/components/layout/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Checkout from "./pages/Checkout";
import CustomOrder from "./pages/CustomOrder";
import ClienteLogin from "./pages/ClienteLogin";
import ClientePainel from "./pages/ClientePainel";
import Pedidos from "./pages/Pedidos";
import StaffPlaceholder from "./pages/StaffPlaceholder";
import NotFound from "./pages/NotFound.tsx";

// Initialize API client (registers window.api for legacy compat)
import "@/lib/api";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/encomenda-personalizada" element={<CustomOrder />} />
            <Route path="/cliente-login" element={<ClienteLogin />} />
            <Route path="/cliente-painel" element={<ClientePainel />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/login" element={<StaffPlaceholder title="Login Staff" description="Painel administrativo PrintPalette." />} />
            <Route path="/admin" element={<StaffPlaceholder title="Painel Admin" description="Gestão de produtos, encomendas, clientes e equipa." />} />
            <Route path="/entrega-login" element={<StaffPlaceholder title="Login Entregadores" description="Acesso para a equipa de entregas." />} />
            <Route path="/entrega-painel" element={<StaffPlaceholder title="Painel de Entregas" description="As suas entregas em curso." />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
