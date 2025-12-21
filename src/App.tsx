import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RestaurantTables from "./pages/RestaurantTables";
import Orders from "./pages/Orders";
import Bill from "./pages/Bill";
import TableOrder from "./pages/TableOrder";
import SalesPos from "./pages/SalesPos";
import Kitchen from "./pages/Kitchen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tables" element={<RestaurantTables />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/bill/:tableId" element={<Bill />} />
          <Route path="/order/:tableId" element={<TableOrder />} />
          <Route path="/sales/pos" element={<SalesPos />} />
          <Route path="/kitchen" element={<Kitchen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
