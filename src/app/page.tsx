"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Receipt, 
  ShoppingCart,
  PiggyBank,
  FileText,
  Calendar,
  Filter,
  Download,
  Package,
  Truck,
  Upload,
  FileSpreadsheet,
  Database,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import * as XLSX from 'xlsx'

// Tipos para os dados
interface Transacao {
  id: number
  tipo: 'recebimento' | 'despesa' | 'compra' | 'imposto'
  descricao: string
  valor: number
  data: string
  categoria: string
}

interface DadosFinanceiros {
  faturamento: number
  despesas: number
  saldoBanco: number
  impostos: number
  estoque: number
  fornecedores: number
}

// Dados mock iniciais
const mockDataInicial = {
  resumo: {
    faturamento: { valor: 125000, variacao: 12.5 },
    despesas: { valor: 25000, variacao: -8.2 },
    saldoBanco: { valor: 80000, variacao: 15.3 },
    impostos: { valor: 18750, variacao: 5.1 },
    estoque: { valor: 50000, variacao: 10.5 },
    fornecedores: { valor: 25000, variacao: -5.2 }
  },
  dre: {
    faturamento: 125000,
    impostos: 18750,
    cmv: 60000,
    despesas: 25000,
    lucroLiquido: 21250
  },
  transacoes: [
    { id: 1, tipo: 'recebimento' as const, descricao: 'Venda de Produtos', valor: 15000, data: '2024-01-15', categoria: 'Vendas' },
    { id: 2, tipo: 'despesa' as const, descricao: 'Aluguel Escritório', valor: -3500, data: '2024-01-14', categoria: 'Operacional' },
    { id: 3, tipo: 'compra' as const, descricao: 'Equipamentos TI', valor: -8000, data: '2024-01-13', categoria: 'Investimento' },
    { id: 4, tipo: 'recebimento' as const, descricao: 'Prestação de Serviços', valor: 22000, data: '2024-01-12', categoria: 'Serviços' },
    { id: 5, tipo: 'despesa' as const, descricao: 'Marketing Digital', valor: -2800, data: '2024-01-11', categoria: 'Marketing' },
    { id: 6, tipo: 'imposto' as const, descricao: 'ISS Municipal', valor: -1200, data: '2024-01-10', categoria: 'Impostos' }
  ]
}

export default function Dashboard() {
  const [dados, setDados] = useState(mockDataInicial)
  const [filtroAtivo, setFiltroAtivo] = useState('todos')
  const [uploadStatus, setUploadStatus] = useState<{tipo: 'success' | 'error' | null, mensagem: string}>({tipo: null, mensagem: ''})
  const [isUploading, setIsUploading] = useState(false)
  
  const excelInputRef = useRef<HTMLInputElement>(null)
  const ofxInputRef = useRef<HTMLInputElement>(null)

  const transacoesFiltradas = dados.transacoes.filter(transacao => {
    if (filtroAtivo === 'todos') return true
    return transacao.tipo === filtroAtivo
  })

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(valor))
  }

  const obterIconeTransacao = (tipo: string) => {
    switch (tipo) {
      case 'recebimento': return <TrendingUp className="w-4 h-4 text-emerald-600" />
      case 'despesa': return <TrendingDown className="w-4 h-4 text-red-600" />
      case 'compra': return <ShoppingCart className="w-4 h-4 text-blue-600" />
      case 'imposto': return <FileText className="w-4 h-4 text-orange-600" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const obterCorTipo = (tipo: string) => {
    switch (tipo) {
      case 'recebimento': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'despesa': return 'bg-red-100 text-red-800 border-red-200'
      case 'compra': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'imposto': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Função para processar arquivo Excel
  const processarExcel = async (file: File) => {
    setIsUploading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Processar dados do Excel
      const novasTransacoes: Transacao[] = []
      let novosDados: Partial<DadosFinanceiros> = {}

      jsonData.forEach((row: any, index) => {
        // Verificar se é uma linha de dados financeiros resumidos
        if (row.Categoria && row.Valor) {
          const categoria = String(row.Categoria).toLowerCase()
          const valor = parseFloat(String(row.Valor).replace(/[^\d.-]/g, '')) || 0

          if (categoria.includes('faturamento') || categoria.includes('receita')) {
            novosDados.faturamento = valor
          } else if (categoria.includes('despesa')) {
            novosDados.despesas = valor
          } else if (categoria.includes('banco') || categoria.includes('saldo')) {
            novosDados.saldoBanco = valor
          } else if (categoria.includes('imposto')) {
            novosDados.impostos = valor
          } else if (categoria.includes('estoque')) {
            novosDados.estoque = valor
          } else if (categoria.includes('fornecedor')) {
            novosDados.fornecedores = valor
          }
        }

        // Verificar se é uma transação detalhada
        if (row.Descricao && row.Valor && row.Data) {
          const valor = parseFloat(String(row.Valor).replace(/[^\d.-]/g, '')) || 0
          let tipo: 'recebimento' | 'despesa' | 'compra' | 'imposto' = 'despesa'
          
          if (valor > 0) {
            tipo = 'recebimento'
          } else if (String(row.Tipo || row.Categoria || '').toLowerCase().includes('compra')) {
            tipo = 'compra'
          } else if (String(row.Tipo || row.Categoria || '').toLowerCase().includes('imposto')) {
            tipo = 'imposto'
          }

          novasTransacoes.push({
            id: dados.transacoes.length + index + 1,
            tipo,
            descricao: String(row.Descricao),
            valor,
            data: new Date(row.Data).toISOString().split('T')[0],
            categoria: String(row.Categoria || 'Geral')
          })
        }
      })

      // Atualizar estado com novos dados
      setDados(prev => ({
        ...prev,
        resumo: {
          faturamento: { valor: novosDados.faturamento || prev.resumo.faturamento.valor, variacao: 0 },
          despesas: { valor: novosDados.despesas || prev.resumo.despesas.valor, variacao: 0 },
          saldoBanco: { valor: novosDados.saldoBanco || prev.resumo.saldoBanco.valor, variacao: 0 },
          impostos: { valor: novosDados.impostos || prev.resumo.impostos.valor, variacao: 0 },
          estoque: { valor: novosDados.estoque || prev.resumo.estoque.valor, variacao: 0 },
          fornecedores: { valor: novosDados.fornecedores || prev.resumo.fornecedores.valor, variacao: 0 }
        },
        transacoes: [...prev.transacoes, ...novasTransacoes],
        dre: {
          faturamento: novosDados.faturamento || prev.dre.faturamento,
          impostos: novosDados.impostos || prev.dre.impostos,
          cmv: prev.dre.cmv,
          despesas: novosDados.despesas || prev.dre.despesas,
          lucroLiquido: (novosDados.faturamento || prev.dre.faturamento) - 
                       (novosDados.impostos || prev.dre.impostos) - 
                       prev.dre.cmv - 
                       (novosDados.despesas || prev.dre.despesas)
        }
      }))

      setUploadStatus({
        tipo: 'success',
        mensagem: `Excel processado com sucesso! ${novasTransacoes.length} transações adicionadas.`
      })

    } catch (error) {
      setUploadStatus({
        tipo: 'error',
        mensagem: 'Erro ao processar arquivo Excel. Verifique o formato dos dados.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Função para processar arquivo OFX
  const processarOFX = async (file: File) => {
    setIsUploading(true)
    try {
      const text = await file.text()
      
      // Parser simples para OFX (formato básico)
      const transacoes: Transacao[] = []
      let saldoAtual = 0
      
      // Extrair saldo
      const saldoMatch = text.match(/<BALAMT>([-\d.]+)/i)
      if (saldoMatch) {
        saldoAtual = parseFloat(saldoMatch[1])
      }

      // Extrair transações
      const transacaoRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gis
      const matches = text.match(transacaoRegex)

      if (matches) {
        matches.forEach((match, index) => {
          const valorMatch = match.match(/<TRNAMT>([-\d.]+)/i)
          const dataMatch = match.match(/<DTPOSTED>(\d{8})/i)
          const descMatch = match.match(/<MEMO>(.*?)</i) || match.match(/<NAME>(.*?)</i)
          
          if (valorMatch && dataMatch && descMatch) {
            const valor = parseFloat(valorMatch[1])
            const data = dataMatch[1]
            const dataFormatada = `${data.substring(0,4)}-${data.substring(4,6)}-${data.substring(6,8)}`
            
            transacoes.push({
              id: dados.transacoes.length + index + 1,
              tipo: valor > 0 ? 'recebimento' : 'despesa',
              descricao: descMatch[1].trim(),
              valor,
              data: dataFormatada,
              categoria: 'Bancária'
            })
          }
        })
      }

      // Atualizar dados
      setDados(prev => ({
        ...prev,
        resumo: {
          ...prev.resumo,
          saldoBanco: { valor: saldoAtual, variacao: 0 }
        },
        transacoes: [...prev.transacoes, ...transacoes]
      }))

      setUploadStatus({
        tipo: 'success',
        mensagem: `OFX processado com sucesso! ${transacoes.length} transações bancárias adicionadas. Saldo atualizado: ${formatarMoeda(saldoAtual)}`
      })

    } catch (error) {
      setUploadStatus({
        tipo: 'error',
        mensagem: 'Erro ao processar arquivo OFX. Verifique se o arquivo está no formato correto.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processarExcel(file)
    }
  }

  const handleOFXUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processarOFX(file)
    }
  }

  const fecharAlert = () => {
    setUploadStatus({tipo: null, mensagem: ''})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Financeiro
            </h1>
            <p className="text-gray-600 mt-1">Visão completa das suas finanças com importação automática</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Este Mês
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Alert de Status */}
        {uploadStatus.tipo && (
          <Alert className={`${uploadStatus.tipo === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {uploadStatus.tipo === 'success' ? 
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> : 
                  <AlertCircle className="w-4 h-4 text-red-600" />
                }
                <AlertDescription className={uploadStatus.tipo === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                  {uploadStatus.mensagem}
                </AlertDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={fecharAlert}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Sistema de Upload */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importação de Dados
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Importe seus dados financeiros via Excel ou extratos bancários OFX
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="excel" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="excel" className="gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx)
                </TabsTrigger>
                <TabsTrigger value="ofx" className="gap-2">
                  <Database className="w-4 h-4" />
                  Extrato OFX
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="excel" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload de Planilha Excel
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Formato esperado: Colunas "Categoria", "Valor", "Descricao", "Data", "Tipo"
                  </p>
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => excelInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Processando...' : 'Selecionar Arquivo Excel'}
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Formato da Planilha Excel:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Categoria:</strong> Faturamento, Despesas, Saldo Banco, Impostos, Estoque, Fornecedores</p>
                    <p><strong>Valor:</strong> Valores numéricos (positivos para receitas, negativos para gastos)</p>
                    <p><strong>Descrição:</strong> Descrição da transação</p>
                    <p><strong>Data:</strong> Data no formato DD/MM/AAAA</p>
                    <p><strong>Tipo:</strong> Recebimento, Despesa, Compra, Imposto</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ofx" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Upload de Extrato OFX
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Arquivo de extrato bancário no formato OFX padrão dos bancos
                  </p>
                  <input
                    ref={ofxInputRef}
                    type="file"
                    accept=".ofx"
                    onChange={handleOFXUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => ofxInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                    variant="secondary"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Processando...' : 'Selecionar Arquivo OFX'}
                  </Button>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Como obter arquivo OFX:</h4>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>1. Acesse o internet banking do seu banco</p>
                    <p>2. Vá em "Extratos" ou "Movimentação"</p>
                    <p>3. Selecione o período desejado</p>
                    <p>4. Escolha "Exportar" ou "Download" no formato OFX</p>
                    <p>5. Faça o upload do arquivo aqui</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
          
          {/* Faturamento */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.faturamento.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  +{dados.resumo.faturamento.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Despesas */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.despesas.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  {dados.resumo.despesas.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Banco */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Saldo Banco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.saldoBanco.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  +{dados.resumo.saldoBanco.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Impostos */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Impostos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.impostos.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  +{dados.resumo.impostos.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Estoque */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.estoque.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  +{dados.resumo.estoque.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Devedor Fornecedores */}
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Fornecedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">
                {formatarMoeda(dados.resumo.fornecedores.valor)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                <span className="text-xs opacity-90">
                  {dados.resumo.fornecedores.variacao}% vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DRE Contábil */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              DRE - Demonstrativo de Resultado do Exercício
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">Faturamento</span>
                <span className="font-bold text-emerald-600">{formatarMoeda(dados.dre.faturamento)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">(-) Impostos</span>
                <span className="font-bold text-red-600">-{formatarMoeda(dados.dre.impostos)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">(-) CMV (Custo Mercadorias Vendidas)</span>
                <span className="font-bold text-red-600">-{formatarMoeda(dados.dre.cmv)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium text-gray-700">(-) Despesas</span>
                <span className="font-bold text-red-600">-{formatarMoeda(dados.dre.despesas)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                <span className="font-bold text-gray-800">Lucro Líquido</span>
                <span className={`font-bold text-xl ${dados.dre.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {dados.dre.lucroLiquido >= 0 ? '+' : ''}{formatarMoeda(dados.dre.lucroLiquido)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parte Financeira */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Posição Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatarMoeda(dados.resumo.saldoBanco.valor)}
                </div>
                <div className="text-sm text-gray-600">Saldo Banco</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600">
                    +{dados.resumo.saldoBanco.variacao}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatarMoeda(dados.resumo.estoque.valor)}
                </div>
                <div className="text-sm text-gray-600">Estoque</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600">
                    +{dados.resumo.estoque.variacao}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {formatarMoeda(dados.resumo.fornecedores.valor)}
                </div>
                <div className="text-sm text-gray-600">Fornecedores a Pagar</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600">
                    {dados.resumo.fornecedores.variacao}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-bold text-gray-800">
                Transações Recentes ({dados.transacoes.length} total)
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroAtivo === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroAtivo('todos')}
                  className="gap-2"
                >
                  <Filter className="w-3 h-3" />
                  Todos
                </Button>
                <Button
                  variant={filtroAtivo === 'recebimento' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroAtivo('recebimento')}
                  className="gap-2"
                >
                  <Receipt className="w-3 h-3" />
                  Recebimentos
                </Button>
                <Button
                  variant={filtroAtivo === 'despesa' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroAtivo('despesa')}
                  className="gap-2"
                >
                  <CreditCard className="w-3 h-3" />
                  Despesas
                </Button>
                <Button
                  variant={filtroAtivo === 'compra' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroAtivo('compra')}
                  className="gap-2"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Compras
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transacoesFiltradas.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    {obterIconeTransacao(transacao.tipo)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {transacao.descricao}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{transacao.data}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${obterCorTipo(transacao.tipo)}`}
                        >
                          {transacao.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transacao.valor >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transacao.valor >= 0 ? '+' : ''}{formatarMoeda(transacao.valor)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${obterCorTipo(transacao.tipo)}`}
                    >
                      {transacao.tipo}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Fluxo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                +{formatarMoeda(dados.resumo.faturamento.valor - dados.resumo.despesas.valor)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Entrada - Saída</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Total Recebimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatarMoeda(
                  dados.transacoes
                    .filter(t => t.tipo === 'recebimento')
                    .reduce((acc, t) => acc + t.valor, 0)
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Este período</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Total Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatarMoeda(
                  Math.abs(dados.transacoes
                    .filter(t => t.tipo === 'compra')
                    .reduce((acc, t) => acc + t.valor, 0))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Este período</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}