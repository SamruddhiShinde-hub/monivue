import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './NetWorth.css';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const NetWorth = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [view, setView] = useState('all');
  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetRes, liabilityRes] = await Promise.all([
          axios.get(`/api/assets/user/${user.id}`),
          axios.get(`/api/liabilities/user/${user.id}`)
        ]);
        setAssets(assetRes.data || []);
        setLiabilities(liabilityRes.data || []);
      } catch (err) {
        console.error('Error fetching net worth data:', err);
      }
    };

    if (user?.id) fetchData();
  }, [user]);

  const totalAssets = assets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const getAssetShades = (count) => {
    const base = [56, 224, 120];
    return Array.from({ length: count }, (_, i) => {
      const factor = 1 - i * 0.07;
      return `rgb(${base.map(c => Math.max(0, Math.floor(c * factor))).join(',')})`;
    });
  };

  const getLiabilityShades = (count) => {
    const base = [255, 105, 97];
    return Array.from({ length: count }, (_, i) => {
      const factor = 1 - i * 0.07;
      return `rgb(${base.map(c => Math.max(0, Math.floor(c * factor))).join(',')})`;
    });
  };

  const generateChartData = () => {
    if (view === 'Assets' && assets.length) {
      return {
        labels: assets.map((a) => a.name || a.category || 'Asset'),
        datasets: [{
          data: assets.map((a) => Number(a.amount || 0)),
          backgroundColor: getAssetShades(assets.length),
          borderWidth: 1
        }]
      };
    } else if (view === 'Liabilities' && liabilities.length) {
      return {
        labels: liabilities.map((l) => l.name || l.category || 'Liability'),
        datasets: [{
          data: liabilities.map((l) => Number(l.amount || 0)),
          backgroundColor: getLiabilityShades(liabilities.length),
          borderWidth: 1
        }]
      };
    } else {
      return {
        labels: ['Assets', 'Liabilities'],
        datasets: [{
          data: [totalAssets, totalLiabilities],
          backgroundColor: ['#38E078', '#ff6961'],
          borderWidth: 1
        }]
      };
    }
  };

  const chartData = generateChartData();

  const handleChartClick = (event) => {
    const chart = chartRef.current;
    if (!chart) return;

    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);
    if (!elements.length) return;

    const index = elements[0].index;
    const label = chartData.labels[index];
    if (label === 'Assets' || label === 'Liabilities') {
      setView(label);
    }
  };

  const getAssetDisplayName = (a) => a.name || a.category || a.type || a.description || 'Unknown Asset';
  const getLiabilityDisplayName = (l) => l.name || l.category || l.type || l.description || 'Unknown Liability';

  return (
    <div className="networth-page">
      <h2>Net Worth</h2>

      <div className="networth-layout">
        <div className="networth-left">
          <div className="networth-cards">
            <div className="networth-summary-card">
              <h4>Current Net Worth</h4>
              <p>₹{netWorth.toLocaleString()}</p>
            </div>
          </div>

          <h3>Assets vs Liabilities Breakdown</h3>
          <div className="side-by-side-tables">
            <table className="breakdown-table">
              <thead>
                <tr><th colSpan={2}>Assets</th></tr>
                <tr><th>Item</th><th>Value</th></tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={`asset-${a.id}`} className={`row-green ${view === 'Liabilities' ? 'row-greyed' : ''}`}>
                    <td>{getAssetDisplayName(a)}</td>
                    <td>₹{Number(a.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>₹{totalAssets.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            <table className="breakdown-table">
              <thead>
                <tr><th colSpan={2}>Liabilities</th></tr>
                <tr><th>Item</th><th>Value</th></tr>
              </thead>
              <tbody>
                {liabilities.map((l) => (
                  <tr key={`liability-${l.id}`} className={`row-red ${view === 'Assets' ? 'row-greyed' : ''}`}>
                    <td>{getLiabilityDisplayName(l)}</td>
                    <td>₹{Number(l.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>₹{totalLiabilities.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="networth-right">
          <div className="donut-chart">
            <h3>Net Worth Distribution</h3>
            <Doughnut data={chartData} ref={chartRef} onClick={handleChartClick} />
            {view !== 'all' && (
              <button className="reset-btn" onClick={() => setView('all')}>Reset View</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorth;
