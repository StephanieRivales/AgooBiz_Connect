import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messagesApi } from "../api/messagesApi";
import "../App.css";

// Formats a timestamp the way Messenger does: relative for recent, dated for older.
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-PH", { weekday: "short" });
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatBubbleTime(dateString) {
  return new Date(dateString).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedUserId = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await messagesApi.getInbox();

        const seen = new Map();
        data.forEach((msg) => {
          const isSender = msg.senderId === user.id;
          const partner = isSender ? msg.receiver : msg.sender;
          if (!partner) return;
          const existing = seen.get(partner.id);
          if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) {
            seen.set(partner.id, { partner, lastMessage: msg });
          }
        });

        const list = Array.from(seen.values()).sort(
          (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
        setConversations(list);

        if (preselectedUserId) {
          const match = list.find((c) => String(c.partner.id) === preselectedUserId);
          setActiveUser(match ? match.partner : { id: preselectedUserId, name: "New conversation" });
        } else if (list.length > 0) {
          setActiveUser(list[0].partner);
        }
      } catch (err) {
        setError("We couldn't load your messages right now.");
      } finally {
        setLoadingInbox(false);
      }
    };
    fetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const fetchThread = async () => {
      setLoadingThread(true);
      try {
        const data = await messagesApi.getConversation(activeUser.id);
        setMessages(data);
      } catch (err) {
        setError("We couldn't load this conversation.");
      } finally {
        setLoadingThread(false);
      }
    };
    fetchThread();
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    setSending(true);
    try {
      const sent = await messagesApi.send(activeUser.id, newMessage.trim());
      setMessages((prev) => [...prev, sent]);

      // bump this conversation to the top of the sidebar with the new last message
      setConversations((prev) => {
        const others = prev.filter((c) => c.partner.id !== activeUser.id);
        return [{ partner: activeUser, lastMessage: sent }, ...others];
      });

      setNewMessage("");
    } catch (err) {
      setError("Your message didn't send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!sidebarSearch.trim()) return conversations;
    return conversations.filter(({ partner }) =>
      (partner.name || partner.email || "").toLowerCase().includes(sidebarSearch.toLowerCase())
    );
  }, [conversations, sidebarSearch]);

  return (
    <section className="chat-page">
      <div className="chat-layout">
        {/* Conversation list */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3 className="chat-sidebar-title">Messages</h3>
          </div>

          <div className="chat-sidebar-search">
            <input
              type="text"
              placeholder="Search conversations..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
            />
          </div>

          {loadingInbox ? (
            <p className="empty-state chat-empty-small">Loading...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="empty-state chat-empty-small">
              {conversations.length === 0 ? "No conversations yet." : "No matches found."}
            </p>
          ) : (
            <ul className="chat-conversation-list">
              {filteredConversations.map(({ partner, lastMessage }) => {
                const isUnread = lastMessage.senderId !== user.id && !lastMessage.read;
                return (
                  <li key={partner.id}>
                    <button
                      className={`chat-conversation-item ${activeUser?.id === partner.id ? "active" : ""}`}
                      onClick={() => setActiveUser(partner)}
                    >
                      <span className="chat-avatar">{partner.name?.[0]?.toUpperCase() || "?"}</span>
                      <span className="chat-conversation-info">
                        <span className="chat-conversation-top-row">
                          <span className="chat-conversation-name">
                            {partner.name || partner.email}
                            {partner.role === "seller" && partner.verified && (
                              <span className="chat-verified-badge" title="Verified Seller">✓</span>
                            )}
                          </span>
                          <span className="chat-conversation-time">
                            {formatTime(lastMessage.createdAt)}
                          </span>
                        </span>
                        <span className={`chat-conversation-preview ${isUnread ? "unread" : ""}`}>
                          {lastMessage.senderId === user.id ? "You: " : ""}
                          {lastMessage.content}
                        </span>
                      </span>
                      {isUnread && <span className="chat-unread-dot" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Active thread */}
        <div className="chat-thread">
          {!activeUser ? (
            <div className="chat-thread-empty">
              <p className="empty-state">Select a conversation to start chatting.</p>
            </div>
          ) : (
            <>
              <div className="chat-thread-header">
                <span className="chat-avatar">{activeUser.name?.[0]?.toUpperCase() || "?"}</span>
                <div>
                  <h4>
                    {activeUser.name || activeUser.email || "New conversation"}
                    {activeUser.role === "seller" && activeUser.verified && (
                      <span className="chat-verified-badge" title="Verified Seller">✓</span>
                    )}
                  </h4>
                  {activeUser.role && (
                    <span className="chat-thread-subtitle">
                      {activeUser.role === "seller" ? "Seller" : "Buyer"}
                    </span>
                  )}
                </div>
              </div>

              <div className="chat-messages">
                {loadingThread ? (
                  <p className="empty-state chat-empty-small">Loading conversation...</p>
                ) : messages.length === 0 ? (
                  <p className="empty-state chat-empty-small">Say hello 👋</p>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderId === user.id;
                    const showTail =
                      i === messages.length - 1 || messages[i + 1]?.senderId !== msg.senderId;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-row ${isMine ? "sent" : "received"}`}
                      >
                        <div className={`chat-bubble ${isMine ? "chat-bubble-sent" : "chat-bubble-received"} ${showTail ? "with-tail" : ""}`}>
                          <p>{msg.content}</p>
                        </div>
                        {showTail && (
                          <span className="chat-bubble-time">{formatBubbleTime(msg.createdAt)}</span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="auth-error chat-error">{error}</p>}

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Aa"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={sending || !newMessage.trim()}
                  aria-label="Send message"
                >
                  ➤
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}