# 📚 Library Management System – Backend

![.NET](https://img.shields.io/badge/.NET-8-blue)
![EF Core](https://img.shields.io/badge/Entity%20Framework-Core-green)
![Azure SQL](https://img.shields.io/badge/Azure-SQL-blue)
![Status](https://img.shields.io/badge/status-active-success)

---

## 🧾 Overview

A cloud-ready RESTful backend for managing libraries, books, and borrowing operations.  
Built using ASP.NET Core + Entity Framework Core with Azure SQL Database.

Designed with scalability in mind and compatible with API Gateway-based microservice architecture.

---

## 🏗️ Architecture

```
                ┌──────────────────────┐
                │      Client UI       │
                └─────────┬────────────┘
                          │ HTTP Request
                          ▼
                ┌──────────────────────┐
                │     API Gateway      │
                └─────────┬────────────┘
                          │ Routing
                          ▼
                ┌──────────────────────┐
                │     Controller       │
                └─────────┬────────────┘
                          │ Calls
                          ▼
                ┌──────────────────────┐
                │      Service Layer   │
                └─────────┬────────────┘
                          │ Business Logic
                          ▼
                ┌──────────────────────┐
                │     DbContext (EF)   │
                └─────────┬────────────┘
                          │ SQL Query
                          ▼
                ┌──────────────────────┐
                │     Azure SQL DB     │
                └──────────────────────┘
```

---

## 🧠 Tech Stack

- ASP.NET Core (.NET 8)
- Entity Framework Core
- Azure SQL Database
- Azure App Service
- REST APIs

---

## 📦 Features

- Library CRUD operations
- Book inventory management
- Borrow tracking system
- Relational integrity with EF Core
- Cloud database integration

---

## 🗂️ Project Structure

```
LibraryAPI/
│
├── Models/
│   ├── Library.cs
│   ├── Book.cs
│   ├── BorrowedBook.cs
│   └── LibraryDbContext.cs
│
├── Controllers/
│   ├── LibraryController.cs
│   ├── BookController.cs
│   └── BorrowedBookController.cs
│
├── Program.cs
├── appsettings.json
```

---

## 🧬 Data Model

### Library
- LibraryId (PK)
- Name
- Address
- MaximumCapacity

### Book
- BookId (PK)
- Title
- Author
- Category
- Price
- LibraryId (FK)
- TotalCopies
- AvailableCopies

### BorrowedBook
- Tracks borrowing transactions
- Linked to Book

---

## 🔗 Relationships

```
Library (1) ──────── (N) Book (1) ──────── (N) BorrowedBook
```

---

## ⚙️ Database Configuration

Handled via Entity Framework Core:

- Auto-generated primary keys
- Foreign key relationships
- Cascade delete:
  - Library → Books
  - Book → BorrowedBooks

---

## 🔄 Application Workflow

### Request Flow

```
Client → API Gateway → Controller → DbContext → Azure SQL
```

---

### Write Flow

```
POST → Controller → Add() → SaveChanges() → Database
```

---

### Read Flow

```
GET → Controller → LINQ → SQL → Response
```

---

## ☁️ Azure Setup

### SQL Server
library-sql-server-26

### Databases

| Database   | Purpose            | Status        |
|-----------|-------------------|--------------|
| LibraryDb | Main service DB   | Active       |
| AuthDb    | Authentication    | Active       |

---

## 🔑 Configuration

---

## 🚀 Running the Project

### 1. Clone

```
git clone https://github.com/your-username/library-management.git
cd library-management
```

### 2. Configure DB

Update connection string in appsettings.json

### 3. Apply Migrations

```
dotnet ef database update
```

### 4. Run

```
dotnet run
```

---

## 🔍 Debugging

### Check DB

```
Console.WriteLine(context.Database.GetDbConnection().Database);
```

### Check Provider

```
Console.WriteLine(context.Database.ProviderName);
```

Expected:
Microsoft.EntityFrameworkCore.SqlServer

---

## 📈 Future Improvements

- Logging & monitoring
- Indexing(Pagination)
- Single Sign-On
- Soft deletes
- MFA

---

## 👨‍💻 Author

TEK Challengers
