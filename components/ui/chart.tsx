"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, item]) => item.color)
  if (!colorConfig.length) {
    return null
  }
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
${colorConfig.map(([key, item]) => `  --color-${key}: ${item.color};`).join("\n")}
}
        `,
      }}
    />
  )
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn("h-[320px] w-full", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {isMounted ? (
          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        ) : null}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: {
  active?: boolean
  payload?: Array<{
    dataKey?: string | number
    name?: string | number
    value?: string | number
    color?: string
  }>
  label?: string | number
  className?: string
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-2 rounded-md border bg-background px-3 py-2 text-xs shadow-lg",
        className
      )}
    >
      {label ? (
        <div className="font-medium text-foreground">{String(label)}</div>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? index)
          const itemConfig = config[key]
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span>{itemConfig?.label ?? item.name ?? key}</span>
              </div>
              <span className="font-mono font-medium text-foreground">
                {typeof item.value === "number"
                  ? item.value.toLocaleString("pt-BR")
                  : String(item.value ?? "")}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
