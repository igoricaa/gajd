"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const categories = [
  "All",
  "Frontend",
  "WordPress",
  "CSS",
  "Animations",
  "React",
  "Next.js",
  "Auth",
  "CMS",
  "Courses",
]

export function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <ScrollArea className="w-full rounded-md border">
      <div className="flex flex-col space-y-2 p-4">
        <h2 className="font-semibold">Categories</h2>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  )
}

