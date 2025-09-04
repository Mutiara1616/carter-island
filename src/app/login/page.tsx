"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Anchor, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/dashboard")
      } else {
        setMessage(data.message || "Email atau password salah")
      }
    } catch {
      setMessage("Login gagal!")
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
  "h-11 rounded-xl border-2 border-slate-200 bg-white/70 backdrop-blur-sm " +
  "px-3 text-base shadow-sm placeholder:text-slate-400 " +
  "focus-visible:ring-0 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0 " +
  "disabled:opacity-60 disabled:cursor-not-allowed transition";

  const labelBase = "text-[13px] font-medium text-slate-700";

  const loginBtn = cn(
    "w-full h-10 rounded-xl font-semibold tracking-wide transition",
    // keadaan default: abu samar
    "bg-slate-200 text-slate-600 shadow-sm",
    // saat kursor Mendekat (hover di wrapper) ATAU hover langsung di tombol → biru
    "group-hover:bg-blue-600 group-hover:text-white hover:bg-blue-600 hover:text-white",
    // klik/pressed
    "active:bg-blue-700 active:scale-[.98]",
    // fokus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0",
    // disabled
    "disabled:opacity-60 disabled:cursor-not-allowed"
  )

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
        {/* Grid 2 kolom: kiri form, kanan gambar (gambar hidden di mobile) */}
        <div className="grid md:grid-cols-2">
          {/* LEFT: form */}
          <div className="px-6 py-4 md:px-8 py-6">
            <CardHeader className="p-0 mb-4 text-center">
              {/* LOGO */}
              <div className="flex justify-center mb-1">
                <span className="p-4 bg-blue-600 rounded-full">
                  <Anchor className="h-8 w-8 text-white" />
                </span>
              </div>
              {/* TITLE */}
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Carter Island AUV
              </CardTitle>
              <CardDescription>Sistem navigasi underwater Carter Island</CardDescription>
            </CardHeader>


            <CardContent className="p-0">
              {message && (
                <Alert className="mb-4 rounded-xl bg-red-600 text-white [&>svg]:text-white border-0">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-white">{message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email" className={labelBase}>Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@carterisland.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      message && "border focus-visible:ring-red-500 focus-visible:border-red-500"
                    )}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className={labelBase}>Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="kikipoiu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "pr-10", // ruang untuk ikon
                        message && "border focus-visible:ring-red-500 focus-visible:border-red-500"
                      )}
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent focus-visible:ring-0"
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 select-none">
                    {/* pakai checkbox native biar nggak perlu komponen tambahan */}
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      disabled={isLoading}
                    />
                    <span>Remember Me</span>
                  </label>
                  <Link href="#" className="text-blue-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>

                <Button type="submit" disabled={isLoading} className={cn(loginBtn, isLoading && "cursor-wait opacity-90")}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              {/* Helper credentials */}
              <div className="p-3 bg-muted rounded-md text-sm mt-6">
                <p className="font-medium mb-1">Test Credentials:</p>
                <p className="text-muted-foreground">Email: admin@carterisland.com</p>
                <p className="text-muted-foreground">Password: kikipoiu</p>
                <p className="text-muted-foreground">Email: user@carterisland.com</p>
                <p className="text-muted-foreground">Password: testpassword</p>
              </div>

              <p className="text-center text-sm mt-6">
                Don&apos;t have account?{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  Register Now!
                </Link>
              </p>
            </CardContent>
          </div>

          {/* RIGHT: image */}
          <div className="relative hidden md:block">
            {/* Pakai <Image /> kalau sudah setup domains di next.config.js */}
            {/* <Image
              src="https://images.unsplash.com/photo-1564665259197-7fcf80a32907?q=80&w=1600&auto=format&fit=crop"
              alt="AUV fish farm"
              fill
              priority
              className="object-cover"
            /> */}
            <img
              src="https://images.unsplash.com/photo-1564665259197-7fcf80a32907?q=80&w=1600&auto=format&fit=crop"
              alt="AUV fish farm"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Card>
            {isLoading && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          {/* Loader ring modern */}
          <div className="relative">
            {/* ring dasar */}
            <div className="h-16 w-16 rounded-full border-4 border-white/20" />
            {/* ring berputar */}
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-white animate-spin" />
          </div>

          {/* teks + dots */}
          <div className="mt-4 text-white/90 font-medium">
            Logging in…
            <span className="inline-flex ml-1">
              <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:-0.2s]" />
              <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-white/80 animate-bounce" />
              <span className="mx-0.5 h-1.5 w-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:0.2s]" />
            </span>
          </div>
        </div>
      )}

    </div>
  )
}
