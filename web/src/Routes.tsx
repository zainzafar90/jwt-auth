import { BrowserRouter, Routes as RRoutes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Bye } from "./pages/Bye";
import { Header } from "./Header";

export function Routes() {
  return (
    <BrowserRouter>
      <Header />
      <RRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bye" element={<Bye />} />
      </RRoutes>
    </BrowserRouter>
  );
}
