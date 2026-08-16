import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messagesApi } from "../api/messagesApi";
import "../App.css";

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedUserId = searchParams.get("user"); // e.g. /chat?user=5 from a product page

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load the inbox (list of people the user has messaged before)
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await messagesApi.getInbox();

        // Collapse raw messages into one row per conversation partner
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

  // Load the active thread whenever the selected conversation changes
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
      setNewMessage("");
    } catch (err) {
      setError("Your message didn't send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chat-page">
      <div className="chat-layout">
        {/* Conversation list */}
        <aside className="chat-sidebar">
          <h3 className="chat-sidebar-title">Messages</h3>

          {loadingInbox ? (
            <p className="empty-state chat-empty-small">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="empty-state chat-empty-small">No conversations yet.</p>
          ) : (
            <ul className="chat-conversation-list">
              {conversations.map(({ partner, lastMessage }) => (
                <li key={partner.id}>
                  <button
                    className={`chat-conversation-item ${activeUser?.id === partner.id ? "active" : ""}`}
                    onClick={() => setActiveUser(partner)}
                  >
                    <span className="chat-avatar">{partner.name?.[0]?.toUpperCase() || "?"}</span>
                    <span className="chat-conversation-info">
                      <span className="chat-conversation-name">{partner.name || partner.email}</span>
                      <span className="chat-conversation-preview">{lastMessage.content}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Active thread */}
        <div className="chat-thread">
          {!activeUser ? (
            <p className="empty-state">Select a conversation to start chatting.</p>
          ) : (
            <>
              <div className="chat-thread-header">
                <span className="chat-avatar">{activeUser.name?.[0]?.toUpperCase() || "?"}</span>
                <h4>{activeUser.name || activeUser.email || "New conversation"}</h4>
              </div>

              <div className="chat-messages">
                {loadingThread ? (
                  <p className="empty-state chat-empty-small">Loading conversation...</p>
                ) : messages.length === 0 ? (
                  <p className="empty-state chat-empty-small">Say hello 👋</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${msg.senderId === user.id ? "chat-bubble-sent" : "chat-bubble-received"}`}
                    >
                      <p>{msg.content}</p>
                      <span className="chat-bubble-time">
                        {new Date(msg.createdAt).toLocaleTimeString("en-PH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="auth-error chat-error">{error}</p>}

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="add-to-cart-btn" disabled={sending || !newMessage.trim()}>
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}