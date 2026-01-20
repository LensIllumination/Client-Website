import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

import { CameraIcon } from "lucide-react"

function Navbar() {
  return (
    <NavigationMenu className="w-full">
      <NavigationMenuItem className="w-[100vw] flex items-center px-4 py-8 justify-center gap-2">
        <CameraIcon size="40"/>
        <NavigationMenuLink href="/">
          <text className="text-4xl font-bold">Lens Illumination</text>
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenu>  
  )
}

export default Navbar