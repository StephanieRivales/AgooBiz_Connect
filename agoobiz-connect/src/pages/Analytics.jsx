import { useState, useEffect } from "react";
import { reportsApi } from "../api/reportsApi";
import "../App.css";

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function unwrapObject(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    return data.data;
  }
  return data;
}

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
        const [summaryData, trendData, categoryData, sellerData, barangayData] =
          await Promise.all([
            reportsApi.getPublicSummary(),
            reportsApi.getWeeklyTrend(),
            reportsApi.getCategoryDemand(),
            reportsApi.getTopSellers(),
            reportsApi.getBarangayDemand(),
          ]);

        setSummary(unwrapObject(summaryData));
        setTrend(unwrap(trendData));
        setCategories(unwrap(categoryData));
        setTopSellers(unwrap(sellerData));
        setBarangays(unwrap(barangayData));
      } catch (err) {
        setError("We couldn't load the analytics right now. Please try again.");
        setTrend([]);
        setCategories([]);
        setTopSellers([]);
        setBarangays([]);
        setSummary(null);
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

  const trendList = Array.isArray(trend) ? trend : [];
  const categoryList = Array.isArray(categories) ? categories : [];
  const sellerList = Array.isArray(topSellers) ? topSellers : [];
  const barangayList = Array.isArray(barangays) ? barangays : [];

  const maxOrders = Math.max(
    ...trendList.map((t) => Number(t.orderCount) || 0),
    1
  );
  const maxCategoryOrders = Math.max(
    ...categoryList.map((c) => Number(c.orders) || 0),
    1
  );

  return (
    <section className="analytics-page">
      <div className="analytics-header">
        <span className="analytics-label">Demand Analytics</span>
        <h1>
          What Agoo is <span className="hero-accent">craving</span> this week
        </h1>
        {summary?.updatedAt && (
          <span className="analytics-updated">
            Updated:{" "}
            {new Date(summary.updatedAt).toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel analytics-panel-dark">
          <h3>Total Orders — Past 7 Days</h3>

          {trendList.length === 0 ? (
            <p className="empty-state chat-empty-small">No order data yet.</p>
          ) : (
            <div className="trend-chart">
              {trendList.map((day) => (
                <div className="trend-bar-col" key={day.date || day.dayLabel}>
                  <span className="trend-value">{day.orderCount ?? 0}</span>
                  <div
                    className="trend-bar"
                    style={{
                      height: `${((Number(day.orderCount) || 0) / maxOrders) * 100}%`,
                    }}
                  />
                  <span className="trend-day">{day.dayLabel || day.date}</span>
                </div>
              ))}
            </div>
          )}

          {summary && (
            <div className="analytics-stat-row">
              <div>
                <strong>{summary.ordersThisWeek ?? 0}</strong>
                <span>This week</span>
              </div>
              <div>
                <strong
                  className={
                    (summary.wowGrowth ?? 0) >= 0 ? "positive" : "negative"
                  }
                >
                  {(summary.wowGrowth ?? 0) >= 0 ? "+" : ""}
                  {summary.wowGrowth ?? 0}%
                </strong>
                <span>WoW Growth</span>
              </div>
              <div>
                <strong>{summary.activeSellers ?? 0}</strong>
                <span>Active Sellers</span>
              </div>
            </div>
          )}
        </div>

        <div className="analytics-panel">
          <h3>Category Demand</h3>
          {categoryList.length === 0 ? (
            <p className="empty-state chat-empty-small">
              No orders yet this week.
            </p>
          ) : (
            <div className="category-demand-list">
              {categoryList.map((cat) => (
                <div className="category-demand-row" key={cat.category}>
                  <div className="category-demand-top">
                    <span>{cat.category}</span>
                    <span>
                      <span
                        className={
                          (cat.growthPct ?? 0) >= 0 ? "positive" : "negative"
                        }
                      >
                        {(cat.growthPct ?? 0) >= 0 ? "+" : ""}
                        {cat.growthPct ?? 0}%
                      </span>{" "}
                      {cat.orders ?? 0}
                    </span>
                  </div>
                  <div className="category-demand-bar-track">
                    <div
                      className="category-demand-bar-fill"
                      style={{
                        width: `${((Number(cat.orders) || 0) / maxCategoryOrders) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 className="analytics-section-title">Top Sellers This Week</h3>
      {sellerList.length === 0 ? (
        <p className="empty-state chat-empty-small">
          No seller activity yet this week.
        </p>
      ) : (
        <div className="top-sellers-grid">
          {sellerList.map((seller) => (
            <div
              className="top-seller-card"
              key={seller.sellerId || seller.name}
            >
              <span className="top-seller-name">{seller.name}</span>
              <span className="top-seller-orders">
                {seller.orders ?? 0} orders (7d)
              </span>
            </div>
          ))}
        </div>
      )}

      <h3 className="analytics-section-title">Demand by Barangay</h3>
      {barangayList.length === 0 ? (
        <p className="empty-state chat-empty-small">No orders placed yet.</p>
      ) : (
        <div className="barangay-grid">
          {barangayList.map((b) => (
            <div className="barangay-card" key={b.barangay}>
              <strong>{b.orders ?? 0}</strong>
              <span>{b.barangay}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}