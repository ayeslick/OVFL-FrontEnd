import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { TrendingUp, Coins, BarChart3, PiggyBank } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: TrendingUp },
  { path: '/portfolio', label: 'Portfolio', icon: BarChart3 },
  { path: '/deposit', label: 'Deposit', icon: PiggyBank },
  { path: '/markets', label: 'Markets', icon: Coins },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-card border-b border-card-border ovfl-shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 ovfl-gradient rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">OVFL</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-card-border">
        <div className="px-4 py-2 flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className="flex-shrink-0">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}