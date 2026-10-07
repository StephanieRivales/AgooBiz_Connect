import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messagesApi } from "../api/messagesApi";
import Icon from "../components/Icon";
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
  const [conversationReady, setConversationReady] = useState(false);
  const messagesContainerRef = useRef(null);
  const activeUserRef = useRef(activeUser);
  activeUserRef.current = activeUser;

  useEffect(() => {
    let cancelled = false;
    let initialLoad = true;
    let inboxReady = false;
    const fetchInbox = async () => {
      try {
        const inboxData = await messagesApi.getInbox();
        if (cancelled) return;

        const seen = new Map();
        (Array.isArray(inboxData) ? inboxData : []).forEach((msg) => {
          if (!msg || typeof msg !== "object") return;
          const isSender = msg.senderId === user.id;
          const partner = isSender ? msg.receiver : msg.sender;
          if (!partner) return;
          const existing = seen.get(partner.id) || { partner, lastMessage: msg, unreadCount: 0 };
          if (msg.receiverId === user.id && !msg.readAt) existing.unreadCount += 1;
          if (new Date(msg.createdAt) > new Date(existing.lastMessage.createdAt)) existing.lastMessage = msg;
          existing.partner = partner;
          seen.set(partner.id, existing);
        });

        const list = Array.from(seen.values()).sort(
          (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
        setConversations(list);

        if (initialLoad) {
          if (preselectedUserId) {
            const match = list.find((c) => String(c.partner.id) === preselectedUserId);
            setActiveUser(match ? match.partner : { id: preselectedUserId, name: "New conversation" });
          } else if (list.length > 0) {
            setActiveUser(list[0].partner);
          }
          initialLoad = false;
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "We couldn't load your messages right now.");
      } finally {
        if (!cancelled && !inboxReady) {
          setLoadingInbox(false);
          inboxReady = true;
        }
      }
    };
    fetchInbox();
    const interval = window.setInterval(fetchInbox, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [preselectedUserId, user?.id]);

  useEffect(() => {
    if (!activeUser?.id) return;
    let cancelled = false;
    const fetchThread = async (initialLoad = false) => {
      if (initialLoad) {
        setLoadingThread(true);
        setConversationReady(false);
      }
      try {
        const data = await messagesApi.getConversation(activeUser.id);
        if (cancelled) return;
        const threadMessages = Array.isArray(data)
          ? data
          : Array.isArray(data?.messages)
            ? data.messages
            : [];
        const conversationPartner = Array.isArray(data)
          ? activeUserRef.current
          : data?.partner || activeUserRef.current;
        setActiveUser(conversationPartner);
        setMessages((current) => {
          const previousLastId = current[current.length - 1]?.id;
          const nextLastId = threadMessages[threadMessages.length - 1]?.id;
          return current.length === threadMessages.length && previousLastId === nextLastId
            ? current
            : threadMessages;
        });
        setConversationReady(true);
        setError("");
        setConversations((current) => current.map((conversation) =>
          conversation.partner.id === conversationPartner.id
            ? { ...conversation, unreadCount: 0 }
            : conversation
        ));
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "We couldn't load this conversation.");
      } finally {
        if (!cancelled && initialLoad) setLoadingThread(false);
      }
    };
    fetchThread(true);
    const interval = window.setInterval(() => fetchThread(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeUser?.id]);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, activeUser?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser || !conversationReady) return;

    setSending(true);
    setError("");
    try {
      const sent = await messagesApi.send(activeUser.id, newMessage.trim());
      setMessages((prev) => [...prev, sent]);

      // bump this conversation to the top of the sidebar with the new last message
      setConversations((prev) => {
        const others = prev.filter((c) => c.partner.id !== activeUser.id);
        return [{ partner: activeUser, lastMessage: sent, unreadCount: 0 }, ...others];
      });

      setNewMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Your message didn't send. Please try again.");
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
      <div className={`chat-layout ${activeUser ? "has-active-thread" : ""}`}>
        {/* Conversation list */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3 className="chat-sidebar-title">Messages</h3>
            <Link to="/people" className="chat-new-message-link"><Icon name="user-plus" size={16} /> New message</Link>
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
              {filteredConversations.map(({ partner, lastMessage, unreadCount }) => {
                const isUnread = unreadCount > 0;
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
                            {partner.role === "seller" && partner.verificationStatus === "approved" && (
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
                      {isUnread && <span className="chat-unread-count">{unreadCount}</span>}
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
                <button type="button" className="chat-back-button" onClick={() => setActiveUser(null)} aria-label="Back to conversations">
                  <Icon name="arrow-left" size={19} />
                </button>
                <span className="chat-avatar">{activeUser.name?.[0]?.toUpperCase() || "?"}</span>
                <div>
                  <h4>
                    {activeUser.name || activeUser.email || "New conversation"}
                    {activeUser.role === "seller" && activeUser.verificationStatus === "approved" && (
                      <span className="chat-verified-badge" title="Verified Seller">✓</span>
                    )}
                  </h4>
                  {activeUser.role && (
                    <span className="chat-thread-subtitle">
                      {activeUser.role === "seller" ? "Local business" : activeUser.role === "admin" ? "AgooBiz admin" : "Community member"}
                    </span>
                  )}
                </div>
              </div>

              <div className="chat-messages" ref={messagesContainerRef}>
                {loadingThread ? (
                  <p className="empty-state chat-empty-small">Loading conversation...</p>
                ) : messages.length === 0 ? (
                  <div className="chat-first-message">
                    <Icon name="message-circle" size={25} />
                    <p>Start the conversation with {activeUser.name || "this account"}.</p>
                  </div>
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
              </div>

              {error && <p className="auth-error chat-error">{error}</p>}

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder={conversationReady ? "Write a message..." : "Loading conversation..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  maxLength={4000}
                  disabled={!conversationReady}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={sending || !conversationReady || !newMessage.trim()}
                  aria-label="Send message"
                >
                  <Icon name="send" size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}