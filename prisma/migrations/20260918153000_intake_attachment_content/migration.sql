alter table public.intake_attachments add column content bytea;
update public.intake_attachments set content = decode('', 'hex') where content is null;
alter table public.intake_attachments alter column content set not null;