import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Home from './pages/Home';
import { Dashboard } from './components/Dashboard';
import Users from './components/Users';
import Stocks from './components/Stocks';
import Orders from './components/Orders';
import Transactions from './components/Transactions';
import Wallet from './components/Wallet';
import AppDownload from './components/AppDownload';
import Profile from './components/Profile';

import './App.css'

function App() {
  return (
    <>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />

               {/* Dashboard with nested routes */}
               <Route path="/home" element={<Home />}>
                 <Route index element={<Dashboard />} />
                 <Route path="users" element={<Users />} />
                 <Route path="stock" element={<Stocks />} />
                 <Route path="orders" element={<Orders />} />
                 <Route path="transactions" element={<Transactions />} />
                 <Route path="wallet" element={<Wallet />} />
                 <Route path="download" element={<AppDownload />} />
                 <Route path="profile" element={<Profile />} />
               </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
