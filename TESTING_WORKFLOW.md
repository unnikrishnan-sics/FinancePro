# Smart Personal Finance Manager (FinancePro) - Testing Workflow

## Project Overview
**FinancePro** is a modern, comprehensive personal finance management tool designed to help users track expenses, visualize income trends, and predict future financial health. 

### Core Purpose
- **Track & Manage**: Easily log income and expenses.
- **Visualize**: Interactive charts and graphs to understand spending habits.
- **Predict**: Predictive analysis (AI-driven logic) to forecast future financial health.
- **Admin Control**: Centralized dashboard for system monitoring and user feedback.

### Technology Stack
- **Frontend**: React.js (Vite), Ant Design (UI), Recharts (Data Visualization).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT Authentication, Bcrypt Password Hashing.

## 1. Accessing the Application
- **URL**: [INSERT HOSTED URL HERE]
- **Default Credentials**:
  - **Admin User**: `admin@gmail.com` | `admin@123`
  - **Regular User**: Create via `/register`

## 2. Key Features to Test
### User Experience
- **Landing Page**: Professional introduction to features.
- **Dashboard**: Real-time summary of balance, income, and expenses with trend charts.
- **Transactions**: Full CRUD (Create, Read, Update, Delete) on financial logs.
- **Analytics**: Deep dive into spending categories and predictive trends.
- **Settings**: Profile management and theme customization (Dark/Light/Compact modes).

### Admin Experience
- **Admin Dashboard**: System-wide statistics.
- **System Analytics**: Monitoring user growth and transaction volume.
- **Feedback Management**: Viewing and responding to user messages/support tickets.

## 3. Testing Scenarios

### A. User Authentication (Public Users)
1. **Sign Up**:
   - Go to `/register` (or click "Get Started" / "Sign Up").
   - Create a new account with Name, Email, Password.
   - **Pass/Fail**: Verify you are redirected to the Dashboard after success.
2. **Login**:
   - Logout and try logging in with the new credentials at `/login`.
   - **Pass/Fail**: Successful login redirects to Dashboard.
3. **Forgot Password** (If enabled):
   - Go to `/forgot-password`.
   - **Pass/Fail**: Verify email is received (if SMTP is configured on server).

### B. Dashboard & Core Features
1. **Dashboard Overview**:
   - Check if "Total Balance", "Income", "Expense" cards are visible and not loading forever.
2. **Transaction Management**:
   - Navigate to **Transactions**.
   - **Add Transaction**: Click "Add Transaction", fill in details (Type, Amount, Category, Date), and Submit.
   - **Verify**: Check if the new transaction appears in the list.
   - **Edit/Delete**: Try editing or deleting a transaction.
3. **Analytics**:
   - Navigate to **Analytics**.
   - **Pass/Fail**: Verify charts (Income vs Expense) render correctly with the data you added.

### C. Admin Panel (Restricted Access)
1. **Admin Access**:
   - Log in with the Admin credentials provided above.
   - Access the Admin Dashboard (usually `/dashboard/admin`).
2. **System Monitoring**:
   - Check "System Analytics" to see total users/transactions.
   - Check "Messages" if there is a contact form feature.
3. **User Management**:
   - Verify the admin can see other users' analytics (if applicable).

## 3. Reporting Issues
If you find a bug, please report:
- **Page/URL**: Where did it happen?
- **Action**: What were you doing?
- **Expected Result**: What should have happened?
- **Actual Result**: What actually happened?
- **Screenshot**: (Optional but helpful)
