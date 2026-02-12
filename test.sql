select * from dbo.users

delete from dbo.time_entries

delete from dbo.timesheets

delete from dbo.users where id = '9c6380d8-0808-f111-832f-000d3afefa4d'

update dbo.users set employee_id = '5163c1f5-f367-459f-9273-fb051728276c' where id='8d5c2966-7682-480e-86b5-5477e581619d'

select * from dbo.employees

select * from dbo.leaves

update dbo.users set role='Admin' where id= '9c6380d8-0808-f111-832f-000d3afefa4d'

delete from dbo.leaves where id = '4219f68e-62c1-4bdd-8323-b2b2e1642323'

update dbo.leaves set leave_type = 'Holiday' where id  = '51d75862-aab6-4074-a861-f07e5f0db9dc'

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Earned Leave', 10, 1, 9, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Holiday Leave', 10, 2, 8, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')