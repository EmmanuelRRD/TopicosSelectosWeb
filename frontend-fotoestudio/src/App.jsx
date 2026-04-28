import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/login/Login'
import Register from './pages/login/Register'
import Dashboard from './pages/admin/Dashboard'
import ExampleUseAPI from './pages/login/ExampleUseAPI'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/ExampleUseAPI" element={<ExampleUseAPI />} />
    </Routes>
  );
}

export default App;