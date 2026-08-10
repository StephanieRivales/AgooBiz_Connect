import React, { useState } from 'react';
import '../App.css';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    'All',
    'Pancit',
    'Rice & Kakanin',
    'Meat Dishes',
    'Desserts',
    'Party Platters'
  ];

  return (
    <section className="home-content">
      <div className="home-main">
        <div>
          <h1>Welcome to Agoobiz Connect</h1>
          <h3>Your Home-Based Business, Now Everyone’s Marketplace</h3>
          <p>
            Discover authentic lutong bahay dishes for every celebration —
            from birthdays to fiestas, straight from local kitchens.
          </p>

          <div className="search-filter-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for pancit, kakanin, lechon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="category-filter">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
