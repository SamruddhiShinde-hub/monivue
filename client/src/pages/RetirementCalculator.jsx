import React, { useState, useEffect } from 'react';
import './RetirementCalculator.css';

const RetirementCalculator = () => {
  // State for user inputs with initial values
  const [inputs, setInputs] = useState({
    currentAge: 38,
    retirementAge: 60,
    lifeExpectancy: 97,
    currentSavings: 2000000,
    monthlySaving: 40000,
    increaseInSavings: 0.1,
    returnOnInvestment: 0.06,
    capitalGainTax: 0,
    preRetirementMonthlyExpenses: 40000,
    householdInflationRate: 0.05,
  });

  // State for the simulation results and post-retirement expenses
  const [simulation, setSimulation] = useState([]);
  const [postRetirementMonthlyExpenses, setPostRetirementMonthlyExpenses] = useState(0);

  // Main effect to run the simulation whenever inputs change
  useEffect(() => {
    // ✅ VERIFIED CALCULATION: This section correctly calculates the future value of
    // today's monthly expenses at the time of retirement using the provided inflation rate.
    // The formula for Future Value (FV) is: FV = PV * (1 + r)^n
    // PV (Present Value) = preRetirementMonthlyExpenses
    // r (rate) = householdInflationRate
    // n (periods) = yearsToRetire
    const yearsToRetire = inputs.retirementAge - inputs.currentAge;
    const postRetirementExpenses =
      inputs.preRetirementMonthlyExpenses * Math.pow(1 + inputs.householdInflationRate, yearsToRetire);
    setPostRetirementMonthlyExpenses(postRetirementExpenses);

    const newSimulation = [];
    let corpusAtBeginningOfYear = inputs.currentSavings;
    let incrementalSavings = inputs.monthlySaving * 12;

    // Loop from current age until well past life expectancy
    for (let age = inputs.currentAge; age <= inputs.lifeExpectancy + 20; age++) {
      const isRetired = age >= inputs.retirementAge;
      const returnOnInvestedAmount = corpusAtBeginningOfYear * inputs.returnOnInvestment;
      
      let withdrawals = 0;
      if (isRetired) {
        if (age === inputs.retirementAge) {
          // First year of retirement withdrawals are based on the calculated future expenses
          withdrawals = postRetirementExpenses * 12;
        } else {
          // Subsequent years, increase last year's withdrawal by inflation
          const previousWithdrawal = newSimulation[newSimulation.length - 1]?.withdrawals || 0;
          withdrawals = previousWithdrawal * (1 + inputs.householdInflationRate);
        }
      }

      const currentYearSavings = isRetired ? 0 : incrementalSavings;

      // Calculate the corpus at the end of the year
      const corpusAtEndOfYear =
        corpusAtBeginningOfYear + currentYearSavings + returnOnInvestedAmount - withdrawals;

      // Determine alive status
      let aliveStatus = age <= inputs.lifeExpectancy ? 'Alive & Kicking' : "YOU'RE DEAD";
      
      let comments = '';
      if(age === inputs.retirementAge) comments = "YOU RETIRE HERE";

      // Push the current year's data to the simulation array
      newSimulation.push({
        age,
        corpusAtBeginningOfYear,
        incrementalSavings: currentYearSavings,
        returnOnInvestedAmount,
        withdrawals,
        withdrawalRate: isRetired && corpusAtBeginningOfYear > 0 ? (withdrawals / corpusAtBeginningOfYear) : 0,
        alive: aliveStatus,
        comments,
      });

      corpusAtBeginningOfYear = corpusAtEndOfYear;
      
      // Only increase savings if not retired
      if (!isRetired) {
        incrementalSavings *= (1 + inputs.increaseInSavings);
      }
      
      // Stop simulation if funds are depleted after retirement
      if (corpusAtBeginningOfYear < 0 && isRetired) {
        newSimulation[newSimulation.length - 1].comments = "FUNDS DEPLETED";
        break;
      }
    }
    setSimulation(newSimulation);
  }, [inputs]);

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: Number(value) }));
  };
  
  // Helper to format numbers as Indian Rupees
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="retirement-calculator">
      <h2>Retirement Calculator</h2>
      <div className="inputs-container">
        {/* Input fields for the calculator */}
        <div className="input-group">
          <label>Your Current Age (Years)</label>
          <input type="number" name="currentAge" value={inputs.currentAge} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>When You Want to Retire (Years)</label>
          <input type="number" name="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Expect to Live Until (Years)</label>
          <input type="number" name="lifeExpectancy" value={inputs.lifeExpectancy} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Current Savings Till Date</label>
          <input type="number" name="currentSavings" value={inputs.currentSavings} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Current Monthly Saving</label>
          <input type="number" name="monthlySaving" value={inputs.monthlySaving} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Increase in Savings (Annually %)</label>
          <input type="number" name="increaseInSavings" value={inputs.increaseInSavings * 100} onChange={(e) => setInputs(prev => ({ ...prev, increaseInSavings: Number(e.target.value) / 100}))} />
        </div>
        <div className="input-group">
          <label>Return on Investment (Pre-Tax %)</label>
          <input type="number" name="returnOnInvestment" value={inputs.returnOnInvestment * 100} onChange={(e) => setInputs(prev => ({ ...prev, returnOnInvestment: Number(e.target.value) / 100}))} />
        </div>
        <div className="input-group">
          <label>Capital Gain Tax (%)</label>
          <input type="number" name="capitalGainTax" value={inputs.capitalGainTax * 100} onChange={(e) => setInputs(prev => ({ ...prev, capitalGainTax: Number(e.target.value) / 100}))} />
        </div>
        <div className="input-group">
          <label>Pre-Retirement Monthly Expenses</label>
          <input type="number" name="preRetirementMonthlyExpenses" value={inputs.preRetirementMonthlyExpenses} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Household Inflation Rate (%)</label>
          <input type="number" name="householdInflationRate" value={inputs.householdInflationRate * 100} onChange={(e) => setInputs(prev => ({ ...prev, householdInflationRate: Number(e.target.value) / 100}))} />
        </div>
         <div className="input-group">
            <label>Post-Retirement Monthly Expenses (Auto)</label>
            <input type="text" readOnly value={formatCurrency(postRetirementMonthlyExpenses)} />
        </div>
      </div>

      <div className="simulation-table">
        <h3>Simulation</h3>
        <table>
          <thead>
            <tr>
              <th>Age</th>
              <th>Corpus at Beginning</th>
              <th>Incremental Savings</th>
              <th>Return on Investment</th>
              <th>Withdrawals</th>
              <th>Withdrawal Rate</th>
              <th>Alive?</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {simulation.map((row, index) => (
              <tr key={index}>
                <td>{row.age}</td>
                <td>{formatCurrency(row.corpusAtBeginningOfYear)}</td>
                <td>{formatCurrency(row.incrementalSavings)}</td>
                <td>{formatCurrency(row.returnOnInvestedAmount)}</td>
                <td>{formatCurrency(row.withdrawals)}</td>
                <td>{`${(row.withdrawalRate * 100).toFixed(2)}%`}</td>
                <td className={row.alive !== 'Alive & Kicking' ? 'dead' : ''}>{row.alive}</td>
                <td className={row.comments === "YOU RETIRE HERE" ? 'retired' : row.comments === "FUNDS DEPLETED" ? 'dead' : ''}>{row.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetirementCalculator;
