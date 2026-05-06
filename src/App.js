import React, { useState, useEffect, useMemo } from 'react';

// --- 預設常數 ---
const ASSET_CATEGORIES = {
  cash: { label: '現金', color: '#10b981' },
  stock: { label: '股票', color: '#3b82f6' },
  fund: { label: '基金', color: '#8b5cf6' },
  realestate: { label: '不動產', color: '#f59e0b' },
  debt: { label: '負債', color: '#ef4444' }
};

const initialAssets = [
  { id: 'a1', name: '銀行存款', type: 'cash', value: 100000, currency: 'TWD', date: '2025-01-01' }
];

const initialTransactions = [
  { id: 't1', type: 'income', amount: 50000, category: '薪資', date: '2025-01-05' }
];

// --- 內置圖示組件 (排除外部依賴以防止白屏) ---
const Icon = ({ name, size = 20 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
    wallet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
  };
  return icons[name] || null;
};

// --- 圖表組件 ---
function CompositeTrendChart({ data, showAsset, showIncome, showExpense }) {
  const visibleValues = useMemo(() => {
    let vals = [0];
    if (!data || data.length === 0) return vals;
    data.forEach(d => {
      if (showAsset) vals.push(d.asset);
      if (showIncome && d.income > 0) vals.push(d.income);
      if (showExpense && d.expense > 0) vals.push(d.expense);
    });
    return vals;
  }, [data, showAsset, showIncome, showExpense]);

  if (!data || data.length < 2) {
    return <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-bold">請提供更多日期數據以產生圖表</div>;
  }

  const maxValue = Math.max(...visibleValues) * 1.1;
  const minValue = Math.min(...visibleValues) * 0.9;
  const range = maxValue - minValue || 1;

  const getY = (value) => 100 - ((value - minValue) / range) * 100;
  const getX = (index) => (index / (data.length - 1 || 1)) * 100;

  return (
    <div className="w-full flex flex-col">
      <div className="flex h-64 gap-3">
        <div className="flex-1 relative bg-white rounded-xl border border-slate-100 overflow-hidden p-2">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            {showAsset && (
              <path d={`M ${data.map((d, i) => `${getX(i)} ${getY(d.asset)}`).join(' L ')}`} fill="none" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
            )}
            <line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// --- 主要頁面組件 ---
function Dashboard({ assets, transactions, formatMoney, getTwdValue, getAccumulatedCashFlow }) {
  const [rangeType, setRangeType] = useState('month');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const trendData = useMemo(() => {
    const points = [];
    let curr = new Date(startDate);
    const end = new Date(endDate);
    const assetNames = [...new Set(assets.map(a => a.name))];

    while (curr <= end) {
      const dStr = curr.toISOString().split('T')[0];
      let snapshotsTotal = 0;
      assetNames.forEach(name => {
        const records = assets.filter(a => a.name === name && a.date <= dStr).sort((a,b) => b.date.localeCompare(a.date));
        if (records.length > 0) {
          const val = getTwdValue(records[0].value, records[0].currency);
          snapshotsTotal += (records[0].type === 'debt' ? -val : val);
        }
      });
      const accumulated = getAccumulatedCashFlow(dStr, transactions);
      points.push({ date: dStr, asset: snapshotsTotal + accumulated, income: 0, expense: 0 });
      curr.setDate(curr.getDate() + 1);
    }
    return points;
  }, [startDate, endDate, assets, transactions, getTwdValue, getAccumulatedCashFlow]);

  const currentTotal = trendData.length > 0 ? trendData[trendData.length-1].asset : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
        <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-2 opacity-70">預估淨資產 (TWD)</p>
        <h2 className="text-4xl font-black tracking-tighter">{formatMoney(currentTotal)}</h2>
      </div>
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Icon name="dashboard" /> 資產走勢</h3>
        <CompositeTrendChart data={trendData} showAsset={true} />
      </div>
    </div>
  );
}

function TransactionsManager({ transactions, setTransactions, formatMoney }) {
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    setTransactions([{ ...form, id: Date.now().toString(), amount: Number(form.amount) }, ...transactions]);
    setForm({ ...form, amount: '', category: '' });
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4">新增收支</h3>
        <form onSubmit={handleAdd} className="grid gap-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({...form, type: 'expense'})} className={`flex-1 p-2 rounded-xl text-xs font-bold ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-100'}`}>支出</button>
            <button type="button" onClick={() => setForm({...form, type: 'income'})} className={`flex-1 p-2 rounded-xl text-xs font-bold ${form.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>收入</button>
          </div>
          <input type="text" placeholder="項目" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
          <input type="number" placeholder="金額" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none font-bold" />
          <button type="submit" className="bg-slate-800 text-white p-3 rounded-xl font-bold">儲存</button>
        </form>
      </div>
      <div className="space-y-2">
        {transactions.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50">
            <span className="font-bold">{t.category}</span>
            <span className={`font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsManager({ assets, setAssets, formatMoney, usdRate }) {
  const [form, setForm] = useState({ name: '', type: 'cash', value: '', currency: 'TWD', date: new Date().toISOString().split('T')[0] });
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.value) return;
    setAssets([{ ...form, id: Date.now().toString(), value: Number(form.value) }, ...assets]);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h3 className="font-bold mb-4 text-slate-800">更新資產現況</h3>
        <form onSubmit={handleAdd} className="grid gap-3">
          <input placeholder="資產名稱" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="p-3 bg-slate-50 rounded-xl outline-none" />
          <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold">
            {Object.keys(ASSET_CATEGORIES).map(k => <option key={k} value={k}>{ASSET_CATEGORIES[k].label}</option>)}
          </select>
          <input type="number" placeholder="當前餘額" value={form.value} onChange={e=>setForm({...form, value: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-black text-emerald-600" />
          <button className="bg-emerald-600 text-white p-3 rounded-xl font-bold">更新狀態</button>
        </form>
      </div>
      {assets.map(a => (
        <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-white px-2 py-0.5 rounded inline-block mb-1" style={{backgroundColor: ASSET_CATEGORIES[a.type].color}}>{ASSET_CATEGORIES[a.type].label}</div>
            <div className="font-black text-slate-800">{a.name}</div>
          </div>
          <div className="text-right font-black text-lg">{formatMoney(a.value)}</div>
        </div>
      ))}
    </div>
  );
}

// --- App Entry Point ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usdRate, setUsdRate] = useState(32.5);
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('wealth_assets_v2');
    return saved ? JSON.parse(saved) : initialAssets;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealth_tx_v2');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  useEffect(() => {
    localStorage.setItem('wealth_assets_v2', JSON.stringify(assets));
    localStorage.setItem('wealth_tx_v2', JSON.stringify(transactions));
  }, [assets, transactions]);

  const formatMoney = (val) => `NT$ ${Math.floor(val).toLocaleString()}`;
  const getTwdValue = (val, curr) => curr === 'USD' ? val * usdRate : val;
  const getAccumulatedCashFlow = (targetDate, list) => list.filter(t => t.date <= targetDate).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 overflow-hidden h-screen">
      <nav className="fixed bottom-0 w-full bg-white border-t md:relative md:w-64 md:h-screen md:border-t-0 md:border-r flex md:flex-col z-50 shadow-2xl md:shadow-none">
        <div className="hidden md:flex p-8 items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-200">W</div>
          <span className="font-black text-xl tracking-tight">財富管家</span>
        </div>
        <div className="flex md:flex-col flex-1 justify-around md:px-4 py-2 md:py-0 md:mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col md:flex-row items-center p-3 rounded-2xl gap-1 md:gap-3 transition-all ${activeTab === 'dashboard' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400'}`}>
            <Icon name="dashboard" /> <span className="text-[10px] md:text-sm">總覽</span>
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col md:flex-row items-center p-3 rounded-2xl gap-1 md:gap-3 transition-all ${activeTab === 'transactions' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400'}`}>
            <Icon name="list" /> <span className="text-[10px] md:text-sm">記帳</span>
          </button>
          <button onClick={() => setActiveTab('assets')} className={`flex flex-col md:flex-row items-center p-3 rounded-2xl gap-1 md:gap-3 transition-all ${activeTab === 'assets' ? 'text-emerald-600 md:bg-emerald-50 font-bold' : 'text-slate-400'}`}>
            <Icon name="wallet" /> <span className="text-[10px] md:text-sm">資產</span>
          </button>
        </div>
        <div className="hidden md:block p-6 mt-auto">
          <div className="bg-slate-100 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1"><Icon name="globe" size={12}/> 美金匯率</p>
            <input type="number" value={usdRate} onChange={e=>setUsdRate(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-emerald-600 outline-none" />
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto pb-24 md:pb-12 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard assets={assets} transactions={transactions} formatMoney={formatMoney} getTwdValue={getTwdValue} getAccumulatedCashFlow={getAccumulatedCashFlow} />}
          {activeTab === 'transactions' && <TransactionsManager transactions={transactions} setTransactions={setTransactions} formatMoney={formatMoney} />}
          {activeTab === 'assets' && <AssetsManager assets={assets} setAssets={setAssets} formatMoney={formatMoney} usdRate={usdRate} />}
        </div>
      </main>
    </div>
  );
}
