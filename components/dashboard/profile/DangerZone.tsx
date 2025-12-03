"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { DeleteAccountModal } from "./DeleteAccountModal"

export function DangerZone() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  )
}

