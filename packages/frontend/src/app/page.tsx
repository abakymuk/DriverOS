import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, Truck, Users, BarChart3, Settings, LogIn } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 relative">
        {/* Theme Toggle */}
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">DriverOS</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Modern Container Logistics Management System
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Terminal Management
            </CardTitle>
            <CardDescription>
              Efficiently manage container terminals with real-time capacity
              tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Slot Booking</Badge>
              <Badge variant="secondary">Capacity Planning</Badge>
              <Badge variant="secondary">Real-time Updates</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Driver Operations
            </CardTitle>
            <CardDescription>
              Streamline driver workflows with mobile-first interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Trip Management</Badge>
              <Badge variant="secondary">Gate Passes</Badge>
              <Badge variant="secondary">Offline Support</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Dispatcher Console
            </CardTitle>
            <CardDescription>
              Comprehensive dashboard for logistics coordination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Real-time Monitoring</Badge>
              <Badge variant="secondary">Analytics</Badge>
              <Badge variant="secondary">Alert Management</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics & Insights
            </CardTitle>
            <CardDescription>
              Data-driven insights for operational optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Performance Metrics</Badge>
              <Badge variant="secondary">Predictive Analytics</Badge>
              <Badge variant="secondary">Custom Reports</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Simulation Engine
            </CardTitle>
            <CardDescription>
              Advanced simulation for testing and optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary">Scenario Testing</Badge>
              <Badge variant="secondary">Load Simulation</Badge>
              <Badge variant="secondary">Optimization</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Terminals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">1000+</div>
            <div className="text-sm text-muted-foreground">Drivers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Containers/Day</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>© 2025 DriverOS. All rights reserved.</p>
      </div>
    </div>
  );
}
