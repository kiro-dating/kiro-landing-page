with ranked_email as (
  select
    id,
    row_number() over (
      partition by lower(btrim(email))
      order by created_at asc nulls last, id asc
    ) as rn
  from waitlist_users
),
ranked_phone as (
  select
    id,
    row_number() over (
      partition by phone
      order by created_at asc nulls last, id asc
    ) as rn
  from waitlist_users
  where phone is not null
),
to_delete as (
  select id from ranked_email where rn > 1
  union
  select id from ranked_phone where rn > 1
)
delete from waitlist_users
where id in (select id from to_delete);

alter table waitlist_users
  add column if not exists email_normalized text
  generated always as (lower(btrim(email))) stored;

create unique index if not exists waitlist_users_email_normalized_idx
  on waitlist_users (email_normalized);

create unique index if not exists waitlist_users_phone_idx
  on waitlist_users (phone)
  where phone is not null;
