"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

type EmpresaRow = {
  razaoSocial: string
  cnpj: string
  regime: string
  cidade: string
  uf: string
}

type CountDatum = {
  name: string
  total: number
}

type CompletenessDatum = {
  coluna: string
  preenchidos: number
  vazios: number
}

type DashboardProps = {
  rows: EmpresaRow[]
}

const barConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const completenessConfig = {
  preenchidos: {
    label: "Preenchidos",
    color: "var(--chart-2)",
  },
  vazios: {
    label: "Vazios",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

type MenuKey =
  | "dashboard"
  | "uf"
  | "cidade"
  | "regime"
  | "documento"
  | "completude"

const menuItems: Array<{ key: MenuKey; label: string; short: string }> = [
  { key: "dashboard", label: "Dashboard", short: "DB" },
  { key: "uf", label: "UF", short: "UF" },
  { key: "cidade", label: "Cidade", short: "CI" },
  { key: "regime", label: "Regime", short: "RE" },
  { key: "documento", label: "Documento", short: "DO" },
  { key: "completude", label: "Completude", short: "CO" },
]

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
      >
        <option value="TODOS">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function RegimeCards({
  data,
  total,
}: {
  data: CountDatum[]
  total: number
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {data.map((item) => {
        const percentual = total > 0 ? (item.total / total) * 100 : 0
        return (
          <article key={item.name} className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Regime</p>
            <p className="text-sm font-medium break-words">{item.name}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-semibold">{item.total.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground">{percentual.toFixed(1)}%</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function CidadeCards({
  data,
  total,
}: {
  data: CountDatum[]
  total: number
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {data.map((item) => {
        const percentual = total > 0 ? (item.total / total) * 100 : 0
        return (
          <article key={item.name} className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Cidade</p>
            <p className="text-sm font-medium break-words">{item.name}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-semibold">{item.total.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground">{percentual.toFixed(1)}%</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SidebarMenuContent({
  activeView,
  setActiveView,
}: {
  activeView: MenuKey
  setActiveView: (value: MenuKey) => void
}) {
  const { open } = useSidebar()

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.key}>
          <SidebarMenuButton
            isActive={activeView === item.key}
            onClick={() => setActiveView(item.key)}
          >
            <span className="w-7 text-center font-medium">{item.short}</span>
            {open ? <span>{item.label}</span> : null}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function EmpresasDashboard({
  rows,
}: DashboardProps) {
  const [activeView, setActiveView] = useState<MenuKey>("dashboard")
  const [ufRegimeFilter, setUfRegimeFilter] = useState("TODOS")
  const [ufDocumentoFilter, setUfDocumentoFilter] = useState("TODOS")
  const [cidadeUfFilter, setCidadeUfFilter] = useState("TODOS")
  const [cidadeRegimeFilter, setCidadeRegimeFilter] = useState("TODOS")
  const [regimeUfFilter, setRegimeUfFilter] = useState("TODOS")
  const [regimeCidadeFilter, setRegimeCidadeFilter] = useState("TODOS")
  const [documentoUfFilter, setDocumentoUfFilter] = useState("TODOS")
  const [documentoRegimeFilter, setDocumentoRegimeFilter] = useState("TODOS")
  const [completudeUfFilter, setCompletudeUfFilter] = useState("TODOS")
  const [completudeCidadeFilter, setCompletudeCidadeFilter] = useState("TODOS")
  const [completudeRegimeFilter, setCompletudeRegimeFilter] = useState("TODOS")

  const normalizeText = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")

  const formatLabel = (value: string) => normalizeText(value) || "VAZIO"

  const getDocumentoTipo = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, "")
    if (digits.length === 14) return "CNPJ (14)"
    if (digits.length === 11) return "CPF (11)"
    return "Outros"
  }

  const topCounts = (values: string[], limit?: number) => {
    const map = new Map<string, number>()
    values.forEach((value) => {
      const label = formatLabel(value)
      map.set(label, (map.get(label) ?? 0) + 1)
    })

    const sorted = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }))

    if (limit === undefined) {
      return sorted
    }

    return sorted.slice(0, limit)
  }

  const filterOptions = useMemo(() => {
    const ufs = [...new Set(rows.map((row) => formatLabel(row.uf)))].sort()
    const cidades = [...new Set(rows.map((row) => formatLabel(row.cidade)))].sort()
    const regimes = [...new Set(rows.map((row) => formatLabel(row.regime)))].sort()
    return { ufs, cidades, regimes }
  }, [rows])

  const applyFilters = (sourceRows: EmpresaRow[], filters: {
    uf?: string
    cidade?: string
    regime?: string
    documento?: string
  }) => {
    return sourceRows.filter((row) => {
      const uf = formatLabel(row.uf)
      const cidade = formatLabel(row.cidade)
      const regime = formatLabel(row.regime)
      const documento = getDocumentoTipo(row.cnpj)

      const ufOk = !filters.uf || filters.uf === "TODOS" || uf === filters.uf
      const cidadeOk =
        !filters.cidade || filters.cidade === "TODOS" || cidade === filters.cidade
      const regimeOk =
        !filters.regime || filters.regime === "TODOS" || regime === filters.regime
      const documentoOk =
        !filters.documento ||
        filters.documento === "TODOS" ||
        documento === filters.documento

      return ufOk && cidadeOk && regimeOk && documentoOk
    })
  }

  const totalEmpresas = rows.length
  const totalCidades = new Set(rows.map((row) => formatLabel(row.cidade))).size
  const totalRegimes = new Set(rows.map((row) => formatLabel(row.regime))).size

  const ufChartRows = useMemo(
    () =>
      applyFilters(rows, {
        regime: ufRegimeFilter,
        documento: ufDocumentoFilter,
      }),
    [rows, ufRegimeFilter, ufDocumentoFilter]
  )
  const cidadeChartRows = useMemo(
    () =>
      applyFilters(rows, {
        uf: cidadeUfFilter,
        regime: cidadeRegimeFilter,
      }),
    [rows, cidadeUfFilter, cidadeRegimeFilter]
  )
  const regimeChartRows = useMemo(
    () =>
      applyFilters(rows, {
        uf: regimeUfFilter,
        cidade: regimeCidadeFilter,
      }),
    [rows, regimeUfFilter, regimeCidadeFilter]
  )
  const documentoChartRows = useMemo(
    () =>
      applyFilters(rows, {
        uf: documentoUfFilter,
        regime: documentoRegimeFilter,
      }),
    [rows, documentoUfFilter, documentoRegimeFilter]
  )
  const completudeRows = useMemo(
    () =>
      applyFilters(rows, {
        uf: completudeUfFilter,
        cidade: completudeCidadeFilter,
        regime: completudeRegimeFilter,
      }),
    [rows, completudeUfFilter, completudeCidadeFilter, completudeRegimeFilter]
  )

  const dashboardUfData = topCounts(rows.map((row) => row.uf), 12)
  const dashboardCidadeData = topCounts(rows.map((row) => row.cidade), 12)
  const dashboardRegimeData = topCounts(rows.map((row) => row.regime), 12)
  const dashboardDocumentoData = topCounts(rows.map((row) => getDocumentoTipo(row.cnpj)), 12)

  const ufData = topCounts(ufChartRows.map((row) => row.uf))
  const cidadeData = topCounts(cidadeChartRows.map((row) => row.cidade))
  const regimeData = topCounts(regimeChartRows.map((row) => row.regime))
  const documentoData = topCounts(
    documentoChartRows.map((row) => getDocumentoTipo(row.cnpj))
  )

  const completenessData = [
    {
      coluna: "Razão social",
      preenchidos: completudeRows.filter((row) => row.razaoSocial).length,
      vazios: completudeRows.filter((row) => !row.razaoSocial).length,
    },
    {
      coluna: "CNPJ",
      preenchidos: completudeRows.filter((row) => row.cnpj).length,
      vazios: completudeRows.filter((row) => !row.cnpj).length,
    },
    {
      coluna: "Regime",
      preenchidos: completudeRows.filter((row) => row.regime).length,
      vazios: completudeRows.filter((row) => !row.regime).length,
    },
    {
      coluna: "Cidade",
      preenchidos: completudeRows.filter((row) => row.cidade).length,
      vazios: completudeRows.filter((row) => !row.cidade).length,
    },
    {
      coluna: "UF",
      preenchidos: completudeRows.filter((row) => row.uf).length,
      vazios: completudeRows.filter((row) => !row.uf).length,
    },
  ]

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup className="pt-2">
            <SidebarGroupLabel>Navegação</SidebarGroupLabel>
            <SidebarMenuContent
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-muted/20 p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
          <section className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
            <div className="rounded-lg border bg-gradient-to-r from-primary/10 via-cyan-500/10 to-transparent p-3 md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold md:text-xl">Dashboard Contábil</h1>
                  <p className="text-sm text-muted-foreground">
                    Visão por categoria com filtros independentes
                  </p>
                </div>
                <SidebarTrigger className="shrink-0" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Rota ativa</p>
                <p className="text-sm font-medium">
                  {menuItems.find((item) => item.key === activeView)?.label}
                </p>
              </div>
            </div>
          </section>

          {activeView === "dashboard" ? (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Empresas filtradas</p>
                <p className="text-3xl font-semibold">{totalEmpresas.toLocaleString("pt-BR")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Cidades únicas</p>
                <p className="text-3xl font-semibold">{totalCidades.toLocaleString("pt-BR")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">Regimes únicos</p>
                <p className="text-3xl font-semibold">{totalRegimes.toLocaleString("pt-BR")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">UFs únicas</p>
                <p className="text-3xl font-semibold">
                  {new Set(rows.map((row) => formatLabel(row.uf))).size.toLocaleString(
                    "pt-BR"
                  )}
                </p>
                </div>
              </section>
              <section className="grid gap-4 xl:grid-cols-12">
                <article className="rounded-xl border bg-card p-4 shadow-sm xl:col-span-6">
                  <h2 className="mb-3 text-sm font-medium">UF (top 12)</h2>
                  <ChartContainer config={barConfig} className="h-[320px]">
                    <BarChart data={dashboardUfData} layout="vertical" accessibilityLayer margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={60} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </article>
                <article className="rounded-xl border bg-card p-4 shadow-sm xl:col-span-6">
                  <h2 className="mb-3 text-sm font-medium">Cidade (top 12)</h2>
                  <ChartContainer config={barConfig} className="h-[320px]">
                    <BarChart data={dashboardCidadeData} layout="vertical" accessibilityLayer margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </article>
                <article className="rounded-xl border bg-card p-4 shadow-sm xl:col-span-6">
                  <h2 className="mb-3 text-sm font-medium">Regime (top 12)</h2>
                  <ChartContainer config={barConfig} className="h-[320px]">
                    <BarChart data={dashboardRegimeData} layout="vertical" accessibilityLayer margin={{ left: 16, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={220} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </article>
                <article className="rounded-xl border bg-card p-4 shadow-sm xl:col-span-6">
                  <h2 className="mb-3 text-sm font-medium">Documento (top 12)</h2>
                  <ChartContainer config={barConfig} className="h-[320px]">
                    <BarChart data={dashboardDocumentoData} accessibilityLayer margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </article>
              </section>
            </>
          ) : null}

          {activeView === "uf" ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <SelectField
                  label="Regime"
                  value={ufRegimeFilter}
                  onChange={setUfRegimeFilter}
                  options={filterOptions.regimes}
                />
                <SelectField
                  label="Documento"
                  value={ufDocumentoFilter}
                  onChange={setUfDocumentoFilter}
                  options={["CNPJ (14)", "CPF (11)", "Outros"]}
                />
              </div>
              <h2 className="mb-3 text-sm font-medium">UF</h2>
              <ChartContainer
                config={barConfig}
                className="min-h-[360px]"
                style={{ height: Math.max(360, ufData.length * 32) }}
              >
                <BarChart data={ufData} layout="vertical" accessibilityLayer margin={{ left: 20, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={60} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                </BarChart>
              </ChartContainer>
            </section>
          ) : null}

          {activeView === "cidade" ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <SelectField
                  label="UF"
                  value={cidadeUfFilter}
                  onChange={setCidadeUfFilter}
                  options={filterOptions.ufs}
                />
                <SelectField
                  label="Regime"
                  value={cidadeRegimeFilter}
                  onChange={setCidadeRegimeFilter}
                  options={filterOptions.regimes}
                />
              </div>
              <h2 className="mb-3 text-sm font-medium">Cidade</h2>
              <CidadeCards data={cidadeData} total={cidadeChartRows.length} />
            </section>
          ) : null}

          {activeView === "regime" ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <SelectField
                  label="UF"
                  value={regimeUfFilter}
                  onChange={setRegimeUfFilter}
                  options={filterOptions.ufs}
                />
                <SelectField
                  label="Cidade"
                  value={regimeCidadeFilter}
                  onChange={setRegimeCidadeFilter}
                  options={filterOptions.cidades}
                />
              </div>
              <h2 className="mb-3 text-sm font-medium">Regime</h2>
              <RegimeCards data={regimeData} total={regimeChartRows.length} />
            </section>
          ) : null}

          {activeView === "documento" ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <SelectField
                  label="UF"
                  value={documentoUfFilter}
                  onChange={setDocumentoUfFilter}
                  options={filterOptions.ufs}
                />
                <SelectField
                  label="Regime"
                  value={documentoRegimeFilter}
                  onChange={setDocumentoRegimeFilter}
                  options={filterOptions.regimes}
                />
              </div>
              <h2 className="mb-3 text-sm font-medium">Documento</h2>
              <ChartContainer config={barConfig} className="min-h-[360px]">
                <BarChart data={documentoData} accessibilityLayer margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                </BarChart>
              </ChartContainer>
            </section>
          ) : null}

          {activeView === "completude" ? (
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 grid gap-3 md:grid-cols-3">
                <SelectField
                  label="UF"
                  value={completudeUfFilter}
                  onChange={setCompletudeUfFilter}
                  options={filterOptions.ufs}
                />
                <SelectField
                  label="Cidade"
                  value={completudeCidadeFilter}
                  onChange={setCompletudeCidadeFilter}
                  options={filterOptions.cidades}
                />
                <SelectField
                  label="Regime"
                  value={completudeRegimeFilter}
                  onChange={setCompletudeRegimeFilter}
                  options={filterOptions.regimes}
                />
              </div>
              <h2 className="mb-3 text-sm font-medium">Completude por coluna</h2>
              <ChartContainer config={completenessConfig} className="min-h-[360px]">
                <BarChart data={completenessData} accessibilityLayer margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="coluna" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="preenchidos" fill="var(--color-preenchidos)" radius={4} />
                  <Bar dataKey="vazios" fill="var(--color-vazios)" radius={4} />
                </BarChart>
              </ChartContainer>
            </section>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
