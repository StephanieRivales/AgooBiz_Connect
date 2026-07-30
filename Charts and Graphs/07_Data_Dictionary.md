## **AGOOBIZ CONNECT DATA DICTIONARY**

## Users

| **Field Name**       | **Data Type** | **Size** | **Key** | **Description**                                    | **Constraints / Notes**    |
| -------------------- | ------------- | -------- | ------- | -------------------------------------------------- | -------------------------- |
| **UserID**           | INT           | 11       | PK      | Unique identifier for every account in the system. | Auto-increment             |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **Username**         | VARCHAR       | 50       | \-      | Login name chosen by the user.                     | Unique, Not Null           |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **Email**            | VARCHAR       | 100      | \-      | User's email address.                              | Unique, Not Null           |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **PasswordHash**     | VARCHAR       | 255      | \-      | Encrypted password.                                | Not Null                   |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **Role**             | ENUM          | \-       | \-      | Account type: Admin, Seller, or Customer.          | Not Null                   |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **FullName**         | VARCHAR       | 100      | \-      | Full legal name of the account holder.             | Not Null                   |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **ContactNumber**    | VARCHAR       | 20       | \-      | Contact/mobile number.                             | Nullable                   |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **RegistrationDate** | DATETIME      | \-       | \-      | Date and time the account was created.             | Default: current timestamp |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |
| **AccountStatus**    | ENUM          | \-       | \-      | Active, Suspended, or Pending.                     | Default: Pending           |
| ---                  | ---           | ---      | ---     | ---                                                | ---                        |

## Seller Profile

| **Field Name**          | **Data Type** | **Size** | **Key** | **Description**                                                    | **Constraints / Notes** |
| ----------------------- | ------------- | -------- | ------- | ------------------------------------------------------------------ | ----------------------- |
| **SellerID**            | INT           | 11       | PK      | Unique identifier for a seller's business profile.                 | Auto-increment          |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **UserID**              | INT           | 11       | FK      | Links to the Users table (the account owning this seller profile). | References Users.UserID |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **BusinessName**        | VARCHAR       | 100      | \-      | Registered/display name of the seller's business.                  | Not Null                |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **BusinessAddress**     | VARCHAR       | 255      | \-      | Physical or business mailing address.                              | Not Null                |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **BusinessDescription** | TEXT          | \-       | \-      | Short description of the business/products offered.                | Nullable                |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **ApplicationStatus**   | ENUM          | \-       | \-      | Approved, Rejected, or Pending.                                    | Default: Pending        |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **DateApplied**         | DATETIME      | \-       | \-      | Date the seller application was submitted.                         | Not Null                |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **DateReviewed**        | DATETIME      | \-       | \-      | Date the Admin approved/rejected the application.                  | Nullable                |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |
| **ReviewedBy**          | INT           | 11       | FK      | Admin user who approved/rejected the seller.                       | References Users.UserID |
| ---                     | ---           | ---      | ---     | ---                                                                | ---                     |

## Products

| **Field Name**    | **Data Type** | **Size** | **Key** | **Description**                             | **Constraints / Notes**           |
| ----------------- | ------------- | -------- | ------- | ------------------------------------------- | --------------------------------- |
| **ProductID**     | INT           | 11       | PK      | Unique identifier for a product listing.    | Auto-increment                    |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **SellerID**      | INT           | 11       | FK      | Seller who owns/listed this product.        | References SellerProfile.SellerID |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **ProductName**   | VARCHAR       | 150      | \-      | Name/title of the product.                  | Not Null                          |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **Description**   | TEXT          | \-       | \-      | Detailed product description.               | Nullable                          |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **Category**      | VARCHAR       | 50       | \-      | Product category used for search/filtering. | Not Null                          |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **Price**         | DECIMAL       | 10,2     | \-      | Unit selling price.                         | Not Null, > 0                     |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **StockQuantity** | INT           | 11       | \-      | Number of units currently available.        | Default: 0                        |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **ImageURL**      | VARCHAR       | 255      | \-      | Path/link to the primary product image.     | Nullable                          |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **DateListed**    | DATETIME      | \-       | \-      | Date the product was first listed.          | Not Null                          |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |
| **ListingStatus** | ENUM          | \-       | \-      | Active, Out of Stock, or Delisted.          | Default: Active                   |
| ---               | ---           | ---      | ---     | ---                                         | ---                               |

## Orders

| **Field Name**      | **Data Type** | **Size** | **Key** | **Description**                                       | **Constraints / Notes** |
| ------------------- | ------------- | -------- | ------- | ----------------------------------------------------- | ----------------------- |
| **OrderID**         | INT           | 11       | PK      | Unique identifier for a customer order.               | Auto-increment          |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |
| **CustomerID**      | INT           | 11       | FK      | Customer who placed the order.                        | References Users.UserID |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |
| **OrderDate**       | DATETIME      | \-       | \-      | Date and time the order was placed.                   | Not Null                |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |
| **TotalAmount**     | DECIMAL       | 10,2     | \-      | Total value of the order.                             | Not Null                |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |
| **OrderStatus**     | ENUM          | \-       | \-      | Pending, Confirmed, Shipped, Completed, or Cancelled. | Default: Pending        |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |
| **ShippingAddress** | VARCHAR       | 255      | \-      | Delivery address for the order.                       | Not Null                |
| ---                 | ---           | ---      | ---     | ---                                                   | ---                     |

## Order Items

| **Field Name**  | **Data Type** | **Size** | **Key** | **Description**                                    | **Constraints / Notes**       |
| --------------- | ------------- | -------- | ------- | -------------------------------------------------- | ----------------------------- |
| **OrderItemID** | INT           | 11       | PK      | Unique identifier for a line item within an order. | Auto-increment                |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |
| **OrderID**     | INT           | 11       | FK      | Order this line item belongs to.                   | References Orders.OrderID     |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |
| **ProductID**   | INT           | 11       | FK      | Product being purchased.                           | References Products.ProductID |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |
| **Quantity**    | INT           | 11       | \-      | Number of units ordered.                           | Not Null, > 0                 |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |
| **UnitPrice**   | DECIMAL       | 10,2     | \-      | Price per unit at time of purchase.                | Not Null                      |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |
| **Subtotal**    | DECIMAL       | 10,2     | \-      | Quantity × UnitPrice.                              | Not Null                      |
| ---             | ---           | ---      | ---     | ---                                                | ---                           |

## Payments

| **Field Name**    | **Data Type** | **Size** | **Key** | **Description**                               | **Constraints / Notes**   |
| ----------------- | ------------- | -------- | ------- | --------------------------------------------- | ------------------------- |
| **PaymentID**     | INT           | 11       | PK      | Unique identifier for a payment transaction.  | Auto-increment            |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |
| **OrderID**       | INT           | 11       | FK      | Order this payment is applied to.             | References Orders.OrderID |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |
| **PaymentMethod** | VARCHAR       | 30       | \-      | Method used (e-wallet using QR Code and COD). | Not Null                  |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |
| **Amount**        | DECIMAL       | 10,2     | \-      | Amount paid.                                  | Not Null                  |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |
| **PaymentDate**   | DATETIME      | \-       | \-      | Date/time the payment was made.               | Not Null                  |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |
| **PaymentStatus** | ENUM          | \-       | \-      | Pending, Paid, Failed, or Refunded.           | Default: Pending          |
| ---               | ---           | ---      | ---     | ---                                           | ---                       |

## Reviews

| **Field Name** | **Data Type** | **Size** | **Key** | **Description**                         | **Constraints / Notes**       |
| -------------- | ------------- | -------- | ------- | --------------------------------------- | ----------------------------- |
| **ReviewID**   | INT           | 11       | PK      | Unique identifier for a product review. | Auto-increment                |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |
| **CustomerID** | INT           | 11       | FK      | Customer who submitted the review.      | References Users.UserID       |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |
| **ProductID**  | INT           | 11       | FK      | Product being reviewed.                 | References Products.ProductID |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |
| **Rating**     | TINYINT       | 1        | \-      | Star rating given by the customer.      | 1-5, Not Null                 |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |
| **Comment**    | TEXT          | \-       | \-      | Written feedback from the customer.     | Nullable                      |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |
| **DatePosted** | DATETIME      | \-       | \-      | Date the review was submitted.          | Not Null                      |
| ---            | ---           | ---      | ---     | ---                                     | ---                           |

## Messages

| **Field Name**  | **Data Type** | **Size** | **Key** | **Description**                                     | **Constraints / Notes** |
| --------------- | ------------- | -------- | ------- | --------------------------------------------------- | ----------------------- |
| **MessageID**   | INT           | 11       | PK      | Unique identifier for a message.                    | Auto-increment          |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |
| **SenderID**    | INT           | 11       | FK      | User who sent the message.                          | References Users.UserID |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |
| **ReceiverID**  | INT           | 11       | FK      | User who receives the message (seller or customer). | References Users.UserID |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |
| **MessageText** | TEXT          | \-       | \-      | Content of the message.                             | Not Null                |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |
| **DateSent**    | DATETIME      | \-       | \-      | Date/time the message was sent.                     | Not Null                |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |
| **ReadStatus**  | BOOLEAN       | 1        | \-      | Whether the message has been read.                  | Default: 0 (unread)     |
| ---             | ---           | ---      | ---     | ---                                                 | ---                     |

## Reports

| **Field Name**         | **Data Type** | **Size** | **Key** | **Description**                                                 | **Constraints / Notes** |
| ---------------------- | ------------- | -------- | ------- | --------------------------------------------------------------- | ----------------------- |
| **ReportID**           | INT           | 11       | PK      | Unique identifier for a submitted report.                       | Auto-increment          |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **ReportedBy**         | INT           | 11       | FK      | User who filed the report.                                      | References Users.UserID |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **ReportedEntityType** | ENUM          | \-       | \-      | Type of entity being reported (User, Product, Review, Message). | Not Null                |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **ReportedEntityID**   | INT           | 11       | \-      | ID of the specific record being reported.                       | Not Null                |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **Reason**             | TEXT          | \-       | \-      | Explanation for the report.                                     | Not Null                |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **ReportStatus**       | ENUM          | \-       | \-      | Open, Under Review, or Resolved.                                | Default: Open           |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **DateSubmitted**      | DATETIME      | \-       | \-      | Date the report was filed.                                      | Not Null                |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **DateResolved**       | DATETIME      | \-       | \-      | Date the Admin resolved the report.                             | Nullable                |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |
| **ResolvedBy**         | INT           | 11       | FK      | Admin who resolved the report.                                  | References Users.UserID |
| ---                    | ---           | ---      | ---     | ---                                                             | ---                     |

## Announcements

| **Field Name**     | **Data Type** | **Size** | **Key** | **Description**                                | **Constraints / Notes** |
| ------------------ | ------------- | -------- | ------- | ---------------------------------------------- | ----------------------- |
| **AnnouncementID** | INT           | 11       | PK      | Unique identifier for a platform announcement. | Auto-increment          |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |
| **AdminID**        | INT           | 11       | FK      | Admin who created the announcement.            | References Users.UserID |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |
| **Title**          | VARCHAR       | 150      | \-      | Announcement headline.                         | Not Null                |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |
| **Content**        | TEXT          | \-       | \-      | Full announcement body.                        | Not Null                |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |
| **DatePublished**  | DATETIME      | \-       | \-      | Date the announcement went live.               | Not Null                |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |
| **PublishStatus**  | ENUM          | \-       | \-      | Draft or Published.                            | Default: Draft          |
| ---                | ---           | ---      | ---     | ---                                            | ---                     |

## Notifications

| **Field Name**       | **Data Type** | **Size** | **Key** | **Description**                                      | **Constraints / Notes** |
| -------------------- | ------------- | -------- | ------- | ---------------------------------------------------- | ----------------------- |
| **NotificationID**   | INT           | 11       | PK      | Unique identifier for a system notification.         | Auto-increment          |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |
| **UserID**           | INT           | 11       | FK      | Recipient of the notification.                       | References Users.UserID |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |
| **NotificationType** | VARCHAR       | 30       | \-      | Category of notice (Order, Payment, Review, System). | Not Null                |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |
| **MessageText**      | VARCHAR       | 255      | \-      | Notification content shown to the user.              | Not Null                |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |
| **DateSent**         | DATETIME      | \-       | \-      | Date/time the notification was generated.            | Not Null                |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |
| **ReadStatus**       | BOOLEAN       | 1        | \-      | Whether the user has viewed the notification.        | Default: 0 (unread)     |
| ---                  | ---           | ---      | ---     | ---                                                  | ---                     |

## Search Logs

| **Field Name**   | **Data Type** | **Size** | **Key** | **Description**                                 | **Constraints / Notes**           |
| ---------------- | ------------- | -------- | ------- | ----------------------------------------------- | --------------------------------- |
| **SearchID**     | INT           | 11       | PK      | Unique identifier for a search event.           | Auto-increment                    |
| ---              | ---           | ---      | ---     | ---                                             | ---                               |
| **UserID**       | INT           | 11       | FK      | User who performed the search; NULL for Guests. | References Users.UserID, Nullable |
| ---              | ---           | ---      | ---     | ---                                             | ---                               |
| **Keyword**      | VARCHAR       | 100      | \-      | Search term entered by the Customer or Guest.   | Not Null                          |
| ---              | ---           | ---      | ---     | ---                                             | ---                               |
| **DateSearched** | DATETIME      | \-       | \-      | Date/time the search was performed.             | Not Null                          |
| ---              | ---           | ---      | ---     | ---                                             | ---                               |
| **ResultsCount** | INT           | 11       | \-      | Number of products returned for the search.     | Default: 0                        |
| ---              | ---           | ---      | ---     | ---                                             | ---                               |