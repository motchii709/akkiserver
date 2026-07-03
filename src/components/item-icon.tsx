"use client"

import { getNamespaceColor, getInitials } from "@/lib/utils"

interface ItemIconProps {
  namespace: string
  name: string
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
}

export function ItemIcon({ namespace, name, size = "md" }: ItemIconProps) {
  const color = getNamespaceColor(namespace)
  const initials = getInitials(name)

  return (
    <div
      className={`${sizeMap[size]} rounded-lg flex items-center justify-center font-bold shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        border: `1px solid ${color}40`,
        color,
      }}
      title={`${namespace}:${name}`}
    >
      {initials}
    </div>
  )
}
