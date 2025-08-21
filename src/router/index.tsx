// src/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
// import NotFound from "../pages/NotFound";
import PrivateRoute from "../components/PrivateRoute";
import ProductList from "../pages/products/ProductList";
import ProviderList from "../pages/providers/ProviderList";
import ProfitSummary from "../pages/reports/ProfitSummary";
import DashboardHome from "../pages/Dashboard";
import ExecutiveDashboard from "../pages/ExecutiveDashboard";
import Unauthorized from "../pages/Unauthorized";
import AppLayout from "../components/AppLayout";
import CategoriesList from "../pages/categories/CategoriesList";
import UnitList from "../pages/units/UnitsList";
import PurchaseList from "../pages/purchases/PurchaseList";
import SaleList from "../pages/sales/SaleList";
import UserList from "../pages/users/UserList";
import CashClosingPage from "../pages/cashClosing/CashClosingPage";
import ExpenseList from "../pages/expenses/ExpenseList";
import PendingSales from "../pages/sales/PendingSales";
import ClientList from "../pages/clients/ClientList";
import POSPage from "../pages/sales/POSPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <PrivateRoute />,
        children: [
          { path: "/", element: <DashboardHome /> },
          { path: "/executive-dashboard", element: <ExecutiveDashboard /> },
          { path: "/pos", element: <POSPage /> },
          { path: "/ventas", element: <SaleList /> },
          {
            path: "/products",
            element: <ProductList />,
          },
          {
            path: "/purchases",
            element: <PurchaseList />,
          },
          {
            path: "/providers",
            element: <ProviderList />,
          },
          {
            path: "/reports/profit-summary",
            element: <ProfitSummary />,
          },
          { path: "/categories", element: <CategoriesList /> },
          { path: "/units", element: <UnitList /> },
          { path: "/expenses", element: <ExpenseList /> },
          { path: "/cash-closings", element: <CashClosingPage /> },
          { path: "/pending-sales", element: <PendingSales /> },
          { path: "/clients", element: <ClientList /> },
        ],
      },

      {
        element: <PrivateRoute allowedRoles={["ADMIN"]} />, // SOLO ADMIN
        children: [
          { path: "/users", element: <UserList /> },
          // Si tienes otras rutas solo admin, aquí
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  { path: "/unauthorized", element: <Unauthorized /> },
]);
