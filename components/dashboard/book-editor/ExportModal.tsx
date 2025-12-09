"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { useState } from "react"

const BRAND_COLOR = "#a6261c"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: string, scope: string) => void
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [scope, setScope] = useState<"entire" | "chapter">("entire")

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    )
  }

  const handleExport = () => {
    if (selectedFormats.length > 0) {
      selectedFormats.forEach((format) => {
        onExport(format, scope)
      })
      onClose()
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-0 shadow-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg">
          <DialogPrimitive.Title className="sr-only">Export Book</DialogPrimitive.Title>
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Export Book</CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">Choose your format and scope.</p>

              {/* Formats */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Formats:</h4>
                <div className="space-y-2">
                  {["PDF", "ePub", "Google Docs"].map((format) => (
                    <label
                      key={format}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format.toLowerCase())}
                        onChange={() => toggleFormat(format.toLowerCase())}
                        className="w-4 h-4 text-[#a6261c] border-gray-300 rounded focus:ring-[#a6261c]"
                      />
                      <span className="text-sm text-gray-900">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Scope:</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="entire"
                      checked={scope === "entire"}
                      onChange={() => setScope("entire")}
                      className="w-4 h-4 text-[#a6261c] border-gray-300 focus:ring-[#a6261c]"
                    />
                    <span className="text-sm text-gray-900">Entire book</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      value="chapter"
                      checked={scope === "chapter"}
                      onChange={() => setScope("chapter")}
                      className="w-4 h-4 text-[#a6261c] border-gray-300 focus:ring-[#a6261c]"
                    />
                    <span className="text-sm text-gray-900">Selected chapter</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={selectedFormats.length === 0}
                  className="bg-[#a6261c] hover:bg-[#8e1e16] text-white"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

