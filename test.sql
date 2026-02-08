select * from dbo.users

select * from dbo.leaves

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Earned Leave', 10, 1, 9, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Holiday Leave', 10, 2, 8, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')