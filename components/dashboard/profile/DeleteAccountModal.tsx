"use client"

import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as DialogPrimitive from "@radix-ui/react-dialog"

const BRAND_COLOR = "#a6261c"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement account deletion logic
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    onClose()
    // TODO: Redirect to login or home page
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-red-200 bg-white p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 mb-1">Warning</p>
                  <p className="text-sm text-red-800">
                    This will permanently delete your books and data. This action cannot be undone.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmEmail">
                    To confirm, please type your email address
                  </Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? "Deleting..." : "Delete My Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

