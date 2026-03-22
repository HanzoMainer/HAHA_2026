import { createBrowserRouter } from "react-router-dom"
import { DashboardPage } from "@/pages/DashboardPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "*",
    element: (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Страница не найдена</p>
        </div>
      </div>
    ),
  },
])
