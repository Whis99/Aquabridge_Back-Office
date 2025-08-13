import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material'
import seaBlueTheme from './theme'

import Login from './pages/Login';
import Home from './pages/Home';
import { Dashboard } from './components/Dashboard';

import './App.css'

function App() {
  return (
    <>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/sign-up" element={<SignUp />} /> */}

        {/* Dashboard with nested routes */}
        <Route path="/home" element={<Home />}>
          <Route index element={<Dashboard />} />
          {/* <Route path="account/new" element={<NewAccount />} />
          <Route path="account/view" element={<ViewAccount />} /> */}
        </Route>
      </Routes>
    </Router>
    </>
    //   <ThemeProvider theme={seaBlueTheme}>
    //   {/* <CssBaseline /> */}
      
    // </ThemeProvider>
  )
}

export default App
