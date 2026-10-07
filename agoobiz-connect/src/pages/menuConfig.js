export const menus = {
  guest: [
    {
      title: "Explore",
      items: [
        { label: "Discover local businesses", path: "/shop", icon: "store" },
        { label: "Browse products", path: "/products", icon: "package" },
        { label: "Community analytics", path: "/analytics", icon: "chart" },
        { label: "Help & FAQ", path: "/faq", icon: "help" },
      ],
    },
    {
      title: "Get started",
      items: [
        { label: "Log in", path: "/login", icon: "key" },
        { label: "Create an account", path: "/register", icon: "user-plus" },
      ],
    },
  ],
  buyer: [
    {
      title: "Discover",
      items: [
        { label: "Local businesses", path: "/shop", icon: "store" },
        { label: "Browse products", path: "/products", icon: "package" },
        { label: "Community analytics", path: "/analytics", icon: "chart" },
      ],
    },
    {
      title: "Your account",
      items: [
        { label: "My dashboard", path: "/buyer-dashboard", icon: "layout-dashboard" },
        { label: "Shopping cart", path: "/cart", icon: "shopping-cart", showCartCount: true },
        { label: "My orders", path: "/my-orders", icon: "receipt" },
        { label: "People & following", path: "/people", icon: "users" },
        { label: "Messages", path: "/chat", icon: "message-circle" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Settings", path: "/settings", icon: "settings" },
        { label: "Help & FAQ", path: "/faq", icon: "help" },
      ],
    },
    {
      title: "Sign out",
      items: [{ label: "Log out", path: "/logout", icon: "log-out", danger: true }],
    },
  ],
  seller: [
    {
      title: "Business",
      items: [
        { label: "Dashboard", path: "/seller-dashboard", icon: "layout-dashboard" },
        { label: "My products", path: "/my-products", icon: "utensils" },
        { label: "Orders", path: "/orders", icon: "receipt" },
        { label: "Analytics", path: "/analytics", icon: "chart" },
      ],
    },
    {
      title: "Explore & connect",
      items: [
        { label: "Discover businesses", path: "/shop", icon: "store" },
        { label: "Browse products", path: "/products", icon: "package" },
        { label: "People & following", path: "/people", icon: "users" },
        { label: "Messages", path: "/chat", icon: "message-circle" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Settings", path: "/settings", icon: "settings" },
        { label: "Help & FAQ", path: "/faq", icon: "help" },
      ],
    },
    {
      title: "Sign out",
      items: [{ label: "Log out", path: "/logout", icon: "log-out", danger: true }],
    },
  ],
  admin: [
    {
      title: "Administration",
      items: [
        { label: "Admin dashboard", path: "/admin-dashboard", icon: "shield" },
        { label: "Manage users", path: "/admin/users", icon: "users" },
        { label: "User reports", path: "/admin/reports", icon: "alert" },
        { label: "Platform analytics", path: "/analytics", icon: "chart" },
        { label: "People & following", path: "/people", icon: "users" },
      ],
    },
    {
      title: "Marketplace",
      items: [
        { label: "Discover businesses", path: "/shop", icon: "store" },
        { label: "Messages", path: "/chat", icon: "message-circle" },
      ],
    },
    {
      title: "Support & account",
      items: [
        { label: "Settings", path: "/settings", icon: "settings" },
        { label: "Help & FAQ", path: "/faq", icon: "help" },
        { label: "Log out", path: "/logout", icon: "log-out", danger: true },
      ],
    },
  ],
};