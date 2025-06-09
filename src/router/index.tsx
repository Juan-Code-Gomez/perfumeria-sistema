// src/router/index.tsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PrivateRoute from "../components/PrivateRoute";
import ProductList from "../pages/products/ProductList";
import ProviderList from "../pages/providers/ProviderList";
import RegisterPurchase from "../pages/purchases/RegisterPurchase";
import PurchaseHistory from "../pages/purchases/PurchaseHistory";
import ExpenseForm from "../pages/expenses/ExpenseForm";
import ExpenseHistory from "../pages/expenses/ExpenseHistory";
import RegisterSale from "../pages/sales/RegisterSale";
import SalesHistory from "../pages/sales/SalesHistory";
import InvoiceView from "../pages/sales/InvoiceView";
import ProfitSummary from "../pages/reports/ProfitSummary";
import DashboardHome from "../pages/DashboardHome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardHome />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/products",
    element: <ProductList />,
  },
  {
    path: "/providers",
    element: <ProviderList />,
  },
  {
    path: "/purchases/register",
    element: <RegisterPurchase />,
  },
  {
    path: "/purchases/history",
    element: <PurchaseHistory />,
  },
  {
    path: "/expenses/new",
    element: <ExpenseForm />,
  },
  {
    path: "/expenses/history",
    element: <ExpenseHistory />,
  },
  {
    path: "/sales/register",
    element: <RegisterSale />,
  },
  {
    path: "/sales/history",
    element: <SalesHistory />,
  },
  {
    path: "/sales/invoice/:id",
    element: <InvoiceView />,
  },
  {
    path: "/reports/profit-summary",
    element: <ProfitSummary />,
  },
]);
