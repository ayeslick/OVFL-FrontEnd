import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, DollarSign, Clock, Zap } from 'lucide-react'

const stats = [
  {
    label: 'Total Portfolio Value',
    value: '$24,567.89',
    change: '+12.34%',
    changeType: 'positive' as const,
    icon: DollarSign
  },
  {
    label: 'Active Streams',
    value: '3',
    change: '+1 this week',
    changeType: 'positive' as const,
    icon: Zap
  },
  {
    label: 'Total Earned',
    value: '$2,456.78',
    change: '+5.67%',
    changeType: 'positive' as const,
    icon: TrendingUp
  },
  {
    label: 'Avg. Stream Duration',
    value: '45 days',
    change: '12 days left',
    changeType: 'neutral' as const,
    icon: Clock
  }
]

export function PortfolioStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="ovfl-shadow hover:ovfl-shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success' :
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}