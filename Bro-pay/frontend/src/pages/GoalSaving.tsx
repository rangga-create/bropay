import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit2, Trash2, Trophy } from 'lucide-react';
import { api } from '../services/api';
import '../styles/goal-saving.css';

interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

const GoalSaving: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '', icon: '🎯', color: '#2563EB' });
  const [addFundsGoal, setAddFundsGoal] = useState<SavingsGoal | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await api.goals.list();
        if (data.goals?.length) {
          setGoals(data.goals.map((g: any) => ({
            id: g.id,
            name: g.name,
            targetAmount: Number(g.target_amount || g.targetAmount || g.target),
            currentAmount: Number(g.current_amount || g.currentAmount || g.current),
            deadline: g.deadline || '',
            icon: g.icon || '🎯',
            color: g.color || '#2563EB',
          })));
        }
      } catch {
        setGoals([
          { id: 1, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6500, deadline: '2026-12-31', icon: '🛡️', color: '#2563EB' },
          { id: 2, name: 'Vacation Trip', targetAmount: 3000, currentAmount: 1200, deadline: '2026-09-15', icon: '✈️', color: '#10B981' },
          { id: 3, name: 'New Laptop', targetAmount: 2000, currentAmount: 1800, deadline: '2026-08-01', icon: '💻', color: '#8B5CF6' },
          { id: 4, name: 'Car Down Payment', targetAmount: 15000, currentAmount: 4500, deadline: '2027-06-01', icon: '🚗', color: '#F59E0B' },
        ]);
      }
    };
    fetchGoals();
  }, []);

  const addGoal = async () => {
    if (newGoal.name && newGoal.target) {
      const entry = {
        name: newGoal.name,
        targetAmount: Number(newGoal.target),
        currentAmount: 0,
        deadline: newGoal.deadline,
        icon: newGoal.icon,
        color: newGoal.color,
      };
      try {
        const data = await api.goals.create(entry);
        if (data.goal) {
          setGoals([...goals, { ...entry, id: data.goal.id }]);
        }
      } catch {
        setGoals([...goals, { ...entry, id: Date.now() }]);
      }
      setNewGoal({ name: '', target: '', deadline: '', icon: '🎯', color: '#2563EB' });
      setShowAddModal(false);
    }
  };

  const updateGoal = async () => {
    if (editingGoal && newGoal.name && newGoal.target) {
      const updated = { ...editingGoal, name: newGoal.name, targetAmount: Number(newGoal.target), deadline: newGoal.deadline };
      try { await api.goals.update(editingGoal.id, updated); } catch { /* fallback */ }
      setGoals(goals.map(g => g.id === editingGoal.id ? updated : g));
      setEditingGoal(null);
      setNewGoal({ name: '', target: '', deadline: '', icon: '🎯', color: '#2563EB' });
      setShowAddModal(false);
    }
  };

  const deleteGoal = async (id: number) => {
    try { await api.goals.delete(id); } catch { /* fallback */ }
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddFunds = async () => {
    if (addFundsGoal && addFundsAmount) {
      const amount = Number(addFundsAmount);
      const updated = { ...addFundsGoal, currentAmount: Math.min(addFundsGoal.currentAmount + amount, addFundsGoal.targetAmount) };
      try { await api.goals.update(addFundsGoal.id, updated); } catch { /* fallback */ }
      setGoals(goals.map(g => g.id === addFundsGoal.id ? updated : g));
      setAddFundsGoal(null);
      setAddFundsAmount('');
    }
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setNewGoal({ name: goal.name, target: String(goal.targetAmount), deadline: goal.deadline, icon: goal.icon, color: goal.color });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingGoal(null);
    setNewGoal({ name: '', target: '', deadline: '', icon: '🎯', color: '#2563EB' });
  };

  const [nowTimestamp] = useState(() => Date.now());

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return '—';
    const diff = new Date(deadline).getTime() - nowTimestamp;
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    return days;
  };

  return (
    <div className="goal-page">
      <div className="page-header">
        <div>
          <h1>Goal Saving</h1>
          <p>Set financial targets and track your progress toward each goal</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      <div className="goal-overview">
        <div className="overview-card">
          <Trophy size={24} className="overview-icon" />
          <div>
            <span className="overview-label">Total Goals</span>
            <span className="overview-value">{goals.length}</span>
          </div>
        </div>
        <div className="overview-card">
          <Target size={24} className="overview-icon" />
          <div>
            <span className="overview-label">Total Target</span>
            <span className="overview-value">${totalTarget.toLocaleString()}</span>
          </div>
        </div>
        <div className="overview-card">
          <TrendingUp size={24} className="overview-icon" />
          <div>
            <span className="overview-label">Total Saved</span>
            <span className="overview-value">${totalSaved.toLocaleString()}</span>
            <span className="overview-percentage">{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}% of target</span>
          </div>
        </div>
      </div>

      <div className="goals-grid">
        {goals.map(goal => {
          const percentage = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          const daysLeft = getDaysLeft(goal.deadline);
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-header">
                <div className="goal-icon" style={{ background: `${goal.color}20`, color: goal.color }}>
                  {goal.icon}
                </div>
                <div className="goal-actions">
                  <button className="action-btn" onClick={() => openEditModal(goal)}><Edit2 size={14} /></button>
                  <button className="action-btn delete" onClick={() => deleteGoal(goal.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3>{goal.name}</h3>
              <div className="goal-amounts">
                <span className="current">${goal.currentAmount.toLocaleString()}</span>
                <span className="target">of ${goal.targetAmount.toLocaleString()}</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentage}%`, background: goal.color }}></div>
                </div>
                <span className="progress-text">{percentage.toFixed(0)}%</span>
              </div>
              <div className="goal-footer">
                <span className="deadline">
                  <Calendar size={14} />
                  {typeof daysLeft === 'number' ? `${daysLeft} days left` : daysLeft}
                </span>
                <button className="btn btn-sm btn-primary" onClick={() => { setAddFundsGoal(goal); setAddFundsAmount(''); }}>
                  + Add Funds
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}</h2>
            <div className="input-group">
              <label>Goal Name</label>
              <input type="text" className="input-field" placeholder="e.g., New Car" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Target Amount ($)</label>
              <input type="number" className="input-field" placeholder="0.00" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Deadline</label>
              <input type="date" className="input-field" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={editingGoal ? updateGoal : addGoal}>{editingGoal ? 'Save Changes' : 'Create Goal'}</button>
            </div>
          </div>
        </div>
      )}

      {addFundsGoal && (
        <div className="modal-overlay" onClick={() => setAddFundsGoal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Funds to "{addFundsGoal.name}"</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Current: ${addFundsGoal.currentAmount.toLocaleString()} / ${addFundsGoal.targetAmount.toLocaleString()}
            </p>
            <div className="input-group">
              <label>Amount ($)</label>
              <input type="number" className="input-field" placeholder="0.00" value={addFundsAmount} onChange={(e) => setAddFundsAmount(e.target.value)} autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setAddFundsGoal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddFunds} disabled={!addFundsAmount || Number(addFundsAmount) <= 0}>Add Funds</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSaving;
