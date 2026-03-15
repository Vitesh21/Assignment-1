import React, { useState } from 'react';
import { searchCustomers, createCustomer } from '../api';

function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const searchTimeout = React.useRef(null);

  const handleSearch = (value) => {
    setQuery(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.trim().length > 0) {
      setLoading(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const data = await searchCustomers(value);
          setResults(data);
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to search customers' });
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    const result = await createCustomer({
      name: newName,
      email: newEmail,
      phone: newPhone,
    });

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `Customer "${result.name}" added!` });
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setShowAdd(false);
      // Refresh search
      if (query) handleSearch(query);
    }
  };

  return (
    <div className="customer-search">
      <h2>Customer Search</h2>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <input
        className="search-input"
        type="text"
        placeholder="Search customers by name..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div style={{ marginBottom: '1rem' }}>
        <button
          className="submit-btn"
          style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </div>
          <button className="submit-btn" onClick={handleAddCustomer}>Save Customer</button>
        </div>
      )}

      {results.length > 0 ? (
        results.map((customer, idx) => (
          <div className="customer-card" key={idx}>
            <h3>{customer.name}</h3>
            <p>{customer.email} • {customer.phone}</p>
          </div>
        ))
      ) : (
        query.length > 0 && <p style={{ color: '#999' }}>No customers found.</p>
      )}
    </div>
  );
}

export default CustomerSearch;
