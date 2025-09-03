import { 
  Dashboard as DashboardIcon, 
  People as UsersIcon, 
  TrendingUp, 
  AttachMoney, 
  AccountBalanceWallet, 
  Person 
} from "@mui/icons-material"

import { Dashboard } from "./components/Dashboard"
import Users from "./components/Users"
import Stock from "./components/Stocks"
// import { Market } from "./components/Market"
import Wallet from "./components/Wallet" 
import Profile from "./components/Profile"

export const navigationItems = [
  { title: "Dashboard", icon: DashboardIcon, component: Dashboard, path: "/home" },
  { title: "Users", icon: UsersIcon, component: Users, path: "/home/users" },
  { title: "Stock", icon: TrendingUp, component: Stock, path: "/home/stock" },
  // { title: "Market", icon: AttachMoney, component: Market, path: "/home/market" },
  { title: "Wallet", icon: AccountBalanceWallet, component: Wallet, path: "/home/wallet" },
  { title: "Profile", icon: Person, component: Profile, path: "/home/profile" },
]
