// ==== FRONTEND: Goals.jsx ====
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Goals.css';

const defaultDescriptions = ['Retirement', 'House', 'Education', 'Travel', 'Custom'];
const priorities = ['High', 'Medium', 'Low'];

const Goals = ({ user }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    description: 'Retirement',
    custom_description: '',
    priority: 'Medium',
    present_value: '',
    time_horizon: '',
    inflation: ''
  });
  const [lastCreatedGoalId, setLastCreatedGoalId] = useState(null);
  const [subInputs, setSubInputs] = useState({});

  useEffect(() => {
    if (user?.id) {
      axios.get(`/api/goals/${user.id}`)
        .then(res => setGoals(res.data))
        .catch(err => console.error('Fetch error:', err));
    }
  }, [user]);

  const handleChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const handleSubInputChange = (goalId, field, value) => {
    setSubInputs(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }));
  };

  const handleSubCalculationSave = async (goalId) => {
    const inputs = subInputs[goalId];
    if (!inputs) return;
    try {
      await axios.post('/api/goals/calculation', {
        goal_id: goalId,
        ...inputs
      });
      alert('📊 Calculation saved!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save calculation');
    }
  };

  const calculateFutureValue = () => {
    const pv = parseFloat(newGoal.present_value);
    const th = parseFloat(newGoal.time_horizon);
    const inf = parseFloat(newGoal.inflation);
    if (isNaN(pv) || isNaN(th) || isNaN(inf)) return '';
    const inflationRate = inf / 100;
    return (pv * Math.pow((1 + inflationRate), th)).toFixed(2);
  };

  const handleAddGoal = async () => {
    const future_value = calculateFutureValue();

    if (!newGoal.present_value || !newGoal.time_horizon || !newGoal.inflation) {
      alert('❌ Please fill out all numeric fields correctly.');
      return;
    }

    if (newGoal.description === 'Custom' && !newGoal.custom_description.trim()) {
      alert('❌ Please enter a custom goal description.');
      return;
    }

    const body = {
      ...newGoal,
      future_value,
      user_id: user.id
    };

    try {
      const res = await axios.post('/api/goals/add', body);
      const refreshed = await axios.get(`/api/goals/${user.id}`);
      setGoals(refreshed.data);
      setLastCreatedGoalId(res.data.id);
      setNewGoal({
        description: 'Retirement',
        custom_description: '',
        priority: 'Medium',
        present_value: '',
        time_horizon: '',
        inflation: ''
      });
      alert('✅ Goal saved!');
    } catch (err) {
      console.error(err.response?.data || err);
      alert('❌ Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/goals/${id}`);
      setGoals(goals.filter(goal => goal.id !== id));
      alert('🗑️ Goal deleted');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to delete');
    }
  };

  return (
    <div className="goals-page">
      <h2>Financial Goals</h2>
      <table className="goals-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Priority</th>
            <th>Present Value</th>
            <th>Time Horizon (Years)</th>
            <th>Inflation (%)</th>
            <th>Future Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <select name="description" value={newGoal.description} onChange={handleChange}>
                {defaultDescriptions.map(desc => (
                  <option key={desc} value={desc}>{desc}</option>
                ))}
              </select>
              {newGoal.description === 'Custom' && (
                <input
                  type="text"
                  name="custom_description"
                  value={newGoal.custom_description}
                  onChange={handleChange}
                  placeholder="Enter custom goal"
                />
              )}
            </td>
            <td>
              <select name="priority" value={newGoal.priority} onChange={handleChange}>
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </td>
            <td><input type="number" name="present_value" value={newGoal.present_value} onChange={handleChange} /></td>
            <td><input type="number" name="time_horizon" value={newGoal.time_horizon} onChange={handleChange} /></td>
            <td><input type="number" name="inflation" value={newGoal.inflation} onChange={handleChange} /></td>
            <td>₹{calculateFutureValue()}</td>
            <td><button onClick={handleAddGoal}>Save</button></td>
          </tr>

          {goals.map(goal => (
            <React.Fragment key={goal.id}>
              <tr>
                <td>{goal.final_description}</td>
                <td>{goal.priority}</td>
                <td>₹{goal.present_value}</td>
                <td>{goal.time_horizon}</td>
                <td>{goal.inflation}</td>
                <td>₹{goal.future_value}</td>
                <td><button onClick={() => handleDelete(goal.id)}>Delete</button></td>
              </tr>
              {goal.id === lastCreatedGoalId && (
                <>
                  <tr className="goal-sub-headings">
                    <th>Initial Amount</th>
                    <th>Monthly Amount</th>
                    <th>Yearly Increase (%)</th>
                    <th>Annual Return (%)</th>
                    <th colSpan={3}><button onClick={() => handleSubCalculationSave(goal.id)}>Save Calculation</button></th>
                  </tr>
                  <tr className="goal-sub-row">
                    <td><input type="number" onChange={e => handleSubInputChange(goal.id, 'initial_amount', e.target.value)} /></td>
                    <td><input type="number" onChange={e => handleSubInputChange(goal.id, 'monthly_amount', e.target.value)} /></td>
                    <td><input type="number" onChange={e => handleSubInputChange(goal.id, 'yearly_increase', e.target.value)} /></td>
                    <td><input type="number" onChange={e => handleSubInputChange(goal.id, 'annual_return', e.target.value)} /></td>
                    <td colSpan={3}>—</td>
                  </tr>
                </>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Goals;
