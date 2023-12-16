import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <main className="App">
            <Outlet/>
            {/* Outlet représente tous les enfants du component Layout */}
        </main>
    );
}

export default Layout;