import { 
  Dashboard as DashboardIcon, 
  People as UsersIcon, 
  TrendingUp, 
  AttachMoney, 
  AccountBalanceWallet, 
  Person,
  Receipt as TransactionsIcon,
  ShoppingCart as OrdersIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon
} from "@mui/icons-material"

import { Dashboard } from "./components/Dashboard"
import Users from "./components/Users"
import Stock from "./components/Stocks"
// import { Market } from "./components/Market"
import Wallet from "./components/Wallet" 
import Profile from "./components/Profile"
import Transactions from "./components/Transactions"
import Orders from "./components/Orders"
import AppDownload from "./components/AppDownload"
import CreditRequests from "./components/CreditRequests"

export const navigationItems = [
  { title: "Dashboard", icon: DashboardIcon, component: Dashboard, path: "/home" },
  { title: "Users", icon: UsersIcon, component: Users, path: "/home/users" },
  { title: "Stock", icon: TrendingUp, component: Stock, path: "/home/stock" },
  { title: "Orders", icon: OrdersIcon, component: Orders, path: "/home/orders" },
  { title: "Transactions", icon: TransactionsIcon, component: Transactions, path: "/home/transactions" },
  { title: "Wallet", icon: AccountBalanceWallet, component: Wallet, path: "/home/wallet" },
  { title: "Credit Requests", icon: CreditCardIcon, component: CreditRequests, path: "/home/credit-requests" },
  { title: "App Download", icon: DownloadIcon, component: AppDownload, path: "/home/download" },
  // { title: "Market", icon: AttachMoney, component: Market, path: "/home/market" },
  { title: "Profile", icon: Person, component: Profile, path: "/home/profile" },
]
