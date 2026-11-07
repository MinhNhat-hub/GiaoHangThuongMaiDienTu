# Shared API and Real-Time Event Specification

This document defines the RESTful API endpoints and real-time event interfaces shared between the Backend server (TV4) and Frontend client (TV3) for the E-commerce Delivery Management System.

---

## 1. Conventions and Standards

- **Base URL**: `/api/v1`
- **Data Format**: `application/json; charset=utf-8`
- **Authentication**: Bearer Token (JWT in `Authorization: Bearer <token>` header) or secure session cookie.
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
    "phoneNumber": "0901234567",
    "role": "Customer"
  }
  ```
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
- **Response**: `200 OK` with token, user profile, and assigned role.

### 2.3 Logout
- **POST** `/auth/logout`
- **Access**: Authenticated

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
- **Access**: Authenticated (Customer owns order, assigned Shipper, or Admin)
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
        "quantity": 2,
        "price": 250000
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
- **Access**: Shipper
- **Request Body**:
  ```json
  {
    "action": "START_DELIVERY" | "CONFIRM_DELIVERED" | "REPORT_FAILED_DELIVERY",
    "notes": "Recipient was not available at address"
  }
  ```
  - `START_DELIVERY`: Transitions order from `WAITING_PICKUP` to `DELIVERING`.
  - `CONFIRM_DELIVERED`: Transitions order from `DELIVERING` to `DELIVERED`.
  - `REPORT_FAILED_DELIVERY`: Increments failed attempts counter. If limit is not reached, sets status to `FAILED_DELIVERY` (for redelivery). If limit is reached, Admin initiates return to seller (`RETURNING`).
- **Response**: `200 OK` with updated status.

### 4.4 Track Shipment
- **GET** `/shipments/:id/tracking` (or by tracking number `GET /shipments/track/:trackingNumber`)
- **Access**: Public / Customer / Admin
- **Response**: Current status, timeline of historical status changes, shipper details, and recipient destination.

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
- **Response**: `201 Created`. Order transitions to `DAMAGED`, `LOST`, or `FAILED_DELIVERY` accordingly.

### 6.2 Resolve Delivery Issue
- **PATCH** `/issues/:id/resolve`
- **Access**: Admin
- **Request Body**:
  ```json
  {
    "resolutionNotes": "Verified loss with shipping depot. Initiated order closure."
  }
  ```

---

## 7. Real-Time Event Specifications

The system supports event-driven real-time updates without polling, delivered via WebSockets or Server-Sent Events (SSE).

### 7.1 Channel Subscriptions
- **Order Channel**: `orders:{orderId}` (subscribed by customer viewing order tracking screen).
- **Shipper Channel**: `shippers:{shipperId}` (subscribed by shipper app).
- **Admin Channel**: `admin:dashboard` (subscribed by store admin dashboard).

### 7.2 Event Catalog

| Event Name | Channel | Payload | Description |
|---|---|---|---|
| `order.created` | `admin:dashboard` | `{ orderId, customerName, totalItems, createdAt }` | Notifies Admin of a new incoming customer order. |
| `order.status_changed` | `orders:{orderId}`, `admin:dashboard` | `{ orderId, oldStatus, newStatus, changedAt, changedBy }` | Broadcasts order status changes so client UI updates instantly. |
| `shipment.assigned` | `shippers:{shipperId}` | `{ shipmentId, orderId, trackingNumber, address }` | Alerts the assigned shipper that an order is ready for pickup. |
| `issue.reported` | `admin:dashboard` | `{ issueId, orderId, issueType, reportedBy, notes }` | Alerts Admin when a delivery issue or damaged/lost incident occurs. |
| `return.status_changed` | `orders:{orderId}`, `admin:dashboard` | `{ requestId, orderId, newStatus, rejectionReason }` | Informs customer and admin of return approval/rejection. |
