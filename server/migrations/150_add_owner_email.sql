-- Add owner_email column to CRM tables for per-user ownership
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_patients_owner_email ON patients(owner_email);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'finance') THEN
    ALTER TABLE finance ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_finance_owner_email ON finance(owner_email);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_appointments_owner_email ON appointments(owner_email);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_documents_owner_email ON documents(owner_email);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    ALTER TABLE message_templates ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);
    CREATE INDEX IF NOT EXISTS idx_message_templates_owner_email ON message_templates(owner_email);
  END IF;
END$$;
