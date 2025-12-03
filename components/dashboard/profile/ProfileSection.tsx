"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Camera } from "lucide-react"
import { ChangeEmailModal } from "./ChangeEmailModal"
import { ChangePasswordModal } from "./ChangePasswordModal"

const BRAND_COLOR = "#a6261c"

interface ProfileSectionProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  onUpdate: (updates: { name?: string; email?: string; avatar?: string }) => void
}

export function ProfileSection({ user, onUpdate }: ProfileSectionProps) {
  const [name, setName] = useState(user.name)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  const handleNameBlur = () => {
    if (name !== user.name) {
      onUpdate({ name })
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement photo upload
                    console.log("Change photo")
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNameBlur()
                    }
                  }}
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEmailModalOpen(true)}>
                    Change
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Lock className="h-4 w-4" />
                    <span>••••••••</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        currentEmail={user.email}
        onUpdate={(newEmail) => onUpdate({ email: newEmail })}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  )
}

