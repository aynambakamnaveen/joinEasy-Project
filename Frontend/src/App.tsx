import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import SideBar from "./Components/SideBar";
import Home from "./Pages/Home";
import Login from "./Components/Login";
import { Toaster } from "react-hot-toast";
import MyAssignment from "./Pages/MyAssignment";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  const isAuthPage = location.pathname === "/login";

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      {!isAuthPage && (
        <SideBar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
      )}

      {/* Main area */}
      <main className={isAuthPage ? "" : "min-w-0 lg:ml-64"}>

        {/* Mobile menu */}
        {!isAuthPage && (
          <header className="flex h-16 items-center px-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
          </header>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path='/myAssignments' element={<MyAssignment/>}/>
        </Routes>
        <Toaster
          position="top-center"
          containerStyle={{ zIndex: 99999 }}
        />
      </main>
    </div>
  );
}

export default App;