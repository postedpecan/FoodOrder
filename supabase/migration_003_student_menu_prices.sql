-- Convert legacy demo prices into student-friendly Thai-baht tiers.
-- Existing prices already at ฿25 or above are left unchanged.
-- With the current 103 demo items this produces a ฿34.81 average.

update public.menu_items
set price = case
  when price <= 2.50 then 25
  when price <= 3.50 then 30
  when price <= 5.00 then 35
  when price <= 8.50 then 40
  when price <= 9.50 then 45
  else 50
end
where price < 25;
