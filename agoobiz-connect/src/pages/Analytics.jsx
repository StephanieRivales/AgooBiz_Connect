import { useState, useEffect } from "react";
import { reportsApi } from "../api/reportsApi";
import "../App.css";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [summaryData, trendData, categoryData, sellerData, barangayData] = await Promise.all([
          reportsApi.getPublicSummary(),
          reportsApi.getWeeklyTrend(),
          reportsApi.getCategoryDemand(),
          reportsApi.getTopSellers(),
          reportsApi.getBarangayDemand(),
        ]);
        setSummary(summaryData);
        setTrend(trendData);
        setCategories(categoryData);
        setTopSellers(sellerData);
        setBarangays(barangayData);
      } catch (err) {
        setError("We couldn't load the analytics right now. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <section className="analytics-page">
        <p className="empty-state">Loading demand analytics...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="analytics-page">
        <p className="empty-state">{error}</p>
      </section>
    );
  }

  const maxOrders = Math.max(...trend.map((t) => t.orderCount), 1);
  const maxCategoryOrders = Math.max(...categories.map((c) => c.orders), 1);

  return (
    <section className="analytics-page">
      <div className="analytics-header">
        <span className="analytics-label">Demand Analytics</span>
        <h1>
          What Agoo is <span className="hero-accent">craving</span> this week
        </h1>
        {summary && (
          <span className="analytics-updated">
            Updated: {new Date(summary.updatedAt).toLocaleDateString("en-PH", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="analytics-grid">
        {/* Trend chart panel */}
        <div className="analytics-panel analytics-panel-dark">
          <h3>Total Orders — Past 7 Days</h3>

          <div className="trend-chart">
            {trend.map((day) => (
              <div className="trend-bar-col" key={day.date}>
                <span className="trend-value">{day.orderCount}</span>
                <div
                  className="trend-bar"
                  style={{ height: `${(day.orderCount / maxOrders) * 100}%` }}
                />
                <span className="trend-day">{day.dayLabel}</span>
              </div>
            ))}
          </div>

          {summary && (
            <div className="analytics-stat-row">
              <div>
                <strong>{summary.ordersThisWeek}</strong>
                <span>Today</span>
              </div>
              <div>
                <strong className={summary.wowGrowth >= 0 ? "positive" : "negative"}>
                  {summary.wowGrowth >= 0 ? "+" : ""}{summary.wowGrowth}%
                </strong>
                <span>WoW Growth</span>
              </div>
              <div>
                <strong>{summary.activeSellers}</strong>
                <span>Active Sellers</span>
              </div>
            </div>
          )}
        </div>

        {/* Category demand panel */}
        <div className="analytics-panel">
          <h3>Category Demand</h3>
          {categories.length === 0 ? (
            <p className="empty-state chat-empty-small">No orders yet this week.</p>
          ) : (
            <div className="category-demand-list">
              {categories.map((cat) => (
                <div className="category-demand-row" key={cat.category}>
                  <div className="category-demand-top">
                    <span>{cat.category}</span>
                    <span>
                      <span className={cat.growthPct >= 0 ? "positive" : "negative"}>
                        {cat.growthPct >= 0 ? "+" : ""}{cat.growthPct}%
                      </span>{" "}
                      {cat.orders}
                    </span>
                  </div>
                  <div className="category-demand-bar-track">
                    <div
                      className="category-demand-bar-fill"
                      style={{ width: `${(cat.orders / maxCategoryOrders) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top sellers */}
      <h3 className="analytics-section-title">Top Sellers This Week</h3>
      {topSellers.length === 0 ? (
        <p className="empty-state chat-empty-small">No seller activity yet this week.</p>
      ) : (
        <div className="top-sellers-grid">
          {topSellers.map((seller) => (
            <div className="top-seller-card" key={seller.sellerId}>
              <span className="top-seller-name">{seller.name}</span>
              <span className="top-seller-orders">{seller.orders} orders (7d)</span>
            </div>
          ))}
        </div>
      )}

      {/* Demand by barangay */}
      <h3 className="analytics-section-title">Demand by Barangay — Today</h3>
      {barangays.length === 0 ? (
        <p className="empty-state chat-empty-small">No orders placed yet today.</p>
      ) : (
        <div className="barangay-grid">
          {barangays.map((b) => (
            <div className="barangay-card" key={b.barangay}>
              <strong>{b.orders}</strong>
              <span>{b.barangay}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}