# Shared API and Real-Time Event Specification

This document defines the RESTful API endpoints and real-time event interfaces shared between the Backend server (TV4) and Frontend client (TV3) for the E-commerce Delivery Management System.

---

## 1. Conventions and Standards

- **Base URL**: `/api/v1`
- **Data Format**: `application/json; charset=utf-8`
- **Authentication**: REST endpoints accept only a Bearer token (JWT in the `Authorization: Bearer <token>` header). They never authenticate from a cookie, so a request forged from another site cannot act as a signed-in user. The real-time stream is the only exception and uses its own cookie (see 8.1).
- **Roles**: `Customer`, `Shipper`, `Admin`.
- **Response Format**:
  - Success response:
    ```json
    {
      "success": true,
      "data": {},
      "error": null
    }
    ```
  - Error response:
    ```json
    {
      "success": false,
      "data": null,
      "error": {
        "code": "ERROR_CODE_STRING",
        "message": "Human readable description"
      }
    }
    ```

---

## 2. Authentication & Authorization Endpoints

### 2.1 Register Customer Account
- **POST** `/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "StrongPassword123",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0901234567"
  }
  ```
  *(Note: The server automatically assigns the role `Customer` per requirement Account.Register.Role).*
- **Response**: `201 Created` with token and user profile.

### 2.2 Login
- **POST** `/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
- **Response**: `200 OK` with token, user profile, and assigned role. The server also sets the events cookie described in 8.1, with the same lifetime as the token.

### 2.3 Logout
- **POST** `/auth/logout`
- **Access**: Authenticated
- **Effect**: invalidates the token and the events cookie, clears the events cookie in the response, and closes any open event stream of that session.

### 2.4 Get Current User Profile
- **GET** `/auth/me`
- **Access**: Authenticated

---

## 3. Order Management Endpoints

### 3.1 Create Order
- **POST** `/orders`
- **Access**: Customer
- **Request Body**:
  ```json
  {
    "recipientName": "Tran Thi B",
    "recipientPhone": "0912345678",
    "deliveryAddress": "123 Le Loi, District 1, Ho Chi Minh City",
    "items": [
      {
        "productId": "prod_01",
        "quantity": 2
      }
    ]
  }
  ```
- **Response**: `201 Created` with created order (status: `PENDING_CONFIRMATION`).

### 3.2 List Orders
- **GET** `/orders`
- **Access**: Authenticated
  - `Customer`: Returns own orders.
  - `Admin`: Returns all orders (supports status filtering, e.g., `?status=PENDING_CONFIRMATION`).
  - `Shipper`: Forbidden (shippers access assigned orders via shipments endpoint).

### 3.3 Get Order Detail
- **GET** `/orders/:id`
- **Access**: Authenticated (Customer owns order, assigned Shipper, or Admin per SEC-1, SEC-2)
- **Response Body**:
  ```json
  {
    "id": "order_123",
    "customerId": "cust_456",
    "recipientName": "Tran Thi B",
    "recipientPhone": "0912345678",
    "deliveryAddress": "123 Le Loi, District 1, Ho Chi Minh City",
    "status": "DELIVERING",
    "createdAt": "2026-11-08T08:00:00Z",
    "items": [
      {
        "id": "item_01",
        "productId": "prod_01",
        "productName": "Wireless Mouse",
        "quantity": 2
      }
    ],
    "shipment": {
      "id": "ship_789",
      "trackingNumber": "TRK987654",
      "shipperId": "ship_user_01",
      "shipperName": "Le Van Shipper",
      "shipperPhone": "0987654321",
      "failedAttempts": 0
    },
    "history": [
      {
        "oldStatus": null,
        "newStatus": "PENDING_CONFIRMATION",
        "changedBy": "cust_456",
        "changedAt": "2026-11-08T08:00:00Z"
      },
      {
        "oldStatus": "PENDING_CONFIRMATION",
        "newStatus": "WAITING_PICKUP",
        "changedBy": "admin_01",
        "changedAt": "2026-11-08T08:30:00Z"
      },
      {
        "oldStatus": "WAITING_PICKUP",
        "newStatus": "DELIVERING",
        "changedBy": "ship_user_01",
        "changedAt": "2026-11-08T09:15:00Z"
      }
    ]
  }
  ```

---

## 4. Shipment Management Endpoints

### 4.1 Create Shipment & Assign Shipper
- **POST** `/shipments`
- **Access**: Admin
- **Description**: Creates a shipment for an order currently in `PENDING_CONFIRMATION` status, assigns a designated shipper, and moves order status to `WAITING_PICKUP`.
- **Request Body**:
  ```json
  {
    "orderId": "order_123",
    "shipperId": "shipper_01"
  }
  ```
- **Response**: `201 Created`

### 4.2 List Assigned Shipments for Shipper
- **GET** `/shipments/assigned`
- **Access**: Shipper
- **Response**: List of shipments and orders assigned to the requesting shipper.

### 4.3 Update Shipment Delivery Status
- **PATCH** `/shipments/:id/status`
- **Access**: Shipper (assigned shipper only)
- **Request Body**:
  ```json
  {
    "action": "START_DELIVERY" | "CONFIRM_DELIVERED",
    "notes": "Picked up / delivered successfully"
  }
  ```
  - `START_DELIVERY`: Transitions order from `WAITING_PICKUP` to `DELIVERING` (T3), or from `DELIVERY_FAILED` back to `DELIVERING` (T6) only while its failed delivery attempts are below the BR-06 threshold.
  - `CONFIRM_DELIVERED`: Transitions order from `DELIVERING` to `DELIVERED` (T4).
  *(Note: Reporting failed delivery or transit incidents is handled exclusively via `POST /issues` per Section 6.1, which records the incident and transitions the order to `DELIVERY_FAILED` (T5) without automatically transitioning to `RETURNING`).*
- **Response**: `200 OK` with updated status.
- **Errors**: the server checks every transition itself; the buttons shown by the client are only a hint.
  - `403 Forbidden` when the caller is not the Shipper assigned to this shipment.
  - `409 Conflict` with `error.code` = `INVALID_TRANSITION` when the order is not in a state that allows the action, including a retry after the BR-06 threshold is reached. The order status does not change.

### 4.4 Track Shipment
- **GET** `/shipments/track/:trackingNumber` (or `GET /shipments/:id/tracking`)
- **Access**: Authenticated (Customer owns order, assigned Shipper, or Admin per SEC-1, SEC-2)
- **Response**: Current status, timeline of historical status changes, shipper details, and recipient destination.

### 4.5 Process Return Shipment (Admin)
- **POST** `/shipments/:id/return`
- **Access**: Admin (Issue.Resolve.Return, UC-07 step 4)
- **Description**: Transitions an order currently in `DELIVERY_FAILED` status whose failed delivery attempts reached the BR-06 threshold to `RETURNING` (T7).
- **Request Body**:
  ```json
  {
    "notes": "Order reached max failed delivery attempts, initiating return to seller"
  }
  ```
- **Response**: `200 OK` with updated order status (`RETURNING`).
- **Errors**: `409 Conflict` with `error.code` = `RETURN_THRESHOLD_NOT_REACHED` when the order is not in `DELIVERY_FAILED` or its failed delivery attempts are below the BR-06 threshold (UC-07 7.0.E1). The order status does not change.

### 4.6 Confirm Return Received (Admin / Warehouse)
- **POST** `/shipments/:id/confirm-returned`
- **Access**: Admin (Issue.Resolve.Returned, UC-07 alt 7.2)
- **Description**: Confirms the returned package has arrived back at the seller/warehouse and transitions order from `RETURNING` to `RETURNED_TO_SELLER` (T8).
- **Request Body**:
  ```json
  {
    "notes": "Package inspected and received at warehouse"
  }
  ```
- **Response**: `200 OK` with updated order status (`RETURNED_TO_SELLER`).

---

## 5. Return Management Endpoints

### 5.1 Submit Return Request
- **POST** `/returns`
- **Access**: Customer
- **Description**: Customer requests return for an order in `DELIVERED` status within the valid return window.
- **Request Body**:
  ```json
  {
    "orderId": "order_123",
    "reason": "DAMAGED_OR_DEFECTIVE" | "ITEM_NOT_RECEIVED" | "OTHER",
    "notes": "Package was damaged upon receipt."
  }
  ```
- **Response**: `201 Created` (status: `PENDING_APPROVAL`).

### 5.2 List Return Requests
- **GET** `/returns`
- **Access**: Authenticated (Customer sees own requests, Admin sees all).

### 5.3 Review Return Request (Approve or Reject)
- **PATCH** `/returns/:id/review`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "action": "APPROVE" | "REJECT",
    "rejectionReason": "Exceeded return window"
  }
  ```
  - If approved and reason was damaged, order status updates to `DAMAGED`.
  - If approved and reason was not received, order status updates to `LOST`.
  - If rejected, return request status becomes `REJECTED`, order status remains `DELIVERED`.

### 5.4 Complete Return Processing
- **PATCH** `/returns/:id/complete`
- **Access**: Admin
- **Description**: Concludes the return handling workflow, setting return request status to `COMPLETED`.

---

## 6. Delivery Issues Endpoints

### 6.1 Report Delivery Issue
- **POST** `/issues`
- **Access**: Shipper (for orders in `DELIVERING`), or Admin
- **Request Body**:
  ```json
  {
    "orderId": "order_123",
    "issueType": "DAMAGED" | "LOST" | "FAILED_DELIVERY",
    "notes": "Package was lost during transit."
  }
  ```
  *(Note: For `FAILED_DELIVERY`, `failedAttempts` is calculated dynamically by counting stored delivery issue records per BR-06 and SRS 4.2; order transitions to `DELIVERY_FAILED` (T5)).*
- **Response**: `201 Created`. Order transitions to `DAMAGED`, `LOST`, or `DELIVERY_FAILED` accordingly.

### 6.2 List Unresolved Delivery Issues
- **GET** `/issues?resolved=false`
- **Access**: Admin (Issue.Resolve.List)
- **Query Parameters**:
  - `resolved` (boolean, optional): Filter by resolution status (e.g., `false` for unresolved issues).
  - `page` (number, optional): Page number.
  - `limit` (number, optional): Items per page.
- **Response**: `200 OK` with list of delivery issues.

### 6.3 Resolve Delivery Issue
- **PATCH** `/issues/:id/resolve`
- **Access**: Admin (Issue.Resolve.Result)
- **Request Body**:
  ```json
  {
    "resolutionNotes": "Verified loss with shipping depot. Initiated order closure."
  }
  ```
  *(Note: `resolutionNotes` is required, non-empty, max 500 characters per SRS 4.2. Resolving a failed delivery issue whose order reached max attempts requires the order to first be transitioned to `RETURNING` via `POST /shipments/:id/return` per Issue.Resolve.Result).*
- **Response**: `200 OK` with resolved issue details.

---

## 7. User & Shipper Management Endpoints

### 7.1 List Shippers
- **GET** `/users?role=Shipper` (or `GET /shippers`)
- **Access**: Admin
- **Description**: Retrieves a list of active Shippers to populate the shipper assignment selector in the Admin operations dashboard (UC-02, Track.Assign.Shipper).
- **Response**: `200 OK` with array of shipper profiles:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "shipper_01",
        "fullName": "Le Van Shipper",
        "phoneNumber": "0987654321",
        "email": "shipper01@example.com"
      }
    ],
    "error": null
  }
  ```

---

## 8. Real-Time Event Specifications

The system supports event-driven real-time updates without polling, delivered via WebSockets or Server-Sent Events (SSE).

### 8.1 Connection and Authentication
- **Endpoint**: **GET** `/events` (Server-Sent Events, `text/event-stream`). The frontend opens it as `/api/v1/events`.
- **Authentication**: the events cookie only. The browser `EventSource` API cannot send an `Authorization` header, so login sets a separate cookie for this endpoint:
  - attributes `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/api/v1/events`, so the browser sends it to no other endpoint and page scripts cannot read it;
  - tied to the same session as the token, expires with it, and stops working after logout.
- **Token in URL**: not allowed. A token in the query string ends up in server and proxy logs.
- **Origin check**: the server rejects the connection when the `Origin` header is not the frontend origin. If the frontend runs on another origin, CORS answers with that exact origin and `Access-Control-Allow-Credentials: true`, never `*`.
- **Read only**: the stream only sends events. Every change still goes through the REST endpoints with a Bearer token.
- **Event scope**: the server decides the channels from the session, not from client input, and sends only events of orders the user may view (SEC-2 and the other SEC rules on who may view an order). The client never filters events for security.
- **Session end**: when the session expires or is revoked, the server closes the stream. The client closes its stream on sign out and opens a new one when another account signs in.
- **Client**: opens the stream with `withCredentials: true`.

### 8.2 Channel Subscriptions
- **Customer Channel**: `customers:{customerId}` (subscribed by customer app; server enforces SEC-2 so customers can only subscribe to their own channel).
- **Order Channel**: `orders:{orderId}` (subscribed by customer viewing order tracking screen).
- **Shipper Channel**: `shippers:{shipperId}` (subscribed by shipper app).
- **Admin Channel**: `admin:dashboard` (subscribed by store admin dashboard).

### 8.3 Event Catalog

| Event Name | Channel | Payload | Description |
|---|---|---|---|
| `order.created` | `admin:dashboard` | `{ orderId, customerName, totalItems, createdAt }` | Notifies Admin of a new incoming customer order. |
| `order.status_changed` | `customers:{customerId}`, `orders:{orderId}`, `admin:dashboard` | `{ orderId, oldStatus, newStatus, changedAt, changedBy }` | Broadcasts order status changes so client UI updates instantly. |
| `shipment.assigned` | `shippers:{shipperId}` | `{ shipmentId, orderId, trackingNumber, address }` | Alerts the assigned shipper that an order is ready for pickup. |
| `issue.reported` | `admin:dashboard` | `{ issueId, orderId, issueType, reportedBy, notes }` | Alerts Admin when a delivery issue or damaged/lost incident occurs. |
| `return.status_changed` | `customers:{customerId}`, `orders:{orderId}`, `admin:dashboard` | `{ requestId, orderId, newStatus, rejectionReason }` | Informs customer and admin of return approval/rejection. |
