"use client"

import Image from "next/image"

interface TestimonialBlockProps {
  name: string
  quote: string
  photoUrl?: string
  company?: string
  role?: string
}

export function TestimonialBlock({
  name = "John Doe",
  quote = "This book changed my business completely!",
  photoUrl,
  company,
  role,
}: TestimonialBlockProps) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-lg">
      <p className="text-gray-700 italic mb-4">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image src={photoUrl} alt={name} width={48} height={48} className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
            {name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          {(company || role) && (
            <p className="text-sm text-gray-600">
              {role && `${role}`}
              {role && company && " at "}
              {company}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

