BEGIN AgoobizConnect

    INPUT userType

    SWITCH (userType)

        CASE "Admin":
            INPUT userData, sellerApplication, reports, announcements
            
            CALL ManageUsers(userData)
            CALL ApproveRejectSeller(sellerApplication)
            CALL MonitorPlatform()
            CALL HandleReportsAndAnnouncements(reports, announcements)
            
            OUTPUT updatedPlatform
            OUTPUT approvedRejectedSeller
            OUTPUT resolvedReports
            OUTPUT publishedAnnouncements
            BREAK

        CASE "Seller":
            INPUT registrationDetails, businessProfile, productInfo, orderUpdates
            
            CALL CreateBusinessProfile(registrationDetails, businessProfile)
            CALL ManageProductAndOrders(productInfo, orderUpdates)
            CALL CommunicateWithCustomer()
            CALL ViewSalesAndRespondToReviews()
            
            OUTPUT sellerAccount
            OUTPUT productListings
            OUTPUT updatedOrders
            OUTPUT salesInsights
            BREAK

        CASE "Customer":
            INPUT loginDetails, searchKeywords, orderPaymentDetails, reviewsMessages
            
            CALL RegisterLogin(loginDetails)
            CALL SearchAndViewProduct(searchKeywords)
            CALL PurchaseAndMessageSeller(orderPaymentDetails)
            CALL SubmitReviews(reviewsMessages)
            
            OUTPUT customerAccount
            OUTPUT orderConfirmation
            OUTPUT paymentStatus
            OUTPUT notifications
            BREAK

        CASE "Guest":
            INPUT searchKeywords, productSelection
            
            CALL SearchProduct(searchKeywords)
            CALL ViewProductDetails(productSelection)
            
            OUTPUT searchResults
            OUTPUT productInformation
            BREAK

        DEFAULT:
            OUTPUT "Invalid user type"

    END SWITCH

END AgoobizConnect