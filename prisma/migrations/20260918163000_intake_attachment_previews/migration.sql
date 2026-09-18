alter table public.intake_attachments
  add column preview_content bytea,
  add column preview_mime_type text,
  add column preview_file_size integer;