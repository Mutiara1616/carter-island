// src/app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Users, 
  Activity,
  Fish,
  Camera,
  Waves,
  AlertCircle,
  Menu
} from "lucide-react"

interface DashboardUser {
  id: string
  email: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  role: string
  department?: string | null
  position?: string | null
  status?: string
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'streaming' | 'users' | 'settings'>('streaming')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (res.ok) {
          const userData = await res.json()
          setUser(userData.user)
        } else {
          localStorage.removeItem("token")
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isAdmin = user.role === 'ADMIN' || user.role === 'admin'

  const sidebarItems = [
    {
      id: 'streaming' as const,
      label: 'Fish Streaming',
      icon: Fish,
      description: 'Live underwater monitoring'
    },
    ...(isAdmin ? [{
      id: 'users' as const,
      label: 'User Management',
      icon: Users,
      description: 'Manage system users'
    }] : []),
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Carter Island</h1>
              <p className="text-sm text-slate-500">AUV Control System</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {user.firstName || user.username || user.email}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {user.role}
                  </Badge>
                  {user.department && (
                    <span className="text-xs text-slate-500">{user.department}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {user.role}
            </Badge>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {activeTab === 'streaming' && <StreamingContent />}
          {activeTab === 'users' && isAdmin && <UserManagementContent />}
          {activeTab === 'settings' && <SettingsContent user={user} />}
        </div>
      </div>
    </div>
  )
}

// Streaming Component
function StreamingContent() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamStats] = useState({
    viewers: 12,
    duration: '02:34:12',
    quality: 'HD 1080p',
    fps: 30
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fish Farm Monitoring</h2>
          <p className="text-slate-600">Live underwater camera feed from Carter Island AUV</p>
        </div>
        <Button 
          onClick={() => setIsStreaming(!isStreaming)}
          variant={isStreaming ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          {isStreaming ? 'Stop Stream' : 'Start Stream'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Stream Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {isStreaming ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                Viewers: {streamStats.viewers}
              </div>
              <div className="text-sm text-slate-600">
                Duration: {streamStats.duration}
              </div>
              <div className="text-sm text-slate-600">
                Quality: {streamStats.quality}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Live Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {isStreaming ? 'Live Stream Active' : 'Stream Offline'}
                </p>
                <p className="text-sm opacity-75">
                  Carter Island Underwater Camera
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// User Management Component (Admin only)
function UserManagementContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-600">Manage system users and their permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              User management feature akan diintegrasikan dengan database. Admin bisa manage users, roles, dan permissions di sini.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Component
function SettingsContent({ user }: { user: DashboardUser }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
        <p className="text-slate-600">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            {user.username && (
              <div>
                <label className="text-sm font-medium text-slate-700">Username</label>
                <p className="text-sm text-slate-600">{user.username}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <p className="text-sm text-slate-600">{user.role}</p>
            </div>
            {user.department && (
              <div>
                <label className="text-sm font-medium text-slate-700">Department</label>
                <p className="text-sm text-slate-600">{user.department}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Settings panel coming soon. Preferences untuk streaming, notifications, dll.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}