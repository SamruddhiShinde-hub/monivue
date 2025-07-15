import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post('/api/auth/register', formData);
      setMessage({ text: res.data.message || 'Registered successfully!', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Registration Error:', err);
      setMessage({
        text: err.response?.data?.message || 'Something went wrong',
        type: 'error',
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>

        {message.text && (
          <p className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </p>
        )}

        <p className="toggle-link">
          Already have an account? <Link to="/login"><u>Login</u></Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
