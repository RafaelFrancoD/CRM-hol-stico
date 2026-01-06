-- Enable Row-Level Security and remove public access for CRM tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON patients FROM PUBLIC;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'finance') THEN
    ALTER TABLE finance ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON finance FROM PUBLIC;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON appointments FROM PUBLIC;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON documents FROM PUBLIC;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_templates') THEN
    ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON message_templates FROM PUBLIC;
  END IF;
END$$;

-- Note: service_role bypasses RLS; keep service_role secrets only on server-side.
