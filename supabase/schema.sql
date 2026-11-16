-- ==============================================================================
-- STUDYPILOT PLATFORM: COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Theme: White & Yellow Academic Excellence with Role-Based Access (Staff & Student)
-- Integrates with Cooper AI Assistant & MCP Server
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. ENUMS & DOMAINS
do $$ begin
    create type public.user_role as enum ('staff', 'student');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.doubt_status as enum ('unresolved', 'answered', 'resolved');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.doubt_priority as enum ('low', 'medium', 'high', 'urgent');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.author_role as enum ('staff', 'student', 'cooper_ai');
exception
    when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE (Mirrors and extends auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text not null,
    role public.user_role not null default 'student',
    reg_number text,
    department text,
    avatar_url text,
    phone text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 4. CLASSES / BATCHES TABLE
create table if not exists public.classes (
    id uuid primary key default gen_random_uuid(),
    code text unique not null, -- e.g. "PHY-XII-A", "CS-AI-2026"
    name text not null,        -- e.g. "Advanced Physics Class XII", "Distributed Systems"
    subject text not null,     -- e.g. "Physics", "Computer Science", "Mathematics"
    description text,
    staff_id uuid references public.profiles(id) on delete set null,
    academic_year text default '2026-2027',
    created_at timestamptz default now() not null
);

-- 5. ENROLLMENTS TABLE (Students enrolled in classes)
create table if not exists public.enrollments (
    id uuid primary key default gen_random_uuid(),
    class_id uuid references public.classes(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    enrolled_at timestamptz default now() not null,
    unique(class_id, student_id)
);

-- 6. NOTES TABLE (Notes posted per class by Staff)
create table if not exists public.notes (
    id uuid primary key default gen_random_uuid(),
    class_id uuid references public.classes(id) on delete cascade not null,
    staff_id uuid references public.profiles(id) on delete set null not null,
    title text not null,
    subject text not null,
    content text not null, -- Markdown or rich text
    attachment_url text,   -- URL to Supabase storage bucket 'class-notes'
    tags text[] default '{}',
    is_published boolean default true,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 7. ATTENDANCE TABLE (Daily class attendance marked by Staff)
create table if not exists public.attendance (
    id uuid primary key default gen_random_uuid(),
    class_id uuid references public.classes(id) on delete cascade not null,
    student_id uuid references public.profiles(id) on delete cascade not null,
    date date not null default current_date,
    status public.attendance_status not null default 'present',
    remarks text,
    marked_by uuid references public.profiles(id) on delete set null not null,
    created_at timestamptz default now() not null,
    unique(class_id, student_id, date)
);

-- 8. DOUBTS TABLE (Doubts posted by Students)
create table if not exists public.doubts (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references public.profiles(id) on delete cascade not null,
    class_id uuid references public.classes(id) on delete cascade not null,
    subject text not null,
    title text not null,
    description text not null,
    priority public.doubt_priority not null default 'medium',
    status public.doubt_status not null default 'unresolved',
    tags text[] default '{}',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- 9. DOUBT ANSWERS TABLE (Answers from Staff or Cooper AI)
create table if not exists public.doubt_answers (
    id uuid primary key default gen_random_uuid(),
    doubt_id uuid references public.doubts(id) on delete cascade not null,
    author_id uuid references public.profiles(id) on delete set null,
    author_name text not null,
    author_role public.author_role not null default 'staff',
    answer_text text not null,
    is_official_staff_answer boolean default false,
    created_at timestamptz default now() not null
);

-- 10. COOPER CHAT SESSIONS & MESSAGES (For Cooper AI Assistant)
create table if not exists public.cooper_chat_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text default 'Session with Cooper',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table if not exists public.cooper_chat_messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.cooper_chat_sessions(id) on delete cascade not null,
    sender text check (sender in ('user', 'cooper', 'system')) not null,
    content text not null,
    tool_calls jsonb, -- e.g. [{"tool": "get_user_attendance", "result": {...}}]
    created_at timestamptz default now() not null
);

-- 11. INDEXES FOR HIGH QUERY PERFORMANCE
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_class on public.enrollments(class_id);
create index if not exists idx_notes_class on public.notes(class_id);
create index if not exists idx_notes_created on public.notes(created_at desc);
create index if not exists idx_attendance_student_date on public.attendance(student_id, date desc);
create index if not exists idx_attendance_class_date on public.attendance(class_id, date);
create index if not exists idx_doubts_student on public.doubts(student_id);
create index if not exists idx_doubts_class on public.doubts(class_id);
create index if not exists idx_doubts_status on public.doubts(status);
create index if not exists idx_doubt_answers_doubt on public.doubt_answers(doubt_id);
create index if not exists idx_cooper_messages_session on public.cooper_chat_messages(session_id);

-- 12. HELPER FUNCTIONS FOR RLS POLICIES
create or replace function public.current_user_role()
returns public.user_role as $$
    select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.is_staff()
returns boolean as $$
    select exists (
        select 1 from public.profiles 
        where id = auth.uid() and role = 'staff'
    );
$$ language sql stable security definer;

create or replace function public.is_student()
returns boolean as $$
    select exists (
        select 1 from public.profiles 
        where id = auth.uid() and role = 'student'
    );
$$ language sql stable security definer;

create or replace function public.is_student_enrolled(p_class_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.enrollments 
        where class_id = p_class_id and student_id = auth.uid()
    );
$$ language sql stable security definer;

create or replace function public.is_staff_teaching(p_class_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.classes 
        where id = p_class_id and staff_id = auth.uid()
    );
$$ language sql stable security definer;

-- 13. ENABLE ROW LEVEL SECURITY (RLS) ACROSS ALL TABLES
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.notes enable row level security;
alter table public.attendance enable row level security;
alter table public.doubts enable row level security;
alter table public.doubt_answers enable row level security;
alter table public.cooper_chat_sessions enable row level security;
alter table public.cooper_chat_messages enable row level security;

-- 14. RLS POLICIES DEFINITIONS

-- [PROFILES]
create policy "Public profiles are viewable by authenticated users"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);

-- [CLASSES]
create policy "Authenticated users can view classes"
    on public.classes for select
    to authenticated
    using (true);

create policy "Staff can insert classes"
    on public.classes for insert
    to authenticated
    with check (public.is_staff() and (staff_id = auth.uid() or staff_id is null));

create policy "Staff can update their own classes"
    on public.classes for update
    to authenticated
    using (public.is_staff() and staff_id = auth.uid());

-- [ENROLLMENTS]
create policy "Students can view their own enrollments"
    on public.enrollments for select
    to authenticated
    using (student_id = auth.uid() or public.is_staff());

create policy "Staff can manage enrollments"
    on public.enrollments for all
    to authenticated
    using (public.is_staff());

-- [NOTES]
create policy "Staff can view notes for their classes"
    on public.notes for select
    to authenticated
    using (public.is_staff());

create policy "Students can view published notes for enrolled classes"
    on public.notes for select
    to authenticated
    using (
        is_published = true 
        and (public.is_student_enrolled(class_id) or public.is_staff())
    );

create policy "Staff can insert notes for classes they teach"
    on public.notes for insert
    to authenticated
    with check (
        public.is_staff() 
        and (staff_id = auth.uid())
    );

create policy "Staff can update/delete their own notes"
    on public.notes for update
    to authenticated
    using (public.is_staff() and staff_id = auth.uid());

create policy "Staff can delete their own notes"
    on public.notes for delete
    to authenticated
    using (public.is_staff() and staff_id = auth.uid());

-- [ATTENDANCE]
create policy "Staff can view all attendance for their classes"
    on public.attendance for select
    to authenticated
    using (public.is_staff());

create policy "Students can view ONLY their own attendance"
    on public.attendance for select
    to authenticated
    using (student_id = auth.uid());

create policy "Staff can mark attendance"
    on public.attendance for insert
    to authenticated
    with check (public.is_staff());

create policy "Staff can update attendance"
    on public.attendance for update
    to authenticated
    using (public.is_staff());

-- [DOUBTS]
create policy "Students can view their own doubts or doubts in enrolled classes"
    on public.doubts for select
    to authenticated
    using (
        student_id = auth.uid() 
        or public.is_student_enrolled(class_id)
        or public.is_staff()
    );

create policy "Students can post doubts"
    on public.doubts for insert
    to authenticated
    with check (
        public.is_student() 
        and student_id = auth.uid()
    );

create policy "Students can update their own doubts, staff can update status"
    on public.doubts for update
    to authenticated
    using (
        student_id = auth.uid() 
        or public.is_staff()
    );

-- [DOUBT ANSWERS]
create policy "Users can view answers for accessible doubts"
    on public.doubt_answers for select
    to authenticated
    using (
        exists (
            select 1 from public.doubts d
            where d.id = doubt_answers.doubt_id
            and (
                d.student_id = auth.uid()
                or public.is_student_enrolled(d.class_id)
                or public.is_staff()
            )
        )
    );

create policy "Staff and Students can post answers to doubts"
    on public.doubt_answers for insert
    to authenticated
    with check (
        auth.uid() = author_id 
        or author_role = 'cooper_ai'
    );

-- [COOPER CHAT SESSIONS & MESSAGES]
create policy "Users can view their own Cooper chat sessions"
    on public.cooper_chat_sessions for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can manage their own Cooper chat sessions"
    on public.cooper_chat_sessions for all
    to authenticated
    using (user_id = auth.uid());

create policy "Users can view messages from their sessions"
    on public.cooper_chat_messages for select
    to authenticated
    using (
        exists (
            select 1 from public.cooper_chat_sessions s
            where s.id = cooper_chat_messages.session_id
            and s.user_id = auth.uid()
        )
    );

create policy "Users can insert messages into their sessions"
    on public.cooper_chat_messages for insert
    to authenticated
    with check (
        exists (
            select 1 from public.cooper_chat_sessions s
            where s.id = cooper_chat_messages.session_id
            and s.user_id = auth.uid()
        )
    );

-- 15. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name, role, avatar_url)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
        coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
    )
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- 16. STORAGE BUCKET CONFIGURATION (For Notes Attachments)
insert into storage.buckets (id, name, public)
values ('class-notes', 'class-notes', true)
on conflict (id) do update set public = true;

-- Allow read access to class-notes for all users
drop policy if exists "Public Access to Class Notes Bucket" on storage.objects;
drop policy if exists "Allow read on class-notes bucket" on storage.objects;
create policy "Allow read on class-notes bucket"
    on storage.objects for select
    using (bucket_id = 'class-notes');

-- Allow authenticated staff to upload to class-notes bucket
drop policy if exists "Staff Uploads to Class Notes Bucket" on storage.objects;
drop policy if exists "Allow staff upload to class-notes bucket" on storage.objects;
create policy "Allow staff upload to class-notes bucket"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'class-notes' and public.is_staff());

-- Allow staff update (required for storage upsert)
drop policy if exists "Allow staff update to class-notes bucket" on storage.objects;
create policy "Allow staff update to class-notes bucket"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'class-notes' and public.is_staff())
    with check (bucket_id = 'class-notes' and public.is_staff());

-- Allow staff to delete attachments
drop policy if exists "Allow staff delete from class-notes bucket" on storage.objects;
create policy "Allow staff delete from class-notes bucket"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'class-notes' and public.is_staff());
