import { readFile } from "node:fs/promises"
import path from "node:path"

import { EmpresasDashboard } from "@/components/dashboard/empresas-dashboard"

export type EmpresaRow = {
  razaoSocial: string
  cnpj: string
  regime: string
  cidade: string
  uf: string
}

const csvFilePath = path.join(
  process.cwd(),
  "data",
  "S3D_empresas_20260408082954_175388.csv"
)

function parseCsvLine(line: string) {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (char === ";" && !inQuotes) {
      result.push(current)
      current = ""
      continue
    }
    current += char
  }

  result.push(current)
  return result
}

async function loadEmpresas() {
  const csvRaw = await readFile(csvFilePath, "utf-8")
  const lines = csvRaw.split(/\r?\n/).filter((line) => line.trim())
  const dataLines = lines.slice(1)

  const rows: EmpresaRow[] = dataLines.map((line) => {
    const [razaoSocial = "", cnpj = "", regime = "", cidade = "", uf = ""] =
      parseCsvLine(line)
    return {
      razaoSocial: razaoSocial.trim(),
      cnpj: cnpj.trim(),
      regime: regime.trim(),
      cidade: cidade.trim(),
      uf: uf.trim(),
    }
  })

  return rows
}

export default async function Home() {
  const rows = await loadEmpresas()

  return <EmpresasDashboard rows={rows} />
}
