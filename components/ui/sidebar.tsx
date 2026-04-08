"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

function SidebarProvider({
  children,
  defaultOpen = true,
  className,
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const toggleSidebar = React.useCallback(() => setOpen((value) => !value), [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div className={cn("flex min-h-screen w-full", className)}>{children}</div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  className,
  children,
}: React.ComponentProps<"aside">) {
  const { open } = useSidebar()

  return (
    <aside
      data-open={open}
      className={cn(
        "border-r bg-card text-card-foreground transition-all duration-200",
        open ? "w-56 md:w-64" : "w-14 md:w-[72px]",
        className
      )}
    >
      {children}
    </aside>
  )
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("border-b p-3", className)} {...props} />
}

function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-1.5 md:p-2", className)} {...props} />
}

function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />
}

function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1", className)} {...props} />
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />
}

function SidebarMenuButton({
  isActive,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean
}) {
  const { open } = useSidebar()
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center rounded-md px-1.5 text-sm transition-colors md:px-2",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
        !open && "justify-center px-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 flex-1", className)} {...props} />
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background", className)}
      {...props}
    >
      ☰
    </button>
  )
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
}
