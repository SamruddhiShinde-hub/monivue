import React, { useEffect, useRef, useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import investmentIcon from '../assets/icon-investment.png';
import expenseIcon from '../assets/icon-expense.png';
import goalsIcon from '../assets/icon-goal.png';
import healthIcon from '../assets/icon-fin-health-score.png';
import blog1 from '../assets/blog1.png';
import blog2 from '../assets/blog2.png';
import blog3 from '../assets/blog3.png';
import heroImg from '../assets/herosectionbackground.png';

const features = [
  {
    title: 'Investments',
    icon: investmentIcon,
    desc: 'Track your investment portfolio performance and make informed decisions.',
  },
  {
    title: 'Expenses',
    icon: expenseIcon,
    desc: 'Monitor your spending habits and identify areas for improvement.',
  },
  {
    title: 'Goals',
    icon: goalsIcon,
    desc: 'Set financial goals and track your progress towards achieving them.',
  },
  {
    title: 'Financial Health Score',
    icon: healthIcon,
    desc: 'Get a comprehensive assessment of your financial well-being and identify areas for improvement.',
  },
];

const blogs = [
  {
    title: '5 Habits of Financially Smart People',
    desc: 'Learn how small habits can lead to big financial freedom.',
    image: blog1,
  },
  {
    title: 'Beginner’s Guide to Investing',
    desc: 'Understand the basics of where and how to invest.',
    image: blog2,
  },
  {
    title: 'How to Budget Like a Pro',
    desc: 'Simple steps to organize your money effectively.',
    image: blog3,
  },
];

const faqs = [
  {
    question: 'What is financial health and why is it important?',
    answer:
      'Financial health refers to the state of your personal financial situation — including income, savings, debt, expenses, and investments. Good financial health allows you to manage daily expenses, handle emergencies, achieve long-term goals, and avoid financial stress.',
  },
  {
    question: 'How can I check my financial health?',
    answer:
      'You can assess your financial health by checking key indicators like your savings rate, debt-to-income ratio, net worth, credit score, and ability to meet financial goals. Tools like budgeting apps and net worth calculators can help you track this over time.',
  },
  {
    question: 'What are the signs of poor financial health?',
    answer:
      'Signs include living paycheck to paycheck, having little or no emergency savings, carrying high-interest debt, missing bill payments, and not saving for future goals like retirement or education.',
  },
  {
    question: 'How can I improve my financial health?',
    answer:
      'Start by creating a realistic budget, cutting unnecessary expenses, building an emergency fund, paying down high-interest debt, and setting clear savings and investment goals. Reviewing your financial plan regularly also helps maintain strong financial habits.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = heroRef.current.getBoundingClientRect();
      setCursor({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="landing-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div
          className="cursor-glow"
          style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
        />
        <div className="hero-content">
          <div className="hero-left">
            <h1>Own Your Finances, Shape Your Future.</h1>
            <button onClick={() => navigate('/register')}>Get Started</button>
          </div>
          <div className="hero-right">
            <img src={heroImg} alt="Finance Illustration" />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feat, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-image">
                <img src={feat.icon} alt={feat.title} />
              </div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blogs */}
      <section className="blogs-section">
        <h2>Latest Insights</h2>
        <div className="blogs-grid">
          {blogs.map((blog, index) => (
            <div className="blog-card" key={index}>
              <div className="blog-image">
                {blog.image && (
                  <img className="blogimg" src={blog.image} alt={blog.title} />
                )}
              </div>
              <h4>{blog.title}</h4>
              <p>{blog.desc}</p>
            </div>
          ))}
        </div>
        <button className="blog-btn">See All Blogs</button>
      </section>

      {/* FAQs */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
              key={index}
            >
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                <h4>{faq.question}</h4>
                <span className="faq-toggle-icon">
                  {openFaqIndex === index ? '-' : '+'}
                </span>
              </div>
              <div
                className="faq-answer"
                style={{
                  maxHeight: openFaqIndex === index ? '200px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
