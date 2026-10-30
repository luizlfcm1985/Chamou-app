-- Chamou: banco de dados. Cole no Supabase em SQL Editor > New query > Run.
-- Rode uma vez. Pode rodar de novo sem quebrar (usa "if not exists" e "create or replace").

create extension if not exists pgcrypto;

-- ============ Tabelas ============

-- Um currículo por pessoa (a versão 1 do app guarda um só).
create table if not exists public.resumes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  template   text  not null default 'classico',
  updated_at timestamptz not null default now()
);

-- Pedidos de compra. user_id vira nulo se a pessoa apagar a conta (o registro financeiro fica).
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  items        text[] not null,
  amount_cents integer not null check (amount_cents > 0),
  status       text not null default 'pending' check (status in ('pending', 'paid')),
  mp_payment_id text unique,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);
create index if not exists orders_user_idx on public.orders(user_id);

-- O que cada pessoa já pode usar.
create table if not exists public.entitlements (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  can_download         boolean not null default false,
  ai_credits           integer not null default 0 check (ai_credits >= 0),
  cover_letter_credits integer not null default 0 check (cover_letter_credits >= 0),
  linkedin_credits     integer not null default 0 check (linkedin_credits >= 0)
);

-- Fila do serviço pessoal (upsell).
create table if not exists public.service_orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  order_id         uuid references public.orders(id) on delete set null,
  status           text not null default 'aguardando_dados'
                   check (status in ('aguardando_dados', 'recebido', 'em_producao', 'entregue')),
  brief            text,
  whatsapp         text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists service_orders_status_idx on public.service_orders(status);

-- ============ Regras de acesso (RLS) ============
alter table public.resumes        enable row level security;
alter table public.orders         enable row level security;
alter table public.entitlements   enable row level security;
alter table public.service_orders enable row level security;

drop policy if exists resumes_own on public.resumes;
create policy resumes_own on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists orders_read_own on public.orders;
create policy orders_read_own on public.orders for select using (auth.uid() = user_id);

drop policy if exists entitlements_read_own on public.entitlements;
create policy entitlements_read_own on public.entitlements for select using (auth.uid() = user_id);

drop policy if exists service_orders_read_own on public.service_orders;
create policy service_orders_read_own on public.service_orders for select using (auth.uid() = user_id);

-- Escrita em orders, entitlements e service_orders: só o servidor (chave service_role).

-- ============ Funções ============

-- Confirma o pagamento e libera o que foi comprado. Segura para chamar mais de uma vez.
create or replace function public.fulfill_order(p_order uuid, p_payment text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then
    return false;
  end if;
  if o.status = 'paid' then
    return true;
  end if;

  update public.orders
     set status = 'paid', mp_payment_id = p_payment, paid_at = now()
   where id = p_order;

  if o.user_id is null then
    return true;
  end if;

  insert into public.entitlements(user_id) values (o.user_id) on conflict (user_id) do nothing;

  if 'base' = any(o.items) then
    update public.entitlements set can_download = true where user_id = o.user_id;
  end if;
  if 'ia' = any(o.items) then
    update public.entitlements
       set ai_credits = ai_credits + 3, cover_letter_credits = cover_letter_credits + 1
     where user_id = o.user_id;
  end if;
  if 'linkedin' = any(o.items) then
    update public.entitlements set linkedin_credits = linkedin_credits + 1 where user_id = o.user_id;
  end if;
  if 'pessoal' = any(o.items) then
    insert into public.service_orders(user_id, order_id) values (o.user_id, o.id);
  end if;

  return true;
end;
$$;

-- Gasta 1 crédito de forma atômica. Devolve false se não houver saldo.
create or replace function public.consume_credit(p_user uuid, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  if p_kind = 'ai' then
    update public.entitlements set ai_credits = ai_credits - 1 where user_id = p_user and ai_credits > 0;
  elsif p_kind = 'cover' then
    update public.entitlements set cover_letter_credits = cover_letter_credits - 1 where user_id = p_user and cover_letter_credits > 0;
  elsif p_kind = 'linkedin' then
    update public.entitlements set linkedin_credits = linkedin_credits - 1 where user_id = p_user and linkedin_credits > 0;
  else
    return false;
  end if;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

-- Devolve 1 crédito (quando a IA falha depois de o crédito ter sido gasto).
create or replace function public.refund_credit(p_user uuid, p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'ai' then
    update public.entitlements set ai_credits = ai_credits + 1 where user_id = p_user;
  elsif p_kind = 'cover' then
    update public.entitlements set cover_letter_credits = cover_letter_credits + 1 where user_id = p_user;
  elsif p_kind = 'linkedin' then
    update public.entitlements set linkedin_credits = linkedin_credits + 1 where user_id = p_user;
  end if;
end;
$$;

-- As funções só podem ser chamadas pelo servidor.
revoke all on function public.fulfill_order(uuid, text)   from public, anon, authenticated;
revoke all on function public.consume_credit(uuid, text)  from public, anon, authenticated;
revoke all on function public.refund_credit(uuid, text)   from public, anon, authenticated;
grant execute on function public.fulfill_order(uuid, text)  to service_role;
grant execute on function public.consume_credit(uuid, text) to service_role;
grant execute on function public.refund_credit(uuid, text)  to service_role;
