import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import { routers } from "./router";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { initVTracer } from "@/lib/vectorization/vtracer.wasm";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter(routers);

  // 初始化 VTracer WASM（支持彩色矢量化）
  useEffect(() => {
    initVTracer()
      .then(() => {
        console.log('✅ VTracer 彩色矢量化已就绪');
      })
      .catch((error) => {
        console.error('❌ VTracer 初始化失败:', error);
        toast.error('VTracer 初始化失败，将使用备用算法', {
          description: error.message
        });
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
};

export default App;
