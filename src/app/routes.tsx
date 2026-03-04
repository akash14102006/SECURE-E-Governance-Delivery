import { createBrowserRouter } from "react-router";
import { Login } from "./screens/Login";
import { Dashboard } from "./screens/Dashboard";
import { SecurityMonitoring } from "./screens/SecurityMonitoring";
import { TransparencyDashboard } from "./screens/TransparencyDashboard";
import { PolicyControl } from "./screens/PolicyControl";
import { Settings } from "./screens/Settings";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "security",
        element: <SecurityMonitoring />,
      },
      {
        path: "transparency",
        element: <TransparencyDashboard />,
      },
      {
        path: "policy",
        element: <PolicyControl />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
