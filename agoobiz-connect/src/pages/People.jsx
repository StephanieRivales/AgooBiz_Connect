import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/usersApi";
import Icon from "../components/Icon";
import "../App.css";
import "../styles/people.css";

function accountLoadMessage(error, feature) {
  if (error?.response?.status === 404) {
    return `${feature} isn't available on the connected server. Restart the AgooBiz backend and try again.`;
  }
  if (error?.response?.status === 401) {
    return "Your session has expired. Please log in again to load accounts.";
  }
  if (error?.response?.status === 403) {
    return error.response?.data?.message || "Your account can't access this feature.";
  }
  return error?.response?.data?.message || `We couldn't load ${feature.toLowerCase()}. Please try again.`;
}

export default function People() {
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [loading, setLoading] = useState(true);
  const [discoverError, setDiscoverError] = useState("");
  const [followingError, setFollowingError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  const loadPeople = useCallback(async (query = "") => {
    setLoading(true);
    const [discovery, follows] = await Promise.allSettled([
      usersApi.discover(query),
      usersApi.getFollowing(),
    ]);

    if (discovery.status === "fulfilled") {
      setPeople(Array.isArray(discovery.value) ? discovery.value : []);
      setDiscoverError("");
    } else {
      setDiscoverError(accountLoadMessage(discovery.reason, "Account discovery"));
    }

    if (follows.status === "fulfilled") {
      setFollowing(Array.isArray(follows.value) ? follows.value : []);
      setFollowingError("");
    } else {
      setFollowingError(accountLoadMessage(follows.reason, "Following"));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const changeFollow = async (person) => {
    setWorkingId(person.id);
    try {
      if (person.isFollowing) {
        await usersApi.unfollow(person.id);
      } else {
        await usersApi.follow(person.id);
      }
      await loadPeople(search);
    } catch (err) {
      if (activeTab === "following") {
        setFollowingError(err.response?.data?.message || "We couldn't update who you follow.");
      } else {
        setDiscoverError(err.response?.data?.message || "We couldn't update who you follow.");
      }
    } finally {
      setWorkingId(null);
    }
  };

  const followedIds = new Set(following.map((person) => Number(person.id)));
  const activeError = activeTab === "following" ? followingError : discoverError;
  const visiblePeople = activeTab === "following"
    ? following.filter((person) => person.name.toLowerCase().includes(search.toLowerCase()))
    : people;

  const submitSearch = (event) => {
    event.preventDefault();
    if (activeTab === "discover") loadPeople(search.trim());
  };

  return (
    <main className="people-page">
      <header className="people-header">
        <div>
          <span className="people-eyebrow"><Icon name="users" size={16} /> AgooBiz community</span>
          <h1>People</h1>
          <p>Discover local buyers and businesses, follow accounts you like, and start a conversation.</p>
        </div>
        <Link className="people-inbox-link" to="/chat"><Icon name="message-circle" size={17} /> Open messages</Link>
      </header>

      <div className="people-toolbar">
        <div className="people-tabs" role="tablist" aria-label="People">
          <button type="button" role="tab" aria-selected={activeTab === "discover"} className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}>
            Discover
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "following"} className={activeTab === "following" ? "active" : ""} onClick={() => setActiveTab("following")}>
            Following <span>{following.length}</span>
          </button>
        </div>
        <form className="people-search" onSubmit={submitSearch}>
          <label className="sr-only" htmlFor="people-search">Search people</label>
          <input id="people-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name..." />
          <button type="submit" aria-label="Search people"><Icon name="search" size={18} /></button>
        </form>
      </div>

      {activeError && (
        <div className="people-error" role="alert">
          <p>{activeError}</p>
          <button type="button" onClick={() => loadPeople(search.trim())} disabled={loading}>
            {loading ? "Loading..." : "Try again"}
          </button>
        </div>
      )}
      {loading ? (
        <p className="people-empty">Loading people...</p>
      ) : activeError && visiblePeople.length === 0 ? (
        <section className="people-empty">
          <Icon name="alert" size={28} />
          <h2>Accounts couldn't be loaded</h2>
          <p>Use the retry button above after the server is available.</p>
        </section>
      ) : visiblePeople.length === 0 ? (
        <section className="people-empty">
          <Icon name="users" size={28} />
          <h2>{activeTab === "following" ? "You aren't following anyone yet" : "No accounts found"}</h2>
          <p>{activeTab === "following" ? "Discover an account and follow it to find it here." : "Try another name or check back later."}</p>
        </section>
      ) : (
        <section className="people-grid" aria-label={activeTab === "following" ? "Accounts you follow" : "Discover accounts"}>
          {visiblePeople.map((person) => {
            const isFollowing = activeTab === "following" || followedIds.has(Number(person.id)) || person.isFollowing;
            return (
              <article className="person-card" key={person.id}>
                <div className="person-card-main">
                  <span className="person-avatar" aria-hidden="true">{person.name?.trim()?.[0]?.toUpperCase() || "?"}</span>
                  <div className="person-identity">
                    <h2>{person.name}</h2>
                    <span className="person-role">{person.role === "seller" ? "Local business" : person.role === "admin" ? "AgooBiz admin" : "Community member"}</span>
                    {person.barangay && <span className="person-location">{person.barangay}, Agoo</span>}
                  </div>
                </div>
                <div className="person-actions">
                  <button type="button" className={`person-follow-button ${isFollowing ? "following" : ""}`} disabled={workingId === person.id} onClick={() => changeFollow({ ...person, isFollowing })}>
                    <Icon name={isFollowing ? "check" : "user-plus"} size={16} />
                    {workingId === person.id ? "Saving..." : isFollowing ? "Following" : "Follow"}
                  </button>
                  <Link className="person-message-button" to={`/chat?user=${person.id}`}>
                    <Icon name="message-circle" size={16} /> Message
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
