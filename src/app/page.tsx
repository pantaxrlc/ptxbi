'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Calculator,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react'

// Tipos para o sistema
interface Company {
  id: string
  name: string
  email: string
  password: string
}

interface MonthlyData {
  month: string
  year: number
  receita: number
  custoVendas: number
  despesasOperacionais: number
  estoque: number
  contasReceber: number
  contasPagar: number
  ativo: number
  passivo: number
}

interface AccumulatedData {
  totalReceita: number
  totalCustos: number
  totalDespesas: number
  lucroAcumulado: number
  prejuizoAcumulado: number
  estoqueTotal: number
  patrimonioLiquido: number
}

export default function PantaxSystem() {
  // Estados principais
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados de login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  
  // Estados de cadastro
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Estados dos dados mensais
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [currentMonthData, setCurrentMonthData] = useState<MonthlyData>({
    month: `${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    year: new Date().getFullYear(),
    receita: 0,
    custoVendas: 0,
    despesasOperacionais: 0,
    estoque: 0,
    contasReceber: 0,
    contasPagar: 0,
    ativo: 0,
    passivo: 0
  })
  
  // Estados acumulados
  const [accumulatedData, setAccumulatedData] = useState<AccumulatedData>({
    totalReceita: 0,
    totalCustos: 0,
    totalDespesas: 0,
    lucroAcumulado: 0,
    prejuizoAcumulado: 0,
    estoqueTotal: 0,
    patrimonioLiquido: 0
  })

  // Empresas cadastradas (simulação - em produção seria banco de dados)
  const [companies] = useState<Company[]>([
    {
      id: '1',
      name: 'Empresa Demo',
      email: 'demo@empresa.com',
      password: '123456'
    }
  ])

  // Formatação de moeda brasileira
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Parse de valor monetário
  const parseCurrency = (value: string): number => {
    if (!value || value === '') return 0
    const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.')
    const numValue = parseFloat(cleanValue)
    return isNaN(numValue) ? 0 : numValue
  }

  // Função de login
  const handleLogin = async () => {
    setIsLoading(true)
    setLoginError('')
    
    try {
      const company = companies.find(c => c.email === loginEmail && c.password === loginPassword)
      if (company) {
        setCurrentCompany(company)
        setIsLoggedIn(true)
        await loadCompanyData(company.id)
      } else {
        setLoginError('Email ou senha incorretos')
      }
    } catch (error) {
      setLoginError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentCompany(null)
    setLoginEmail('')
    setLoginPassword('')
    setMonthlyData([])
    setCurrentMonthData({
      month: `${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      year: new Date().getFullYear(),
      receita: 0,
      custoVendas: 0,
      despesasOperacionais: 0,
      estoque: 0,
      contasReceber: 0,
      contasPagar: 0,
      ativo: 0,
      passivo: 0
    })
  }

  // Carregar dados da empresa
  const loadCompanyData = async (companyId: string) => {
    try {
      const savedData = localStorage.getItem(`pantax_${companyId}`)
      if (savedData) {
        const data = JSON.parse(savedData)
        setMonthlyData(data.monthlyData || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  // Salvar dados da empresa
  const saveCompanyData = () => {
    if (currentCompany) {
      try {
        const dataToSave = {
          monthlyData,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(`pantax_${currentCompany.id}`, JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Erro ao salvar dados:', error)
      }
    }
  }

  // Calcular dados acumulados
  const calculateAccumulated = () => {
    const accumulated = monthlyData.reduce((acc, data) => {
      const lucroMensal = (data.receita || 0) - (data.custoVendas || 0) - (data.despesasOperacionais || 0)
      
      return {
        totalReceita: acc.totalReceita + (data.receita || 0),
        totalCustos: acc.totalCustos + (data.custoVendas || 0),
        totalDespesas: acc.totalDespesas + (data.despesasOperacionais || 0),
        lucroAcumulado: lucroMensal > 0 ? acc.lucroAcumulado + lucroMensal : acc.lucroAcumulado,
        prejuizoAcumulado: lucroMensal < 0 ? acc.prejuizoAcumulado + Math.abs(lucroMensal) : acc.prejuizoAcumulado,
        estoqueTotal: acc.estoqueTotal + (data.estoque || 0),
        patrimonioLiquido: acc.patrimonioLiquido + ((data.ativo || 0) - (data.passivo || 0))
      }
    }, {
      totalReceita: 0,
      totalCustos: 0,
      totalDespesas: 0,
      lucroAcumulado: 0,
      prejuizoAcumulado: 0,
      estoqueTotal: 0,
      patrimonioLiquido: 0
    })
    
    setAccumulatedData(accumulated)
  }

  // Salvar dados do mês atual
  const saveCurrentMonth = () => {
    setIsLoading(true)
    try {
      const existingIndex = monthlyData.findIndex(
        data => data.month === currentMonthData.month && data.year === currentMonthData.year
      )
      
      let newMonthlyData
      if (existingIndex >= 0) {
        newMonthlyData = [...monthlyData]
        newMonthlyData[existingIndex] = { ...currentMonthData }
      } else {
        newMonthlyData = [...monthlyData, { ...currentMonthData }]
      }
      
      setMonthlyData(newMonthlyData)
    } catch (error) {
      console.error('Erro ao salvar período:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar campo com formatação de moeda
  const updateCurrencyField = (field: keyof MonthlyData, value: string) => {
    const numericValue = parseCurrency(value)
    setCurrentMonthData(prev => ({
      ...prev,
      [field]: numericValue
    }))
  }

  // Carregar dados do mês selecionado
  const loadSelectedMonth = () => {
    const monthKey = selectedMonth.toString().padStart(2, '0')
    const existingData = monthlyData.find(
      data => data.month === monthKey && data.year === selectedYear
    )
    
    if (existingData) {
      setCurrentMonthData({ ...existingData })
    } else {
      setCurrentMonthData({
        month: monthKey,
        year: selectedYear,
        receita: 0,
        custoVendas: 0,
        despesasOperacionais: 0,
        estoque: 0,
        contasReceber: 0,
        contasPagar: 0,
        ativo: 0,
        passivo: 0
      })
    }
  }

  // Effects
  useEffect(() => {
    calculateAccumulated()
    saveCompanyData()
  }, [monthlyData])

  useEffect(() => {
    loadSelectedMonth()
  }, [selectedMonth, selectedYear, monthlyData])

  // Tela de login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              PANTAX Sistema
            </CardTitle>
            <p className="text-gray-600">Gestão Financeira Empresarial</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!isRegistering ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email da Empresa</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="empresa@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading || !loginEmail || !loginPassword}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setIsRegistering(true)}
                    className="text-sm text-blue-600"
                    disabled={isLoading}
                  >
                    Cadastrar nova empresa
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium">Demo:</p>
                  <p className="text-xs text-blue-600">Email: demo@empresa.com</p>
                  <p className="text-xs text-blue-600">Senha: 123456</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Minha Empresa Ltda"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="contato@minhaempresa.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Senha</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({...prev, password: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({...prev, confirmPassword: e.target.value}))}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                    onClick={() => {
                      alert('Funcionalidade de cadastro será implementada')
                    }}
                  >
                    Cadastrar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela principal do sistema
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PANTAX</h1>
                <p className="text-sm text-gray-600">{currentCompany?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {currentCompany?.email}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Acumulados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Acumulada</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(accumulatedData.totalReceita)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Acumulado</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(accumulatedData.lucroAcumulado)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prejuízo Acumulado</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(accumulatedData.prejuizoAcumulado)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estoque Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(accumulatedData.estoqueTotal)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seletor de Mês/Ano */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Período de Apuração</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="month">Mês:</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="year">Ano:</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 5}, (_, i) => (
                    <option key={2024 + i} value={2024 + i}>
                      {2024 + i}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button
                onClick={saveCurrentMonth}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Período
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Dados Mensais */}
        <Tabs defaultValue="dre" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dre" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>DRE</span>
            </TabsTrigger>
            <TabsTrigger value="balanco" className="flex items-center space-x-2">
              <PieChart className="w-4 h-4" />
              <span>Balanço</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="flex items-center space-x-2">
              <Calculator className="w-4 h-4" />
              <span>Resumo</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dre">
            <Card>
              <CardHeader>
                <CardTitle>Demonstração do Resultado do Exercício</CardTitle>
                <p className="text-sm text-gray-600">
                  Período: {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receita">Receita Bruta</Label>
                    <Input
                      id="receita"
                      placeholder="R$ 0,00"
                      value={formatCurrency(currentMonthData.receita)}
                      onChange={(e) => updateCurrencyField('receita', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custoVendas">Custo das Vendas</Label>
                    <Input
                      id="custoVendas"
                      placeholder="R$ 0,00"
                      value={formatCurrency(currentMonthData.custoVendas)}
                      onChange={(e) => updateCurrencyField('custoVendas', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="despesasOperacionais">Despesas Operacionais</Label>
                    <Input
                      id="despesasOperacionais"
                      placeholder="R$ 0,00"
                      value={formatCurrency(currentMonthData.despesasOperacionais)}
                      onChange={(e) => updateCurrencyField('despesasOperacionais', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Lucro/Prejuízo do Período</Label>
                    <div className={`p-3 rounded-md font-bold text-lg ${
                      (currentMonthData.receita - currentMonthData.custoVendas - currentMonthData.despesasOperacionais) >= 0 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {formatCurrency(currentMonthData.receita - currentMonthData.custoVendas - currentMonthData.despesasOperacionais)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balanco">
            <Card>
              <CardHeader>
                <CardTitle>Balanço Patrimonial</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">ATIVO</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estoque">Estoque</Label>
                      <Input
                        id="estoque"
                        placeholder="R$ 0,00"
                        value={formatCurrency(currentMonthData.estoque)}
                        onChange={(e) => updateCurrencyField('estoque', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contasReceber">Contas a Receber</Label>
                      <Input
                        id="contasReceber"
                        placeholder="R$ 0,00"
                        value={formatCurrency(currentMonthData.contasReceber)}
                        onChange={(e) => updateCurrencyField('contasReceber', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ativo">Ativo Total</Label>
                      <Input
                        id="ativo"
                        placeholder="R$ 0,00"
                        value={formatCurrency(currentMonthData.ativo)}
                        onChange={(e) => updateCurrencyField('ativo', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">PASSIVO</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contasPagar">Contas a Pagar</Label>
                      <Input
                        id="contasPagar"
                        placeholder="R$ 0,00"
                        value={formatCurrency(currentMonthData.contasPagar)}
                        onChange={(e) => updateCurrencyField('contasPagar', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passivo">Passivo Total</Label>
                      <Input
                        id="passivo"
                        placeholder="R$ 0,00"
                        value={formatCurrency(currentMonthData.passivo)}
                        onChange={(e) => updateCurrencyField('passivo', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Patrimônio Líquido</Label>
                      <div className={`p-3 rounded-md font-bold text-lg ${
                        (currentMonthData.ativo - currentMonthData.passivo) >= 0 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {formatCurrency(currentMonthData.ativo - currentMonthData.passivo)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumo">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Acumulado</CardTitle>
                <p className="text-sm text-gray-600">Consolidação de todos os períodos</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Receitas</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(accumulatedData.totalReceita)}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Custos</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(accumulatedData.totalCustos)}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Despesas</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(accumulatedData.totalDespesas)}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Lucro Acumulado</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(accumulatedData.lucroAcumulado)}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Prejuízo Acumulado</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(accumulatedData.prejuizoAcumulado)}
                    </p>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 mb-2">Patrimônio Líquido</h4>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(accumulatedData.patrimonioLiquido)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Períodos</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum período salvo ainda</p>
                    <p className="text-sm">Preencha os dados e salve um período para ver o histórico</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 p-3 text-left">Período</th>
                          <th className="border border-gray-200 p-3 text-right">Receita</th>
                          <th className="border border-gray-200 p-3 text-right">Custos</th>
                          <th className="border border-gray-200 p-3 text-right">Despesas</th>
                          <th className="border border-gray-200 p-3 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((data, index) => {
                          const resultado = (data.receita || 0) - (data.custoVendas || 0) - (data.despesasOperacionais || 0)
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-200 p-3">
                                {new Date(data.year, parseInt(data.month) - 1).toLocaleDateString('pt-BR', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td className="border border-gray-200 p-3 text-right">
                                {formatCurrency(data.receita || 0)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right">
                                {formatCurrency(data.custoVendas || 0)}
                              </td>
                              <td className="border border-gray-200 p-3 text-right">
                                {formatCurrency(data.despesasOperacionais || 0)}
                              </td>
                              <td className={`border border-gray-200 p-3 text-right font-bold ${
                                resultado >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(resultado)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}