START AGOOBIZ CONNECT

IF user is ADMIN THEN
    INPUT
        User's Data
        Seller Application
        Reports
        Announcements
    PROCESS
        Manage Users
        Approve/Reject Seller
        Monitor Platform
        Handle Reports and Announcements
    OUTPUT
        Update Platform
        Approved/Rejected Seller
        Resolved Reports
        Published Announcements

ELSE IF user is SELLER THEN
    INPUT
        Registration Details
        Business Profile
        Product Information
        Order Updates
    PROCESS
        Create Business Profile
        Manage Product and Orders
        Communicate with Customer
        View Sales and Respond to Reviews
    OUTPUT
        Seller Account
        Product Listings
        Updated Orders
        Sales Insights

ELSE IF user is CUSTOMER THEN
    INPUT
        Register/Login Details
        Search Keywords
        Order and Payment Details
        Reviews/Messages
    PROCESS
        Register Login
        Search and View Product
        Purchase and Message Seller
        Submit Reviews
    OUTPUT
        Customer Account
        Order Confirmation
        Payment Status
        Notifications

ELSE IF user is GUEST THEN
    INPUT
        Search Keywords
        Product Selection
    PROCESS
        Search Product
        View Product Details
    OUTPUT
        Search Results
        Product Information

ENDIF

END AGOOBIZ CONNECT