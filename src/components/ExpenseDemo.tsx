import React, { useState, useEffect } from 'react';
import { expenseService } from '../services';
import { Expense } from '../types';
import { useI18n } from '../i18n';

const EXPENSE_CATEGORY_MEALS = '\u996d\u8d39';
const EXPENSE_CATEGORY_TRANSPORT = '\u4ea4\u901a';
const EXPENSE_CATEGORY_ACCOMMODATION = '\u4f4f\u5bbf';
const EXPENSE_CATEGORY_OTHER = '\u5176\u4ed6';

export const ExpenseDemo: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: EXPENSE_CATEGORY_MEALS,
    description: '',
  });

  // Load expense list
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(t('expenseFetchFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseService.create({
        title: newExpense.title,
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description,
      });
      setNewExpense({ title: '', amount: 0, category: EXPENSE_CATEGORY_MEALS, description: '' });
      loadExpenses(); // Refresh list
    } catch (err) {
      setError(t('expenseCreateFailed'));
      console.error(err);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm(t('expenseDeleteConfirm'))) return;
    try {
      await expenseService.delete(id);
      loadExpenses();
    } catch (err) {
      setError(t('expenseDeleteFailed'));
      console.error(err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>{t('expenseHeader')}</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Create expense form */}
      <div style={{ background: '#f5f5f5', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h3>{t('expenseNew')}</h3>
        <form onSubmit={handleCreateExpense} style={{ display: 'grid', gap: '10px' }}>
          <input
            type="text"
            placeholder={t('expenseTitlePlaceholder')}
            value={newExpense.title}
            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
            required
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder={t('expenseAmountPlaceholder')}
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
            <option value={EXPENSE_CATEGORY_MEALS}>{t('expenseCategoryMeals')}</option>
            <option value={EXPENSE_CATEGORY_TRANSPORT}>{t('expenseCategoryTransport')}</option>
            <option value={EXPENSE_CATEGORY_ACCOMMODATION}>{t('expenseCategoryAccommodation')}</option>
            <option value={EXPENSE_CATEGORY_OTHER}>{t('expenseCategoryOther')}</option>
          </select>
          <textarea
            placeholder={t('expenseDescriptionPlaceholder')}
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
            {loading ? t('expenseSubmitting') : t('expenseSubmit')}
          </button>
        </form>
      </div>

      {/* Expense list */}
      <div>
        <h3>{t('expenseTableTitle')} ({expenses.length})</h3>
        {loading ? (
          <p>{t('expenseLoading')}</p>
        ) : expenses.length === 0 ? (
          <p>{t('expenseNoRecords')}</p>
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
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{t('expenseTableTitle')}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{t('expenseTableAmount')}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('expenseTableCategory')}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('expenseTableStatus')}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('expenseTableCreatedAt')}</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>{t('expenseTableActions')}</th>
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
                        {t('expenseDelete')}
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
