import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "../App.css";

const questions = [
  {
    question: "How do I place an order?",
    answer: "Create an account or log in, choose a product, select any available size or flavor options, add it to your cart, and complete checkout with your delivery details.",
  },
  {
    question: "Why do I need an account to order?",
    answer: "An account lets you track your orders and gives sellers the contact and delivery details they need to prepare your purchase.",
  },
  {
    question: "Can a product have more than one celebration?",
    answer: "Yes. Sellers can list a product for multiple celebrations, such as birthdays, weddings, and fiestas. Use the celebration filters to find suitable products.",
  },
  {
    question: "How do product choices and extra prices work?",
    answer: "Sellers may offer choices such as size or flavor. Any extra price is shown with the choice and included in your cart total.",
  },
  {
    question: "When can I place an order?",
    answer: "Sellers set daily order hours on their shop. Orders can be submitted during those hours, and checkout shows the seller's hours if ordering is closed.",
  },
  {
    question: "How do I choose when my order should arrive?",
    answer: "At checkout, select a requested delivery date and time in Agoo, La Union time. The seller sees this request with the order.",
  },
  {
    question: "How can I report unsafe or abusive activity?",
    answer: "Open a seller's product page and use Report seller. Include the relevant details so the moderation team can review it.",
  },
  {
    question: "How do sellers list products?",
    answer: "Register as a seller. After the seller account is approved, use My Products to create a listing, set occasions and buyer choices, and set your daily order hours.",
  },
];

export default function FAQ() {
  return (
    <main className="faq-page">
      <header className="faq-header">
        <span className="settings-kicker"><Icon name="help" size={16} /> Help center</span>
        <h1>How can we help?</h1>
        <p>Answers for buyers, sellers, and AgooBiz Connect members.</p>
      </header>
      <section className="faq-list" aria-label="Frequently asked questions">
        {questions.map(({ question, answer }) => (
          <details className="faq-item" key={question}>
            <summary>{question}<span aria-hidden="true">+</span></summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <p className="faq-contact">Still need help? <Link to="/#contact">Contact AgooBiz Connect</Link>.</p>
    </main>
  );
}
