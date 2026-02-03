const Transaction = require('../models/transactionModel');

// Helper to calculate Linear Regression
const linearRegression = (y) => {
    const n = y.length;
    if (n < 2) return { m: 0, b: y[0] || 0 }; // Not enough data

    const x = Array.from({ length: n }, (_, i) => i + 1); // [1, 2, 3...]

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { m: slope, b: intercept };
};

// @desc    Get Analytics Data (Historical + Prediction)
// @route   GET /api/v1/analytics/data (or POST for Admin)
// @access  Private
const getAnalyticsData = async (req, res) => {
    try {
        let targetUserId = req.user.id;

        // Admin override
        if (req.user.isAdmin && req.body.userId) {
            targetUserId = req.body.userId;
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const transactions = await Transaction.find({
            user: targetUserId,
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 });

        // Aggregate by month
        const monthlyData = {};

        transactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // "2024-5"

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    month: date.toLocaleString('default', { month: 'short' }),
                    income: 0,
                    expense: 0
                };
            }
            monthlyData[key][t.type] += t.amount;
        });

        // Convert to array and ensure chronological order
        const historicalData = Object.values(monthlyData);

        // Prepare data for prediction (Expense Trend)
        const expenseHistory = historicalData.map(d => d.expense);

        // Predict next month
        const { m, b } = linearRegression(expenseHistory);
        const nextMonthX = expenseHistory.length + 1;
        const predictedExpense = Math.max(0, m * nextMonthX + b); // No negative expense

        // Predict Income (Simple average or trend)
        const incomeHistory = historicalData.map(d => d.income);
        const { m: mI, b: bI } = linearRegression(incomeHistory);
        const predictedIncome = Math.max(0, mI * nextMonthX + bI);

        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'short' });

        // --- Smart AI Recommendations Logic ---
        const recommendations = [];
        const currentMonthIndex = new Date().getMonth();

        // 0. Prepare Category Data for Pie Chart (Overall)
        const categoryData = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
            }
        });

        // 1. Calculate Monthly Averages per Category (excluding current month if possible, but datasets are small so use all)
        const categoryMonthlyStats = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const mKey = `${new Date(t.date).getFullYear()}-${new Date(t.date).getMonth()}`;
                if (!categoryMonthlyStats[t.category]) categoryMonthlyStats[t.category] = {};
                if (!categoryMonthlyStats[t.category][mKey]) categoryMonthlyStats[t.category][mKey] = 0;
                categoryMonthlyStats[t.category][mKey] += t.amount;
            }
        });

        // 2. Detect Anomalies (Current Month vs Average)
        const currentMonthData = {};
        // Re-calculate strictly for "this month" to compare
        const now = new Date();
        transactions.filter(t =>
            new Date(t.date).getMonth() === now.getMonth() &&
            new Date(t.date).getFullYear() === now.getFullYear() &&
            t.type === 'expense'
        ).forEach(t => {
            currentMonthData[t.category] = (currentMonthData[t.category] || 0) + t.amount;
        });

        for (const [cat, amount] of Object.entries(currentMonthData)) {
            const months = Object.values(categoryMonthlyStats[cat] || {});
            const total = months.reduce((a, b) => a + b, 0);
            const avg = total / (months.length || 1);

            if (amount > avg * 1.5 && amount > 100) { // Spike > 50% and meaningful amount
                const extra = amount - avg;
                recommendations.push(
                    `Spike detection: **${cat}** spending is **${Math.round((amount / avg - 1) * 100)}% higher** than your average. You spent **$${extra.toFixed(0)}** extra this month.`
                );
            }
        }

        // 3. Highest Spending Category Analysis
        if (recommendations.length < 3) {
            let maxCat = null, maxVal = 0;
            for (const [cat, val] of Object.entries(currentMonthData)) {
                if (val > maxVal) { maxVal = val; maxCat = cat; }
            }

            if (maxCat) {
                const catLower = maxCat.toLowerCase();
                const investments = ['investment', 'savings', 'sip', 'mutual fund', 'stocks', 'gold', 'deposit'];
                const necessities = ['rent', 'emi', 'loan', 'medical', 'education', 'tuition', 'utilities', 'groceries'];
                const discretionary = ['food', 'entertainment', 'shopping', 'travel', 'dining', 'movies', 'subscriptions'];

                if (investments.some(i => catLower.includes(i))) {
                    recommendations.push(
                        `Wealth Builder: You allocated **$${maxVal.toFixed(0)}** to **${maxCat}** this month. This is an excellent financial habit. Ensure you maintain liquid emergency funds.`
                    );
                } else if (necessities.some(n => catLower.includes(n))) {
                    recommendations.push(
                        `Major Commitment: **${maxCat}** is your highest expense ($${maxVal.toFixed(0)}). While fixed, looking for cheaper providers or refinancing could save **$${(maxVal * 0.05).toFixed(0)}** (5%).`
                    );
                } else if (discretionary.some(d => catLower.includes(d))) {
                    recommendations.push(
                        `Lifestyle Check: **${maxCat}** consumes **$${maxVal.toFixed(0)}**. This is variable spending. A stricter budget could cut this by 20%, saving you **$${(maxVal * 0.2).toFixed(0)}**.`
                    );
                } else {
                    // Fallback for general categories
                    recommendations.push(
                        `Top Expense: **${maxCat}** is $${maxVal.toFixed(0)}. If this is discretionary, try targeting a 10% reduction to save **$${(maxVal * 0.1).toFixed(0)}**.`
                    );
                }
            }
        }

        // 4. Savings Rate Analysis (50/30/20 Rule)
        // Assume Last Month for complete data
        const lastMonthData = historicalData[historicalData.length - 2] || historicalData[historicalData.length - 1]; // Fallback to last available
        if (lastMonthData && lastMonthData.income > 0) {
            const savings = lastMonthData.income - lastMonthData.expense;
            const savingsRate = (savings / lastMonthData.income) * 100;

            if (savingsRate < 0) {
                recommendations.push(
                    `Debt Warning: You spent **${Math.abs(savingsRate).toFixed(1)}%** more than you earned last month. Urgent budget review needed.`
                );
            } else if (savingsRate < 20) {
                const requiredSavings = lastMonthData.income * 0.2;
                const shortfall = requiredSavings - savings;
                recommendations.push(
                    `Savings Goal: You saved **${savingsRate.toFixed(1)}%** ($${savings.toFixed(0)}) last month. To hit the recommended **20%**, try to cut **$${shortfall.toFixed(0)}** from generic expenses.`
                );
            } else if (savingsRate >= 50) {
                recommendations.push(
                    `Super Saver: You saved an impressive **${savingsRate.toFixed(1)}%**! You are on the fast track to financial freedom.`
                );
            } else {
                recommendations.push(
                    `Healthy Balance: You are saving **${savingsRate.toFixed(1)}%**, which meets recommended standards (20%+). Keep it up!`
                );
            }
        }

        // 5. Predictive Surplus/Deficit (Forward Looking)
        const predictedSurplus = predictedIncome - predictedExpense;
        if (predictedSurplus < 0) {
            recommendations.push(
                `Forecast Warning: Projected deficit of **$${Math.abs(predictedSurplus).toFixed(0)}** next month. Plan to cut discretionary spending immediately.`
            );
        } else if (predictedSurplus > 2000) {
            recommendations.push(
                `Investment Opportunity: Projected surplus of **$${predictedSurplus.toFixed(0)}**. Investing this in an index fund could yield **~$${(predictedSurplus * 0.07).toFixed(0)}/year** @ 7%.`
            );
        }

        // Format Category Data for Frontend (Pie Chart)
        const expenseByCategory = Object.entries(categoryData)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        res.status(200).json({
            historical: historicalData,
            prediction: {
                month: nextMonthName,
                expense: predictedExpense,
                income: predictedIncome
            },
            summary: {
                trend: m > 0 ? 'increasing' : 'decreasing',
                slope: m
            },
            recommendations,
            expenseByCategory // New Field
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching analytics', error });
    }
};

module.exports = { getAnalyticsData };
