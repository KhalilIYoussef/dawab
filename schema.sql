-- =============================================================================
-- Dawab (دواب) - Livestock Investment Platform Database Schema (PostgreSQL DDL)
-- Version: 1.0.0
-- Generated for: Backend Database Setup
-- Compatible with: PostgreSQL 14+
-- =============================================================================

-- Enable UUID extension for UUID primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'BREEDER',
    'INVESTOR'
);

CREATE TYPE user_status AS ENUM (
    'PENDING',
    'ACTIVE',
    'REJECTED',
    'SUSPENDED'
);

CREATE TYPE cycle_status AS ENUM (
    'PENDING',     -- Waiting for Admin approval / in funding phase
    'ACTIVE',      -- Funded & Fattening stage in progress
    'COMPLETED',   -- Animals sold, profit settled
    'REJECTED',    -- Rejected by Admin
    'CANCELLED'    -- Cancelled before funding completion
);

CREATE TYPE investment_status AS ENUM (
    'PENDING_APPROVAL', -- Receipt uploaded, waiting for Admin bank verification
    'APPROVED',         -- Confirmed by Admin, funds credited to cycle
    'REJECTED',         -- Invalid transfer or rejected by Admin
    'REFUNDED'          -- Refunded to investor
);

CREATE TYPE policy_type AS ENUM (
    'BARN_INSURANCE',       -- Fixed barn insurance for breeder (e.g., 750 EGP)
    'ANIMAL_LIFE_INSURANCE' -- Animal life & epidemic insurance for investor (e.g., 3%)
);

CREATE TYPE policy_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'CLAIMED',
    'CANCELLED'
);

CREATE TYPE claim_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE vet_record_type AS ENUM (
    'VACCINE',   -- تحصين وقائي
    'TREATMENT'  -- علاج طارئ
);

CREATE TYPE feed_category AS ENUM (
    'ENERGY',    -- علف مركز (ذرة، صويا، رَدّة...)
    'ROUGHAGE',  -- مواد خشنة (سيلاج، دريس، تبن، قش، برسيم...)
    'ADDITIVE'   -- إضافات (أملاح، خميرة، فيتامينات...)
);

-- =============================================================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. CORE USER & PROFILE TABLES
-- =============================================================================

-- Base Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'INVESTOR',
    status user_status NOT NULL DEFAULT 'PENDING',
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for users.updated_at
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Breeder Profiles (Farm metadata, physical paper audits, location)
CREATE TABLE breeder_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(150),
    governorate VARCHAR(100), -- الشرقية، الفيوم، البحيرة...
    address TEXT,
    google_maps_url VARCHAR(500),
    space_limit INT NOT NULL DEFAULT 10 CHECK (space_limit >= 0),
    available_space INT NOT NULL DEFAULT 10 CHECK (available_space >= 0),
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    
    -- Security & Physical Fraud Prevention
    criminal_record_url VARCHAR(500), -- الفيش الجنائي
    physical_papers_sent BOOLEAN NOT NULL DEFAULT FALSE,
    physical_papers_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_breeder_profiles_updated_at
BEFORE UPDATE ON breeder_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Digital KYC & Banking Data (Investors and Breeders)
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(30) UNIQUE,
    bank_name VARCHAR(100),
    iban VARCHAR(50),
    id_card_front_url VARCHAR(500),
    id_card_back_url VARCHAR(500),
    contract_url VARCHAR(500), -- Signed master contract
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_kyc_documents_updated_at
BEFORE UPDATE ON kyc_documents
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- =============================================================================
-- 4. CYCLES (دورات التسمين) & FATTENING PLANS
-- =============================================================================

CREATE TABLE cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breeder_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    animal_type VARCHAR(100) NOT NULL, -- عجل هولشتاين، خروف برقي، عساف...
    initial_weight NUMERIC(8, 2) NOT NULL CHECK (initial_weight > 0),
    target_weight NUMERIC(8, 2) NOT NULL CHECK (target_weight > initial_weight),
    
    -- Financials & Heads count
    total_heads INT NOT NULL DEFAULT 1 CHECK (total_heads > 0),
    available_heads INT NOT NULL DEFAULT 1 CHECK (available_heads >= 0),
    start_price_per_head NUMERIC(12, 2) NOT NULL CHECK (start_price_per_head >= 0),
    funding_goal NUMERIC(12, 2) NOT NULL CHECK (funding_goal > 0),
    current_funding NUMERIC(12, 2) NOT NULL DEFAULT 0.0 CHECK (current_funding >= 0),
    
    -- Schedule
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_duration_days INT NOT NULL CHECK (expected_duration_days > 0),
    actual_end_date DATE,
    
    status cycle_status NOT NULL DEFAULT 'PENDING',
    
    -- Media & Verification
    image_url VARCHAR(500) NOT NULL,
    health_cert_url VARCHAR(500),
    description TEXT NOT NULL,
    admin_note TEXT,
    
    -- Barn Insurance (Breeder side)
    is_barn_insured BOOLEAN NOT NULL DEFAULT FALSE,
    barn_insurance_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (barn_insurance_cost >= 0),
    insurance_policy_number VARCHAR(100),
    
    -- Cycle Completion / Sales
    final_sale_price NUMERIC(12, 2) CHECK (final_sale_price >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_cycles_updated_at
BEFORE UPDATE ON cycles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Standard Feeding Plan Stages per Cycle
CREATE TABLE fattening_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    stage_order INT NOT NULL, -- 1, 2, 3...
    stage_name VARCHAR(100) NOT NULL, -- مرحلة التحضين، مرحلة النمو، مرحلة التشطيب
    feed_concentrate_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.0 CHECK (feed_concentrate_kg >= 0),
    roughage_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.0 CHECK (roughage_kg >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Veterinary Vaccine Roadmap for Cycle
CREATE TABLE cycle_vaccine_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(150) NOT NULL, -- حمى قلاعية، جلد عقدي، كلوسترديا...
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    recommended_day_offset INT, -- Day of cycle when vaccine should be administered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. INVESTMENTS & CONTRACTS
-- =============================================================================

CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
    
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    heads_count INT NOT NULL DEFAULT 1 CHECK (heads_count > 0),
    
    -- Fee Calculations
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (platform_fee >= 0), -- 2.5%
    has_animal_insurance BOOLEAN NOT NULL DEFAULT TRUE,
    animal_insurance_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (animal_insurance_fee >= 0), -- 3.0%
    total_paid NUMERIC(12, 2) NOT NULL CHECK (total_paid >= amount),
    
    -- Payment Verification
    transfer_receipt_url VARCHAR(500),
    bank_reference_number VARCHAR(100),
    status investment_status NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_investments_updated_at
BEFORE UPDATE ON investments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Head-level Contracts (Unique Contract Code per Head: DW-101-01)
CREATE TABLE contract_heads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
    contract_code VARCHAR(100) NOT NULL UNIQUE, -- e.g. DW-101-01
    head_index INT NOT NULL DEFAULT 1,
    pdf_contract_url VARCHAR(500),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. PRODUCTION MONITORING & DAILY LOGS (متابعة الإنتاج والتحصينات)
-- =============================================================================

CREATE TABLE cycle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_weight NUMERIC(8, 2) CHECK (current_weight > 0),
    food_summary TEXT NOT NULL DEFAULT 'تغذية روتينية',
    water_liters INT CHECK (water_liters >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_cycle_logs_updated_at
BEFORE UPDATE ON cycle_logs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Detail breakdown of feed consumed per daily log
CREATE TABLE log_feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES cycle_logs(id) ON DELETE CASCADE,
    category feed_category NOT NULL DEFAULT 'ENERGY',
    item_name VARCHAR(100) NOT NULL, -- ذرة، صويا، برسيم، سيلاج...
    quantity NUMERIC(6, 2) NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'كجم' -- كجم، لتر، جرام
);

-- Veterinary Actions recorded during daily logs
CREATE TABLE log_vet_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES cycle_logs(id) ON DELETE CASCADE,
    record_type vet_record_type NOT NULL DEFAULT 'VACCINE',
    title VARCHAR(150) NOT NULL, -- تحصين FMD، تجريع ديدان، خافض حرارة...
    dosage VARCHAR(50),
    notes TEXT,
    administered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cycle Log Images (Proof photos / growth updates)
CREATE TABLE cycle_log_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES cycle_logs(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 7. INSURANCE FUND & POLICIES (صندوق التأمين الشامل)
-- =============================================================================

CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    policy_type policy_type NOT NULL,
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE RESTRICT,
    investment_id UUID REFERENCES investments(id) ON DELETE SET NULL, -- Null if Barn Insurance
    premium_amount NUMERIC(10, 2) NOT NULL CHECK (premium_amount >= 0),
    coverage_details TEXT,
    status policy_status NOT NULL DEFAULT 'ACTIVE',
    starts_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES insurance_policies(id) ON DELETE RESTRICT,
    claimant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    incident_date DATE NOT NULL,
    incident_type VARCHAR(100) NOT NULL, -- نفوق طبيعي، مرض وبائي، حريق حظيرة...
    description TEXT NOT NULL,
    claim_amount NUMERIC(12, 2) NOT NULL CHECK (claim_amount > 0),
    approved_amount NUMERIC(12, 2) DEFAULT 0.0 CHECK (approved_amount >= 0),
    status claim_status NOT NULL DEFAULT 'PENDING',
    vet_inspection_report_url VARCHAR(500),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. CYCLE SETTLEMENTS & PROFIT DISTRIBUTION (تسوية الأرباح)
-- =============================================================================

CREATE TABLE cycle_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL UNIQUE REFERENCES cycles(id) ON DELETE RESTRICT,
    settled_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    total_revenue NUMERIC(12, 2) NOT NULL CHECK (total_revenue > 0),
    initial_funding NUMERIC(12, 2) NOT NULL CHECK (initial_funding > 0),
    gross_profit NUMERIC(12, 2) NOT NULL, -- total_revenue - initial_funding
    
    platform_commission NUMERIC(10, 2) NOT NULL DEFAULT 0.0 CHECK (platform_commission >= 0),
    breeder_payout NUMERIC(12, 2) NOT NULL CHECK (breeder_payout >= 0),
    total_investors_payout NUMERIC(12, 2) NOT NULL CHECK (total_investors_payout >= 0),
    
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual investor payout item under cycle settlement
CREATE TABLE settlement_investor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES cycle_settlements(id) ON DELETE CASCADE,
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE RESTRICT,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    capital_returned NUMERIC(12, 2) NOT NULL CHECK (capital_returned >= 0),
    profit_share NUMERIC(12, 2) NOT NULL CHECK (profit_share >= 0),
    total_payout NUMERIC(12, 2) NOT NULL CHECK (total_payout >= 0),
    
    is_transferred BOOLEAN NOT NULL DEFAULT FALSE,
    transfer_reference VARCHAR(100),
    transferred_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 9. AI ANALYSIS & RISK LOGS (سجل تحليلات Gemini)
-- =============================================================================

CREATE TABLE ai_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
    model_version VARCHAR(50) NOT NULL DEFAULT 'gemini-3-pro-preview',
    prompt_payload TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    risk_score NUMERIC(3, 1), -- e.g. 1.0 to 10.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. PERFORMANCE INDEXES
-- =============================================================================

-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Cycles
CREATE INDEX idx_cycles_breeder_id ON cycles(breeder_id);
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_cycles_animal_type ON cycles(animal_type);
CREATE INDEX idx_cycles_created_at ON cycles(created_at DESC);

-- Investments
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_cycle_id ON investments(cycle_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Contract Heads
CREATE INDEX idx_contract_heads_code ON contract_heads(contract_code);
CREATE INDEX idx_contract_heads_investment ON contract_heads(investment_id);

-- Logs
CREATE INDEX idx_cycle_logs_cycle_id ON cycle_logs(cycle_id);
CREATE INDEX idx_cycle_logs_date ON cycle_logs(log_date DESC);
CREATE INDEX idx_log_feed_items_log_id ON log_feed_items(log_id);
CREATE INDEX idx_log_vet_records_log_id ON log_vet_records(log_id);

-- Insurance
CREATE INDEX idx_insurance_policies_cycle ON insurance_policies(cycle_id);
CREATE INDEX idx_insurance_policies_type ON insurance_policies(policy_type);
CREATE INDEX idx_insurance_policies_number ON insurance_policies(policy_number);
CREATE INDEX idx_insurance_claims_policy ON insurance_claims(policy_id);

-- Settlements
CREATE INDEX idx_cycle_settlements_cycle ON cycle_settlements(cycle_id);
CREATE INDEX idx_settlement_payouts_investor ON settlement_investor_payouts(investor_id);

-- =============================================================================
-- 11. INITIAL SEED DATA (MOCK USERS & DATA)
-- =============================================================================

-- Password Hash for '123' (Sample bcrypt for demo purposes: $2a$10$abcdefg...)
-- In real app: use bcrypt hashed string.

INSERT INTO users (id, name, phone, password_hash, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'المدير العام (أدمن)', '01000000001', '$2b$10$YourHashedPasswordHereAdmin123', 'ADMIN', 'ACTIVE'),
('00000000-0000-0000-0000-000000000002', 'مزرعة الحاج متولي', '01200000002', '$2b$10$YourHashedPasswordHereBreeder1', 'BREEDER', 'ACTIVE'),
('00000000-0000-0000-0000-000000000003', 'عزبة أولاد رجب', '01100000003', '$2b$10$YourHashedPasswordHereBreeder2', 'BREEDER', 'PENDING'),
('00000000-0000-0000-0000-000000000004', 'أحمد المستثمر', '01500000004', '$2b$10$YourHashedPasswordHereInvestor', 'INVESTOR', 'ACTIVE'),
('00000000-0000-0000-0000-000000000005', 'منى محمد', '01055555555', '$2b$10$YourHashedPasswordHereInvestor2', 'INVESTOR', 'PENDING');

-- Breeder Profiles
INSERT INTO breeder_profiles (user_id, farm_name, governorate, space_limit, available_space, rating, physical_papers_sent, physical_papers_verified) VALUES
('00000000-0000-0000-0000-000000000002', 'مزرعة الحاج متولي', 'الشرقية', 50, 30, 4.80, TRUE, TRUE),
('00000000-0000-0000-0000-000000000003', 'عزبة أولاد رجب', 'الفيوم', 20, 20, 0.00, TRUE, FALSE);

-- KYC Documents
INSERT INTO kyc_documents (user_id, national_id, bank_name, iban, is_verified) VALUES
('00000000-0000-0000-0000-000000000002', '28001011234567', 'البنك الأهلي المصري', 'EG12000200010000000000000005', TRUE),
('00000000-0000-0000-0000-000000000004', '29012011234567', 'بنك مصر', 'EG55000300010000000000000009', TRUE);
