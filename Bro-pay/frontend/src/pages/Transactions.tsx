import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowLeft, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import '../styles/transactions.css';

interface Transaction {
  id: number;
  name: string;
  type: string;
  amount: number;
  date: string;
}

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.transactions.list({ search, type: typeFilter === 'all' ? undefined : typeFilter, sort: sortBy, page: currentPage, limit: itemsPerPage });
        setAllTransactions(data.transactions);
      } catch (_err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [search, typeFilter, sortBy, currentPage]);

  useEffect(() => {
    let result = [...allTransactions];

    // Search
    if (search) {
      result = result.filter(tx => 
        tx.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type Filter
    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.id - a.id;
      if (sortBy === 'date-asc') return a.id - b.id;
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    setFilteredTransactions(result);
    setCurrentPage(1);
  }, [search, typeFilter, sortBy, allTransactions]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
      </div>

      <div className="transactions-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="toolbar-actions">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Recipient / Sender</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan={3}>
                    <div className="skeleton-box skeleton-text-box" style={{ height: 40, width: '100%' }}></div>
                  </td>
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map(tx => (
                <tr key={tx.id} onClick={() => navigate(`/transactions/${tx.id}`)}>
                  <td>
                    <div className="tx-user">
                      <div className={`tx-icon ${tx.type}`}>
                        {tx.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span>{tx.name}</span>
                    </div>
                  </td>
                  <td className="date-cell">{tx.date}</td>
                  <td className={`amount-cell ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>
                  <EmptyState 
                    icon={<Search size={32} />}
                    title="No transactions found"
                    description="Try adjusting your search or filter criteria."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            <ArrowLeft size={18} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
