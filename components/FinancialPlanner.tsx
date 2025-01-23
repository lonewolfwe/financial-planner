'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getFinancialInsights } from '@/lib/gemini';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  monthlyIncome: z.string().min(1, 'Monthly income is required'),
  monthlyExpenses: z.string().min(1, 'Monthly expenses are required'),
  currentSavings: z.string().min(1, 'Current savings amount is required'),
  currentDebt: z.string(),
  financialGoals: z.string().min(1, 'Please specify your financial goals'),
  timeframe: z.string().min(1, 'Timeframe is required'),
});

const COLORS = ['#FF8042', '#00C49F', '#FFBB28'];

// Chart configuration with modern props pattern
const chartConfig = {
  xAxis: {
    allowDecimals: false,
    axisLine: true,
    tickLine: true,
  },
  yAxis: {
    axisLine: true,
    tickLine: true,
    width: 80,
  },
};

export default function FinancialPlanner() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const [chartData, setChartData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const insights = await getFinancialInsights(data);
      setInsights(insights);

      // Calculate budget allocation for pie chart
      const monthlyIncome = parseFloat(data.monthlyIncome);
      const pieData = [
        { name: 'Needs', value: monthlyIncome * 0.5 },
        { name: 'Wants', value: monthlyIncome * 0.3 },
        { name: 'Savings', value: monthlyIncome * 0.2 },
      ];

      // Generate projection data for line chart
      const months = 12;
      const savingsGoal = parseFloat(
        data.financialGoals.match(/\d+/)?.[0] || '0'
      );
      const currentSavings = parseFloat(data.currentSavings);
      const monthlySavings = monthlyIncome * 0.2;

      const lineData = Array.from({ length: months }, (_, i) => ({
        month: `Month ${i + 1}`,
        savings: currentSavings + monthlySavings * (i + 1),
        goal: savingsGoal,
      }));

      setChartData({ pie: pieData, line: lineData });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                {...register('monthlyIncome')}
                className={errors.monthlyIncome ? 'border-destructive' : ''}
              />
              {errors.monthlyIncome && (
                <p className="text-sm text-destructive">
                  {errors.monthlyIncome.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                {...register('monthlyExpenses')}
                className={errors.monthlyExpenses ? 'border-destructive' : ''}
              />
              {errors.monthlyExpenses && (
                <p className="text-sm text-destructive">
                  {errors.monthlyExpenses.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings ($)</Label>
              <Input
                id="currentSavings"
                type="number"
                {...register('currentSavings')}
                className={errors.currentSavings ? 'border-destructive' : ''}
              />
              {errors.currentSavings && (
                <p className="text-sm text-destructive">
                  {errors.currentSavings.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentDebt">Current Debt ($)</Label>
              <Input
                id="currentDebt"
                type="number"
                {...register('currentDebt')}
                className={errors.currentDebt ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="financialGoals">Financial Goals</Label>
              <Textarea
                id="financialGoals"
                {...register('financialGoals')}
                placeholder="e.g., Save $50,000 for a house down payment"
                className={errors.financialGoals ? 'border-destructive' : ''}
              />
              {errors.financialGoals && (
                <p className="text-sm text-destructive">
                  {errors.financialGoals.message?.toString()}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timeframe">Timeframe to Achieve Goals</Label>
              <Input
                id="timeframe"
                {...register('timeframe')}
                placeholder="e.g., 2 years"
                className={errors.timeframe ? 'border-destructive' : ''}
              />
              {errors.timeframe && (
                <p className="text-sm text-destructive">
                  {errors.timeframe.message?.toString()}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Insights...
              </>
            ) : (
              'Generate Financial Plan'
            )}
          </Button>
        </form>
      </Card>

      {chartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.pie.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Savings Projection</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.line}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" {...chartConfig.xAxis} />
                <YAxis {...chartConfig.yAxis} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#00C49F"
                  name="Projected Savings"
                />
                <Line
                  type="monotone"
                  dataKey="goal"
                  stroke="#FF8042"
                  name="Goal"
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {insights && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            AI-Generated Financial Insights
          </h3>
          <div className="prose prose-sm max-w-none">
            {insights.split('\n').map((line, index) => {
              if (
                line.startsWith('#') ||
                line.startsWith('1.') ||
                line.startsWith('2.') ||
                line.startsWith('3.') ||
                line.startsWith('4.') ||
                line.startsWith('5.') ||
                line.startsWith('6.')
              ) {
                return (
                  <h4 key={index} className="text-lg font-semibold mt-4 mb-2">
                    {line}
                  </h4>
                );
              } else if (line.startsWith('-')) {
                return (
                  <li key={index} className="ml-4 mb-2">
                    {line.substring(2)}
                  </li>
                );
              } else if (line.trim() === '') {
                return <div key={index} className="my-2" />;
              } else {
                return (
                  <p key={index} className="mb-2">
                    {line}
                  </p>
                );
              }
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
