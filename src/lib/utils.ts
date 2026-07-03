import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatItemName(id: string): string {
  const parts = id.split(":");
  const namePart = parts.length > 1 ? parts[1] : parts[0];
  return namePart
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseItemId(id: string): { namespace: string; name: string } {
  const parts = id.split(":");
  if (parts.length > 1) {
    return { namespace: parts[0], name: parts[1] };
  }
  return { namespace: "minecraft", name: parts[0] };
}

export function getNamespaceColor(namespace: string): string {
  const colors: Record<string, string> = {
    minecraft: "#67c23a",
    create: "#e6a23c",
    tfmg: "#f56c6c",
    farm_and_charm: "#909399",
    vinery: "#b37feb",
    bakery: "#e6a23c",
    brewery: "#f56c6c",
    supplementaries: "#409eff",
    touhou_little_maid: "#ff85c0",
    createoreexcavation: "#67c23a",
    lightmanscurrency: "#f0c040",
    candlelight: "#ff85c0",
    createdieselgenerators: "#e6a23c",
    create_bic_bit: "#67c23a",
    createpropulsion: "#67c23a",
    simulated: "#409eff",
  };
  return colors[namespace] || "#909399";
}

export function getInitials(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
