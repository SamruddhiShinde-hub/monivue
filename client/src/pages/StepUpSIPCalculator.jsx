import React, { useState } from 'react';

const formatNumberIndian = (num) => {
  if (!num) return '';
  const x = num.toString().split('.');
  let intPart = x[0];
  const decimalPart = x.length > 1 ? '.' + x[1] : '';
  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') lastThree = ',' + lastThree;
  return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree + decimalPart;
};

const convertToIndianWords = (num) => {
  if (isNaN(num)) return '';

  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numberToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    return "";
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  let str = "";
  if (crore) str += numberToWords(crore) + " crore ";
  if (lakh) str += numberToWords(lakh) + " lakh ";
  if (thousand) str += numberToWords(thousand) + " thousand ";
  if (hundred) str += numberToWords(hundred) + " hundred ";
  if (rest) str += (str !== "" ? "and " : "") + numberToWords(rest);

  return str.trim();
};

const StepUpSIPCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState('');
  const [stepUpPercent, setStepUpPercent] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [durationYears, setDurationYears] = useState('');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const P = parseFloat(initialInvestment);
    const stepUp = parseFloat(stepUpPercent);
    const annualReturn = parseFloat(expectedReturn) / 100;
    const r = annualReturn / 12; // Monthly return rate
    const years = parseInt(durationYears);

    if (!P || stepUp < 0 || !annualReturn || !years) {
      alert('Please enter valid values');
      return;
    }

    let futureValue = 0;
    let totalInvested = 0;
    let currentSIP = P;

    // Calculate for each year
    for (let year = 0; year < years; year++) {
      // For each month in the year
      for (let month = 0; month < 12; month++) {
        const remainingMonths = (years - year) * 12 - month;
        const monthlyFV = currentSIP * Math.pow(1 + r, remainingMonths);
        futureValue += monthlyFV;
        totalInvested += currentSIP;
      }
      
      // Step up the SIP amount for next year
      currentSIP = currentSIP * (1 + stepUp / 100);
    }

    const interestEarned = futureValue - totalInvested;

    setResult({
      futureValue: futureValue.toFixed(2),
      totalInvested: totalInvested.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
    });
  };

  return (
    <div className="sip-wrapper">
      <h2>Step-Up SIP Calculator</h2>
      <div className="sip-layout">
        <div className="sip-inputs">
          <label>
            Initial Monthly SIP (₹)
            <input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              placeholder="e.g., 5000"
            />
            {initialInvestment && (
              <span className="text-indian">
                <span className="green-text">{convertToIndianWords(parseInt(initialInvestment))}</span>
              </span>
            )}
          </label>

          <label>
            Annual Step-Up (%)
            <input
              type="number"
              value={stepUpPercent}
              onChange={(e) => setStepUpPercent(e.target.value)}
              placeholder="e.g., 10"
            />
          </label>

          <label>
            Expected Annual Return (%)
            <input
              type="number"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              placeholder="e.g., 12"
            />
          </label>

          <label>
            Investment Duration (Years)
            <input
              type="number"
              value={durationYears}
              onChange={(e) => setDurationYears(e.target.value)}
              placeholder="e.g., 10"
            />
            {durationYears && (
              <span className="text-indian">
                <span className="green-text">{convertToIndianWords(parseInt(durationYears))} year(s)</span>
              </span>
            )}
          </label>

          <button onClick={handleCalculate}>Calculate</button>
        </div>

        <div className="sip-result">
          <h3>Results</h3>

          <p>
            <strong className="green-text">Total Invested:</strong> ₹
            {result ? formatNumberIndian(Number(result.totalInvested)) : '--'}
            <br />
            <span className="text-indian">
              {result ? convertToIndianWords(Math.round(result.totalInvested)) + ' rupees' : ''}
            </span>
          </p>

          <p>
            <strong className="green-text">Interest Earned:</strong> ₹
            {result ? formatNumberIndian(Number(result.interestEarned)) : '--'}
            <br />
            <span className="text-indian">
              {result ? convertToIndianWords(Math.round(result.interestEarned)) + ' rupees' : ''}
            </span>
          </p>

          <p>
            <strong className="green-text">Future Value:</strong> ₹
            {result ? formatNumberIndian(Number(result.futureValue)) : '--'}
            <br />
            <span className="text-indian">
              {result ? convertToIndianWords(Math.round(result.futureValue)) + ' rupees' : ''}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepUpSIPCalculator;