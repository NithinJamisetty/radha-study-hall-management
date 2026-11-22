-- Study Hall Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins / Staff Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'ADMIN', -- ADMIN, MANAGER, RECEPTIONIST
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    locker_number VARCHAR(20),
    seat_number VARCHAR(20),
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, LEFT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Chat Raw Logs
CREATE TABLE IF NOT EXISTS admin_chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id),
    raw_message TEXT NOT NULL,
    ai_response JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extracted Domain Events from Chat
CREATE TABLE IF NOT EXISTS extracted_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_log_id UUID REFERENCES admin_chat_logs(id),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_type VARCHAR(50) NOT NULL, -- ADMISSION, FEE_COLLECTION, ATTENDANCE, MAINTENANCE, GENERAL_NOTE
    payload JSONB NOT NULL,
    is_correction BOOLEAN DEFAULT FALSE,
    corrected_event_id UUID REFERENCES extracted_events(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shift Attendance
CREATE TABLE IF NOT EXISTS shift_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    morning_count INT DEFAULT 0,
    afternoon_count INT DEFAULT 0,
    evening_count INT DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fee Collections
CREATE TABLE IF NOT EXISTS fee_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'CASH', -- CASH, UPI, BANK_TRANSFER
    remarks TEXT,
    collection_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Tickets
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    issue_description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
    reported_date DATE DEFAULT CURRENT_DATE,
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily Reports
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date DATE UNIQUE NOT NULL,
    formatted_markdown TEXT NOT NULL,
    summary_data JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, SENT, AUTO_SENT
    approved_by UUID REFERENCES admins(id),
    draft_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    dispatch_channel VARCHAR(30) DEFAULT 'TELEGRAM',
    telegram_message_id VARCHAR(100)
);

-- Seed default admin
INSERT INTO admins (username, full_name, role, phone)
VALUES ('admin', 'Main Administrator', 'ADMIN', '+919876543210')
ON CONFLICT (username) DO NOTHING;
