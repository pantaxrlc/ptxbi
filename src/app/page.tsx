"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  Users, 
  Building, 
  ShoppingCart,
  Calculator,
  PieChart,
  BarChart3
} from 'lucide-react';

interface FinancialData {
  faturamentoBruto: number;
  impostos: number;
  despesasVendas: number;
  despesasAdm: number;
  despesasPessoal: number;
}

export default function DashboardFinanceiro() {
  const [dados, setDados] = useState<FinancialData>({
    faturamentoBruto: 100000,
    impostos: 15000,
    despesasVendas: 12000,
    despesasAdm: 8000,
    despesasPessoal: 25000,
  });

  // Cálculos automáticos
  const receitaLiquida = dados.faturamentoBruto - dados.impostos;
  const totalDespesas = dados.despesasVendas + dados.despesasAdm + dados.despesasPessoal;
  const lucroContabil = receitaLiquida - totalDespesas;

  // Percentuais
  const percentualImpostos = (dados.impostos / dados.faturamentoBruto) * 100;
  const percentualDespesasVendas = (dados.despesasVendas / receitaLiquida) * 100;
  const percentualDespesasAdm = (dados.despesasAdm / receitaLiquida) * 100;
  const percentualDespesasPessoal = (dados.despesasPessoal / receitaLiquida) * 100;
  const percentualLucro = (lucroContabil / receitaLiquida) * 100;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(1)}%`;
  };

  const handleInputChange = (campo: keyof FinancialData, valor: string) => {
    const numeroValor = parseFloat(valor) || 0;
    setDados(prev => ({
      ...prev,
      [campo]: numeroValor
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Análise completa de indicadores financeiros com receita líquida, impostos, despesas e lucro contábil
          </p>
        </div>

        {/* Formulário de Entrada */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="w-6 h-6 text-blue-600" />
              Dados Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="faturamento" className="text-sm font-medium">Faturamento Bruto</Label>
                <Input
                  id="faturamento"
                  type="number"
                  value={dados.faturamentoBruto}
                  onChange={(e) => handleInputChange('faturamentoBruto', e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="impostos" className="text-sm font-medium">Impostos</Label>
                <Input
                  id="impostos"
                  type="number"
                  value={dados.impostos}
                  onChange={(e) => handleInputChange('impostos', e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendas" className="text-sm font-medium">Despesas de Vendas</Label>
                <Input
                  id="vendas"
                  type="number"
                  value={dados.despesasVendas}
                  onChange={(e) => handleInputChange('despesasVendas', e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adm" className="text-sm font-medium">Despesas Administrativas</Label>
                <Input
                  id="adm"
                  type="number"
                  value={dados.despesasAdm}
                  onChange={(e) => handleInputChange('despesasAdm', e.target.value)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoal" className="text-sm font-medium">Despesas com Pessoal</Label>
                <Input
                  id="pessoal"
                  type="number"
                  value={dados.despesasPessoal}
                  onChange={(e) => handleInputChange('despesasPessoal', e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Receita Líquida */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0 transform hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Receita Líquida</span>
                <DollarSign className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{formatarMoeda(receitaLiquida)}</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Após impostos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Impostos */}
          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl border-0 transform hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Impostos</span>
                <Receipt className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{formatarMoeda(dados.impostos)}</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {formatarPercentual(percentualImpostos)} do faturamento
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Total de Despesas */}
          <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl border-0 transform hover:scale-105 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Total Despesas</span>
                <BarChart3 className="w-6 h-6" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{formatarMoeda(totalDespesas)}</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Operacionais
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lucro Contábil */}
          <Card className={`bg-gradient-to-br ${lucroContabil >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-rose-600'} text-white shadow-xl border-0 transform hover:scale-105 transition-all duration-300`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Lucro Contábil</span>
                {lucroContabil >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{formatarMoeda(lucroContabil)}</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {formatarPercentual(percentualLucro)} da receita líquida
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento das Despesas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Despesas de Vendas */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-purple-600">
                <ShoppingCart className="w-5 h-5" />
                Despesas de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-slate-800">{formatarMoeda(dados.despesasVendas)}</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                    {formatarPercentual(percentualDespesasVendas)}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentualDespesasVendas, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600">Comissões, marketing, promoções</p>
              </div>
            </CardContent>
          </Card>

          {/* Despesas Administrativas */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
                <Building className="w-5 h-5" />
                Despesas Administrativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-slate-800">{formatarMoeda(dados.despesasAdm)}</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {formatarPercentual(percentualDespesasAdm)}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentualDespesasAdm, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600">Aluguel, utilities, materiais de escritório</p>
              </div>
            </CardContent>
          </Card>

          {/* Despesas com Pessoal */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-600">
                <Users className="w-5 h-5" />
                Despesas com Pessoal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-slate-800">{formatarMoeda(dados.despesasPessoal)}</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {formatarPercentual(percentualDespesasPessoal)}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentualDespesasPessoal, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-600">Salários, benefícios, encargos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Geral */}
        <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <PieChart className="w-7 h-7" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">Faturamento Bruto</p>
                <p className="text-2xl font-bold">{formatarMoeda(dados.faturamentoBruto)}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">Receita Líquida</p>
                <p className="text-2xl font-bold text-green-400">{formatarMoeda(receitaLiquida)}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">Total de Despesas</p>
                <p className="text-2xl font-bold text-orange-400">{formatarMoeda(totalDespesas)}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">Resultado Final</p>
                <p className={`text-2xl font-bold ${lucroContabil >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {formatarMoeda(lucroContabil)}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Impostos: {formatarPercentual(percentualImpostos)}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Vendas: {formatarPercentual(percentualDespesasVendas)}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Administrativo: {formatarPercentual(percentualDespesasAdm)}
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Pessoal: {formatarPercentual(percentualDespesasPessoal)}
                </span>
                <span className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${lucroContabil >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-full`}></div>
                  Margem: {formatarPercentual(percentualLucro)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}