import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <AppHeader />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;