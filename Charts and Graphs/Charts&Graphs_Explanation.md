# **01\. Data Flow Diagram (DFD)**

## DFD Level 0

This is the highest-level view, treating the entire system as a single process ("AgooBiz Connect System") with no internal detail shown. It establishes the system's boundary and its interactions with the outside world.

**External Entities:**

1. **Guest –** unauthenticated visitors
2. **Customer –** registered buyers
3. **Sellers –** vendors on the platform
4. **Admin –** system administrators

**Key data flows:**

- **Guest ↔ System:** sends Product Search, receives Product Details
- **Customer ↔ System:** sends Payment Details, Order Details, Login Credentials; receives Product List, Order Status, Payment Confirmation
- **Sellers ↔ System:** sends Product Uploads, Registration Info, Sales Report (as output back); receives Order Notification
- **Admin ↔ System:** sends Manage Users, Seller Application (approval decisions); receives User Reports, Approved/Reject Seller data

## DFD Level 1

This decomposes the single Level 0 process into its major sub-processes, revealing the core functional modules of the system, plus the data stores (databases) each one uses.

**Processes (numbered 1.0–6.0):**

|  | **Process** | **Data Store** | **Purpose** |
| --- | --- | --- | --- |
| 1.0 | User Management | User DB | Handles login, registration, user approval |
| 2.0 | Product Management | Products DB | Handles product uploads, search, listings |
| 3.0 | Order Management | Order DB | Handles order placement, updates, notifications |
| 4.0 | Payment Management | Payment DB | Handles payment processing and confirmation |
| 5.0 | Notification and Communication | Messages DB | Handles messaging and notifications between users |
| 6.0 | Review and Analytics | Review & Report DB | Handles reviews, sales reports, system reports |

**How the entities connect to these processes:**

- **Admin** connects to User Management (manage users, approve/reject sellers) and to Review and Analytics (view sales report)
- **Seller** connects to User Management (registration), Product Management (product upload), Order Management (order notifications, updates), and Review and Analytics (view/reply to reviews)
- **Customer** connects to nearly all processes: login (1.0), searching/browsing products (2.0), placing orders (3.0), making payments (4.0), sending messages (5.0), writing reviews (6.0)
- **Guest** connects only to Product Management (search/view products) , reflecting limited guest access

## DFD Level 2

This is the most detailed diagram, further decomposing each Level-1 process into its individual sub-functions. This is where each business function is broken down to its atomic operations.

**Breakdown of each process:**

| **Process** | **Sub-processes** |
| --- | --- |
| 1.0 User Management | 1.1 Register Account · 1.2 Login & Authentication · 1.3 Approve/Reject Seller · 1.4 Manage Users |
| 2.0 Product Management | 2.1 Search/Browse Product · 2.2 View Product Details · 2.3 Add/Update Product · 2.4 Delete Product |
| 3.0 Order Management | 3.1 Place Order · 3.2 Update Order Status · 3.3 View Order |
| 4.0 Payment Management | 4.1 Process Payment · 4.2 View Payment History |
| 5.0 Notification and Communication | 5.1 Send Message · 5.2 View Message · 5.3 Generate Notification · 5.4 View Notification |
| 6.0 Review and Analytics | 6.1 Submit Review · 6.2 View Reviews · 6.3 Generate Sales Report · Generate System Report |

The core structure (entities, main processes 1.0–6.0, and data stores) remains identical to Level 1 - Level 2 simply explodes each bubble into its component operations, showing exactly what actions occur within each functional area.

# **02\. Structure Chart**

This is a structure chart, showing how the overall system "AGOOBIZ CONNECT" is broken down into modules and sub-modules, along with the data/control flowing between them. It follows a top-down, hierarchical decomposition typical of functional decomposition diagrams.

At the top is the root module, AGOOBIZ CONNECT, which branches into four major subsystems, each representing a distinct type of user or function within the system:

1. Guest Management
2. Customer Management
3. Seller Management
4. Admin Management

Each branch is connected to the root by a line with an arrow pointing upward into the parent module and a small circle at the branch point, this circle indicates that data is being passed back up to the parent module (a common structure-chart convention: filled circles = data flow, unfilled/open circles = data flow without further detail, arrows show direction).

## 1. Guest Management Branch

- **Manage Guest** is the module handling unauthenticated/guest users.
- It passes Guest Details down to three lower-level modules:
    - View Product
    - Product Details
    - Search Product

This represents the basic browsing capabilities available to a guest (someone not logged in) — they can view products, see product details, and search for products.

## 2. Customer Management Branch

Manage Customer handles registered/logged-in customers, passing Customer Details upward to the root via "Customer Management."

It receives/passes Customer Details down to five sub-modules:

- Register/Login (needs User Credentials)
- Place Order (handles Order Data)
- Make Payment (handles Payment Details)
- Order Status (handles Status Request)
- View Product (handles Product Data)

This branch covers the full customer transactional workflow: from authentication to browsing, ordering, paying, and tracking order status.

## 3. Seller Management Branch

Manage Seller connects to the root via "Seller Management." It passes Business Registration data down to Register Business.

Register Business then passes Business System data down to four modules:

- Upload Product (Product Details)
- View Seller (Sales Report)
- Manage Order (Order Updates)
- View Product (Seller Data)

This branch represents seller-side functionality: registering a business, uploading products, viewing sales reports, and managing/fulfilling orders.

## 4. Admin Management Branch

Manage Admin connects to the root via "Admin Management." It passes Users Management data down to Manage Users.

Manage Users then branches into four modules:

- Handle Reports (Report Data)
- Approve/Reject Seller (Approval Status)
- Generate Reports (Reports)

This branch represents administrative oversight: managing user accounts, handling reports, approving or rejecting seller applications, and generating system reports.

# **03\. HIPO Diagram**

A HIPO diagram (Hierarchy plus Input-Process-Output) is a design tool that combines two views of a system: a hierarchy chart showing the breakdown of the system into functional modules, and IPO (Input-Process-Output) tables for each module, detailing what goes in, what happens, and what comes out.

In this chart, the top-level module is AGOOBIZ CONNECT, and it branches into a set of numbered modules organized in a clear Input → Process → Output pattern, repeated for each of the four user roles (Admin, Seller, Customer, Guest).

## Structure Pattern

Notice the numbering follows this logic:

- **1.x =** Input modules (data going INTO the system from each user type)
- **2.x =** Process modules (what the system DOES with that data)
- **3.x =** Output modules (data returned/displayed BACK to each user type)

## Input Modules (1.x)

| **Module** | **Role** | **Sample Inputs** |
| --- | --- | --- |
| 1.0 Input Admin | Admin | User's Data, Seller Application, Reports, Announcements |
| 1.1 Input Seller | Seller | Registration Details, Business Profile, Product Information, Order Updates |
| 1.2 Input Customer | Customer | Register/Login Details, Search Keywords, Order & Payment Details, Reviews/Messages |
| 1.3 Input Guest | Guest | Search Keywords, Product Selection |

## Process Modules (2.x)

| **Module** | **Role** | **Sample Processes** |
| --- | --- | --- |
| 2.0 Process Admin | Admin | Manage Users, Approve/Reject Seller, Monitor Platform, Handle Reports & Announcements |
| 2.1 Process Seller | Seller | Create Business Profile, Manage Product and Orders, Communicate with Customer, View Sales & Respond to Reviews |
| 2.2 Process Customer | Customer | Register/Login, Search & View Product, Purchase and Message Seller, Submit Reviews |
| 2.3 Process Guest | Guest | Search Product, View Product Details |

## Output Modules (3.x)

| **Module** | **Role** | **Sample Outputs** |
| --- | --- | --- |
| 3.0 Output Admin | Admin | Update Platform, Approved/Rejected Seller, Resolved Reports, Published Announcements |
| 3.1 Output Seller | Seller | Seller Account, Product Listings, Updated Orders, Sales Insights |
| 3.2 Output Customer | Customer | Customer Account, Order Confirmation, Payment Status, Notifications |
| 3.3 Output Guest | Guest | Search Results, Product Information |

# **06\. Entity Relationship Diagram (ERD)**

An ERD models the system's database structure — the entities (tables), their attributes (columns), and the relationships/cardinalities between them. This is the data-layer blueprint that underlies everything shown in the structure chart, DFDs, and HIPO diagram.

## Entities (Tables) and Key Attributes

| **Entity** | **Primary Key** | **Foreign Keys** | **Other Attributes** |
| --- | --- | --- | --- |
| ADMIN | Admin\_ID | — | Name, Email, Password |
| USER | User\_ID | — | Name, Password, Email, Role |
| SELLER | Seller\_ID, User\_ID | User\_ID | Business\_Name, Business\_Address, Status, Contact\_Number |
| CATEGORY | Category\_ID | — | Category\_Name |
| PRODUCT | Product\_ID | Category\_ID, Seller\_ID | Product\_Name, Description, Price, Stock, Image |
| ANNOUNCEMENT | Announcement\_ID | Admin\_ID | Title, Content, Date\_Posted |
| MESSAGE | Message\_ID | Sender\_ID, Receiver\_ID | Message, Sent\_At |
| REVIEW | Review\_ID | User\_ID, Product\_ID | Rating, Comment, Review\_Date |
| ORDER | Order\_ID | User\_ID, Seller\_ID | Order\_Date, Total\_Amount, Status |
| ORDER\_DETAILS | Detail\_ID | Order\_ID, Product\_ID | Quantity, Subtotal |
| PAYMENT | Payment\_ID | Order\_ID | Payment\_Method, Payment\_Status, Payment\_Date |

## Key Relationships

- **USER → SELLER:** One user can become one seller (1:1 or 1:0..1) — a seller record extends a user account with business info.
- **USER → ADMIN:** Admins are linked/managed in relation to users, reflecting the admin's oversight role over user accounts.
- **SELLER → PRODUCT:** One seller can have many products (1:M) — each product belongs to exactly one seller.
- **CATEGORY → PRODUCT:** One category can classify many products (1:M).
- **USER/SELLER → MESSAGE:** Users and sellers exchange messages; MESSAGE has both Sender\_ID and Receiver\_ID as foreign keys, forming a many-to-many-style communication link between users.
- **USER → REVIEW & PRODUCT → REVIEW:** A user writes many reviews, and each review is tied to a specific product (M:1 from Review to both User and Product).
- **USER → ORDER & SELLER → ORDER:** An order is placed by a user and fulfilled by a seller — linking customer purchases to specific sellers.
- **ORDER → ORDER\_DETAILS → PRODUCT:** This is the classic many-to-many resolution table — since one order can contain many products, and one product can appear in many orders, ORDER\_DETAILS breaks this into a junction table with Quantity and Subtotal per line item.
- **ORDER → PAYMENT:** Each order has one corresponding payment record (1:1), capturing payment method, status, and date.
- **ADMIN → ANNOUNCEMENT:** Admins create announcements (1:M), one admin can post many announcements.
