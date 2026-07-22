import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from 'lucide-react';
import { api } from '../services/api';
import '../styles/analytics.css';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Analytics: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.analytics.summary(timeRange);
        setBalance(data.balance || 0);
        setIncome(data.income || 0);
        setExpense(data.expense || 0);
      } catch (_err) {
        console.error('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const spendingByCategory = [
    { name: 'Food & Dining', value: 450, color: '#2563EB' },
    { name: 'Transportation', value: 280, color: '#10B981' },
    { name: 'Shopping', value: 350, color: '#F59E0B' },
    { name: 'Bills & Utilities', value: 200, color: '#EF4444' },
    { name: 'Entertainment', value: 150, color: '#8B5CF6' },
  ];

  const monthlyData = [
    { month: 'Jan', income: 4200, expense: 3100 },
    { month: 'Feb', income: 4800, expense: 3400 },
    { month: 'Mar', income: 4500, expense: 2900 },
    { month: 'Apr', income: 5100, expense: 3600 },
    { month: 'May', income: 4900, expense: 3200 },
    { month: 'Jun', income: 5400, expense: 3800 },
  ];

  const dailySpending = [
    { day: 'Mon', amount: 120 },
    { day: 'Tue', amount: 85 },
    { day: 'Wed', amount: 200 },
    { day: 'Thu', amount: 150 },
    { day: 'Fri', amount: 280 },
    { day: 'Sat', amount: 320 },
    { day: 'Sun', amount: 180 },
  ];

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="page-header">
          <div className="skeleton-header"></div>
        </div>
        <div className="analytics-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="analytics-card skeleton">
              <div className="skeleton-chart"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Track your financial insights and spending patterns</p>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            <Calendar size={16} />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon income">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Income</span>
            <span className="stat-value">${income.toLocaleString()}</span>
            <span className="stat-trend positive">+12.5% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expense">
            <TrendingDown size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">${expense.toLocaleString()}</span>
            <span className="stat-trend negative">+4.2% vs last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon balance">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Net Savings</span>
            <span className="stat-value">${(income - expense).toLocaleString()}</span>
            <span className="stat-trend positive">+8.3% vs last month</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card span-2">
          <h3>Income vs Expenses</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Spending by Category</h3>
          <div className="chart-container pie-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`$${value}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="category-legend">
            {spendingByCategory.map((cat, i) => (
              <div key={cat.name} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[i] }}></span>
                <span className="legend-label">{cat.name}</span>
                <span className="legend-value">${cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card span-2">
          <h3>Daily Spending Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`$${value}`, 'Spending']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
