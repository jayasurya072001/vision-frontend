import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inputs from "./pages/Inputs";
import Tasks from "./pages/Tasks";
import Predictions from "./pages/Predictions";
import Labelling from "./pages/Labelling";
import TeamPage from "./pages/TeamPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inputs" element={<Inputs />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/predictions" element={<Predictions />} />
        <Route path="/labelling" element={<Labelling />} />
        <Route path="/team" element={<TeamPage />} />
      </Routes>
    </Router>
  );
}

export default App;
