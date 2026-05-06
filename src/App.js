import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, PieChart, TrendingUp, Plus, History, Trash2 
} from 'lucide-react';

export default function App() {
  // 從手機 LocalStorage 讀取資料
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('wealth_assets');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '現金/銀行', amount: 0, color: 'bg-blue-500' },
      { id: 2, name: '股票/投資', amount: 0, color: 'bg-green-500' },
      { id: 3, name: '加密貨幣', amount: 0, color: 'bg-purple-500' }
    ];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('wealth_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTrans, setNewTrans] = useState({ title: '', amount: '', type: 'expense', assetId: 1 });

  // 當資料變動時，存入手機
  useEffect(() => {
    localStorage.setItem('wealth_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('wealth_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const totalWealth = useMemo(() => 
    assets.reduce((sum, a) => sum + Number(a.amount), 0), [assets]
  );

  const addTransaction = () => {
    if (!newTrans.amount || !newTrans.title) return;
    const amount = Number(newTrans.amount);
    const trans = { ...newTrans, id: Date.now(), date: new Date().toLocaleDateString() };
    
    setTransactions([trans, ...transactions]);
    setAssets(assets.map(a => {
      if (a.id === newTrans.assetId) {
        return { ...a, amount: newTrans.type === 'income' ? Number(a.amount) + amount : Number(a.amount) - amount };
      }
      return a;
    }));
    setNewTrans({ title: '', amount: '', type: 'expense', assetId: assets[0].id });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      {/* 總覽區 */}
      <div className="bg-emerald-600 p-8 text-white rounded-b-[2.5rem] shadow-lg">
        <p className="opacity-80 text-sm font-medium">總資產淨值 (TWD)</p>
        <h1 className="text-4xl font-bold mt-2">${totalWealth.toLocaleString()}</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* 資產快照 */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-4 font-bold text-slate-700">
            <PieChart className="w-5 h-5 mr-2 text-emerald-500" /> 資產分配
          </div>
          <div className="space-y-4">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center text-slate-600">
                  <div className={`w-3 h-3 ${asset.color} rounded-full mr-3`} /> {asset.name}
                </div>
                <input
                  type="number"
                  value={asset.amount}
                  onChange={(e) => setAssets(assets.map(a => a.id === asset.id ? {...a, amount: e.target.value} : a))}
                  className="w-32 text-right font-bold text-slate-800 bg-slate-50 p-2 rounded-xl"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 快速記帳 */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-4 font-bold text-slate-700">
            <Plus className="w-5 h-5 mr-2 text-emerald-500" /> 新增紀錄
          </div>
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setNewTrans({...newTrans, type: 'expense'})}
              className={`flex-1 py-2 rounded-xl text-sm font-bold ${newTrans.type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}
            >支出</button>
            <button 
              onClick={() => setNewTrans({...newTrans, type: 'income'})}
              className={`flex-1 py-2 rounded-xl text-sm font-bold ${newTrans.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
            >收入</button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="名稱 (如：午餐)"
              value={newTrans.title}
              onChange={(e) => setNewTrans({...newTrans, title: e.target.value})}
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500 transition"
            />
            <div className="flex gap-2">
              <select 
                value={newTrans.assetId}
                onChange={(e) => setNewTrans({...newTrans, assetId: Number(e.target.value)})}
                className="bg-slate-50 p-4 rounded-2xl outline-none w-1/3 text-sm"
              >
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="金額"
                value={newTrans.amount}
                onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})}
                className="w-2/3 bg-slate-50 p-4 rounded-2xl outline-none font-bold"
              />
            </div>
            <button onClick={addTransaction} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition">紀錄交易</button>
          </div>
        </section>

        {/* 最近紀錄 */}
        <section>
          <div className="flex items-center mb-4 font-bold text-slate-700 px-1">
            <History className="w-5 h-5 mr-2 text-emerald-500" /> 最近流水
          </div>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50">
                <div>
                  <p className="font-bold text-slate-800">{t.title}</p>
                  <p className="text-xs text-slate-400">{t.date} · {assets.find(a => a.id === t.assetId)?.name}</p>
                </div>
                <p className={`font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 手機底欄 */}
      <div className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around py-4 shadow-2xl">
        <Wallet className="w-6 h-6 text-emerald-600" />
        <TrendingUp className="w-6 h-6 text-slate-300" />
        <Plus className="w-6 h-6 text-slate-300" />
        <History className="w-6 h-6 text-slate-300" />
      </div>
    </div>
  );
}
