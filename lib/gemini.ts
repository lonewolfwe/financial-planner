import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

export async function getFinancialInsights(financialData: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const monthlyIncome = parseFloat(financialData.monthlyIncome);
  const monthlyExpenses = parseFloat(financialData.monthlyExpenses);
  const currentSavings = parseFloat(financialData.currentSavings);
  const currentDebt = parseFloat(financialData.currentDebt) || 0;
  const disposableIncome = monthlyIncome - monthlyExpenses;
  const savingsRate = (
    ((monthlyIncome - monthlyExpenses) / monthlyIncome) *
    100
  ).toFixed(1);
  const debtToIncomeRatio = currentDebt
    ? ((currentDebt / (monthlyIncome * 12)) * 100).toFixed(1)
    : 0;

  const prompt = `
    As a financial advisor, provide a comprehensive and actionable analysis based on the following financial data:
Financial Overview:

Monthly Income: $${monthlyIncome.toLocaleString()}
Monthly Expenses: $${monthlyExpenses.toLocaleString()}
Disposable Income: $${disposableIncome.toLocaleString()}
Current Savings: $${currentSavings.toLocaleString()}
Current Debt: $${currentDebt.toLocaleString()}
Savings Rate: ${savingsRate}%
Debt-to-Income Ratio: ${debtToIncomeRatio}%
Financial Goals: ${financialData.financialGoals}
Timeframe: ${financialData.timeframe}
Please provide a detailed analysis in the following format:

1. Financial Health Summary
Assess overall financial health, highlighting key strengths and areas for improvement.
Compare the current savings rate and debt-to-income ratio to industry benchmarks.
Identify immediate financial risks or opportunities for improvement.
2. Budget Optimization (50/30/20 Rule)
Needs (50%): Provide a breakdown of essential expenses and suggest adjustments if this category exceeds 50%.
Wants (30%): Offer recommendations to balance discretionary spending while maintaining quality of life.
Savings (20%): Outline strategies to allocate savings effectively, including short-term and long-term investments.
Highlight specific areas for expense reduction in each category to free up additional disposable income.
3. Goal Achievement Strategy
Develop a step-by-step plan to achieve the stated financial goals within the specified timeframe.
Define monthly savings targets and key timeline milestones.
Identify potential challenges (e.g., income fluctuations, unexpected expenses) and propose mitigation strategies.
4. Investment and Savings Recommendations
Recommend an appropriate emergency fund level based on income and expenses.
Suggest suitable investment vehicles (e.g., stocks, bonds, mutual funds) tailored to the timeframe and risk tolerance.
Include strategies for risk management and tax efficiency to maximize returns.
5. Debt Management Strategy (if applicable)
Create a prioritized debt repayment plan focusing on high-interest debts first.
Suggest strategies to reduce interest payments, such as refinancing or negotiating rates.
Explore opportunities for debt consolidation and provide a timeline for becoming debt-free.
6. Action Items
List 3-5 immediate actions to take, such as adjusting budget categories, starting an emergency fund, or making extra debt payments.
Recommend monthly monitoring metrics (e.g., savings rate, debt reduction progress).
Provide a suggested timeline for reviewing and updating the financial plan.
Focus on practical, actionable advice that can be implemented immediately, using specific numbers and percentages where applicable. Maintain a professional yet encouraging tone to motivate the user toward financial success.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating financial insights:', error);
    throw error;
  }
}
