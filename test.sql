select id,username,geo_location from dbo.users

select * from dbo.leave_applications where user_id='e2c7c7f8-6007-f111-832e-000d3af648bd'

update dbo.leave_applications set approver_comments = 'rejected' where id = 'cda4951c-6807-f111-8330-000d3a6cf769'

SELECT name, size * 8/1024 AS [Size (MB)]
FROM sys.database_files;

select * from sys.tables

select * from dbo.employees

select * from dbo.users

select id, first_name, geo_location from dbo.employees

update dbo.employees set geo_location = 'US'
where id in ('0b438f32-1008-f111-832f-000d3afefa4d', 'e9ed58bc-0f08-f111-832f-000d3afefa4d' )

update dbo.users set geo_location='US' 
where id in('e2c7c7f8-6007-f111-832e-000d3af648bd','9c6380d8-0808-f111-832f-000d3afefa4d')

delete from dbo.users where id = '9c6380d8-0808-f111-832f-000d3afefa4d'

update dbo.users set employee_id = '5163c1f5-f367-459f-9273-fb051728276c' where id='8d5c2966-7682-480e-86b5-5477e581619d'

select * from dbo.employees

select * from dbo.timesheets

select * from dbo.leave_applications

update dbo.leave_applications set status = 'approved' where status = 'Approved'

update dbo.timesheets set status = 'draft' where status='Draft'

update dbo.employees set geo_location='US'

update dbo.employees set geo_location='Global' 
where id in ('e9ed58bc-0f08-f111-832f-000d3afefa4d','0b438f32-1008-f111-832f-000d3afefa4d')

select * from dbo.leaves

update dbo.users set role='Admin' where id= '9c6380d8-0808-f111-832f-000d3afefa4d'

delete from dbo.leaves where id = '4219f68e-62c1-4bdd-8323-b2b2e1642323'

update dbo.leaves set leave_type = 'Holiday' where id  = '51d75862-aab6-4074-a861-f07e5f0db9dc'

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Earned Leave', 10, 1, 9, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')

insert into dbo.leaves( leave_type, total_days, used_days, remaining_days, year, user_id) 
values ('Holiday Leave', 10, 2, 8, 2026, '8d5c2966-7682-480e-86b5-5477e581619d')


ALTER TABLE dbo.timesheets DROP CONSTRAINT DF_5323e538db5a38387d8aa302a4f

ALTER TABLE dbo.timesheets ADD CONSTRAINT DF_5323e538db5a38387d8aa302a4f DEFAULT 'draft' FOR status

select * from dbo.users 



select * from timesheets where user_id = 'a29b3f93-de07-f111-832f-000d3a6cbed5'

select * from time_entries where timesheet_id = 'f3df9db6-de07-f111-832f-000d3a6cbed5'

select * from holiday_calendar where client ='Bayer US'