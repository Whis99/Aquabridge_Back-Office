import { 
  Dashboard as DashboardIcon, 
  People as UsersIcon, 
  TrendingUp, 
  AttachMoney, 
  AccountBalanceWallet, 
  Person 
} from "@mui/icons-material"

import { Dashboard } from "./components/Dashboard"
// import { Users } from "./components/Users"
// import { Stock } from "./components/Stock"
// import { Market } from "./components/Market"
// import { Wallet } from "./components/Wallet"
// import { Profile } from "./components/Profile"

export const navigationItems = [
  { title: "Dashboard", icon: DashboardIcon, component: Dashboard },
//   { title: "Users", icon: UsersIcon, component: Users },
//   { title: "Stock", icon: TrendingUp, component: Stock },
//   { title: "Market", icon: AttachMoney, component: Market },
//   { title: "Wallet", icon: AccountBalanceWallet, component: Wallet },
//   { title: "Profile", icon: Person, component: Profile },
]
