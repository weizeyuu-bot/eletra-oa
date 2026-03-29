import React, { useState, useEffect } from 'react';
import { expenseService } from '../services';
import { Expense } from '../types';

export const ExpenseDemo: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: '饭费',
    description: '',
  });

  // 获取费用列表
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('获取费用列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 创建费用
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseService.create({
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
      });
      setNewExpense({ title: '', amount: 0, category: '饭费', description: '' });
      loadExpenses(); // 刷新列表
    } catch (err) {
      setError('创建费用失败');
      console.error(err);
    }
  };

  // 删除费用
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('确定删除吗？')) return;
    try {
      await expenseService.delete(id);
      loadExpenses();
    } catch (err) {
      setError('删除费用失败');
      console.error(err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>💰 费用管理演示</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* 创建费用表单 */}
      <div style={{ background: '#f5f5f5', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h3>新建费用</h3>
        <form onSubmit={handleCreateExpense} style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder="费用标题"
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            required
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder="金额"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
            required
            step="0.01"
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="饭费">饭费</option>
            <option value="交通">交通</option>
            <option value="住宿">住宿</option>
            <option value="其他">其他</option>
          </select>
          <textarea
            placeholder="описание（可选）"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '提交中...' : '提交费用'}
          </button>
        </form>
      </div>

      {/* 费用列表 */}
      <div>
        <h3>费用列表 ({expenses.length})</h3>
        {loading ? (
          <p>加载中...</p>
        ) : expenses.length === 0 ? (
          <p>暂无费用记录</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid #ddd',
              }}
            >
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>标题</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>金额</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>分类</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>状态</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>创建时间</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{expense.title}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                      ¥{expense.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{expense.category}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background:
                            expense.status === 'APPROVED'
                              ? '#d4edda'
                              : expense.status === 'REJECTED'
                                ? '#f8d7da'
                                : '#dadfea',
                          color:
                            expense.status === 'APPROVED'
                              ? '#155724'
                              : expense.status === 'REJECTED'
                                ? '#721c24'
                                : '#004085',
                        }}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{
                          padding: '4px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDemo;
