import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, TrendingUp, Zap, Shield, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const metrics = [
  { label: 'Total Value Locked', value: '$12.4M', change: '+23.4%' },
  { label: 'Active Markets', value: '8', change: '+2' },
  { label: 'Total Streams', value: '1,247', change: '+156' },
  { label: 'Average APY', value: '8.7%', change: '+1.2%' },
]

const steps = [
  {
    icon: DollarSign,
    title: 'Deposit Principal Tokens',
    description: 'Select from approved Pendle PT markets and deposit your tokens'
  },
  {
    icon: Zap,
    title: 'Get Instant Liquidity',
    description: 'Receive ovflETH immediately representing your principal value'
  },
  {
    icon: TrendingUp,
    title: 'Earn Streaming Yield',
    description: 'Enjoy continuous yield streaming via Sablier until PT maturity'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-light/5" />
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
              Trade Your
              <span className="block ovfl-gradient bg-clip-text text-transparent">
                PT Yield
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              OVFL transforms Pendle Principal Tokens into instant liquidity plus streaming yield 
              and sell/borrow against your streaming yield. 
              Deposit PTs, get immediate ovflETH, and earn through maturity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/deposit">
                <Button size="xl" variant="hero" className="w-full sm:w-auto">
                  Start Earning
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={metric.label} className="animate-slide-in hover:scale-105 transition-transform duration-200" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="text-3xl font-bold text-primary">{metric.value}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-success">{metric.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">How OVFL Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to unlock the value of your Principal Tokens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 ovfl-gradient rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">
                Built for DeFi Natives
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                OVFL provides a seamless experience for managing Principal Token positions 
                with institutional-grade security and transparent yield distribution.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Secure & Audited</h3>
                    <p className="text-muted-foreground">Smart contracts audited by top security firms</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-light/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Instant Liquidity</h3>
                    <p className="text-muted-foreground">Get immediate access to your principal value</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Continuous Yield</h3>
                    <p className="text-muted-foreground">Earn streaming rewards until PT maturity</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-right">
              <Card className="p-8 ovfl-shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready to get started?</CardTitle>
                  <CardDescription>
                    Join thousands of users earning with OVFL
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link to="/deposit">
                    <Button size="lg" className="w-full">
                      Start Depositing
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/markets">
                    <Button size="lg" variant="outline" className="w-full">
                      Explore Markets
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}