Contents

Employee Project, Task & Performance Management System  1

System Requirements & Design Documentation . . . . . . . . . . . . . . . . . . . . . 1

1. Executive Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1

2. Objectives . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 1

3. Roles & Permissions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 2

4. Role Hierarchy & Access Model . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

5. Major System Modules . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3

6. Recommended Page / Screen Structure . . . . . . . . . . . . . . . . . . . . . . . . 6

7. Superior Dashboard (Central Hub) . . . . . . . . . . . . . . . . . . . . . . . . . . 7

8. Core Database Relationships (Entity Overview) . . . . . . . . . . . . . . . . . . . 7

9. Complete System Workflow . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 7

11. Recommended Architecture . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8

12. Naming Recommendation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8

Employee Project, Task & Performance Management Sys-
tem

System Requirements & Design Documentation

Version: 1.0 Prepared for: Internal Project Planning Document Type: Functional & Tech-
nical Specification

1. Executive Summary

This system manages a company’s projects across their entire lifecycle — from the moment
a Superior assigns a project, through team formation, daily task execution, time tracking, and
task/module completion, all the way to employee performance analytics and reporting.

The core principle driving this design is that the system must maintain one unbroken
chain of accountability:

Superior → Project → Team → Team Lead → Team Members →
Daily Tasks → Time Tracking → Task Completion →
Module Completion → Employee Performance → Reports

This is not a simple to-do/task tracker. It is a Project Lifecycle, Team Task Management,
Time Tracking, and Employee Performance Analytics Platform. Every entity in the
system is traceable back to the project it originated from and forward to the performance
data it produces — nothing exists in isolation.

2. Objectives

    • Give a Superior full visibility from project assignment down to individual task-level effort.
    • Give Team Leads the tools to break projects into modules and tasks, assign daily work,

       and review completion.
    • Give Employees a simple, focused view of what they need to do each day, with time

       tracking built in.
    • Convert raw task and time data into meaningful performance analytics and reports at

       the individual, team, and project level.

                                                                      1
• Preserve full historical/audit trail so any data point can be traced back to who did what,
   when, and how long it took.

3. Roles & Permissions

The system is built around three primary roles, each with a distinct scope of responsibility.

3.1 Superior / Manager
Highest level of project-management authority.

Capability                                                               Description
Create Projects
                                                                         Define new projects with scope, timeline,
Assign Projects                                                          and priority
Create/Select Teams                                                      Assign a project to a specific team
                                                                         Form new teams or select existing ones for a
Assign Team Lead                                                         project
View All Employees                                                       Designate a Team Lead per team/project
                                                                         Company-wide employee directory and
View Project Progress                                                    status
                                                                         Real-time progress at project, module, and
View Team Performance                                                    task level
View Individual Performance                                              Aggregate team-level KPIs
View Completed/Pending Tasks                                             Drill down into any employee’s metrics
View Time Utilization                                                    Full task-status visibility across all projects
Generate Reports                                                         Estimated vs. actual hours across the org
                                                                         Export/generate reports at any level of the
                                                                         hierarchy

3.2 Team Lead
Manages the team assigned to a specific project.

Capability                                                               Description

View Assigned Project                                                    See project scope and deadlines
View Team Members                                                        Roster of employees under their lead
Divide Project into Modules                                              Break the project into logical modules
Create Tasks                                                             Define tasks under each module
Assign Tasks to Employees                                                Distribute tasks to individual team members
Set Expected Completion Time                                             Estimate effort/duration per task
Monitor Daily Work                                                       Review the day’s work plan across the team
Track Task Status                                                        Follow tasks through their lifecycle
Review Completed Tasks                                                   Inspect submitted work
Approve/Reject Completed Work                                            Quality gate before a task counts as “Done”
Monitor Module Progress                                                  Roll-up view of module completion
View Team Performance                                                    Team-level KPI dashboard

3.3 Team Member / Employee
Executes assigned work.

                                                                      2
Capability            Description

View Assigned Tasks   Personal task list
View Task Details     Full task description, priority, deadline
Start Task            Begin time tracking on a task
Pause/Resume Task     Handle interruptions without losing
                      time-tracking accuracy
Complete Task         Mark task as done and submit for review
Enter Remarks         Add notes/comments on the work done
Upload Work/Evidence  Attach files/screenshots as proof of work, if
                      required
View Task History     Personal history of all past tasks
View Own Performance  Personal KPI dashboard

4. Role Hierarchy & Access Model

                                      ┌───────────────┐
                                      │ Superior │ (Full org visibility)
                                      │ / Manager │
                                      └───────┬───────┘

                                                     │ assigns project + team
                                                     ▼
                                      ┌───────────────┐
                                      │ Team Lead │ (Team + project scope)
                                      └───────┬───────┘
                                                     │ assigns tasks
                                                     ▼
                                      ┌───────────────┐
                                      │ Team Member(s)│ (Own tasks only)
                                      └───────────────┘

Access is strictly role-based (RBAC): a Team Lead can only see teams/projects they are as-
signed to; an Employee can only see and act on tasks assigned to them.

5. Major System Modules

The application is organized into 12 core modules:

   1. Authentication & Authorization
   2. Employee Management
   3. Team Management
   4. Project Management
   5. Project Module Management
   6. Task Management
   7. Daily Task Assignment
   8. Time Tracking
   9. Task Status Management
 10. Project Progress Tracking
 11. Employee Performance
 12. Performance Analytics & Reports

Each is detailed below.

                                                                      3
Module 1 — Authentication & Authorization

    • Login / Logout
    • Role-based access control (Superior / Team Lead / Employee)
    • Password management (reset, change, policy enforcement)
    • Session management (JWT-based, with secure HTTP-only cookies)

Module 2 — Employee Management

Central directory of all company employees.
Employee record fields: - Employee ID - Name - Email - Phone - Department - Designation
- Joining Date - Role (Superior / Team Lead / Employee) - Account Status (Active / Inactive)

Module 3 — Team Management

Formation and administration of teams.

Functions: - Create team - Assign Team Lead - Add members - Remove members - Change
Team Lead - View team details

Team record fields: Team ID, Team Name, Team Lead, Members[], Associated Project(s),
Status.

Module 4 — Project Management

Where the entire chain begins. The Superior creates and assigns a project.

Project record fields: - Project ID - Project Name - Description - Client / Department (if
applicable) - Assigned Team - Start Date - Deadline - Priority (Low / Medium / High) - Status:
Not Started → In Progress → On Hold → Completed → Cancelled - Overall Progress %

Module 5 — Project Module Management

Large projects are broken into logical modules (e.g., “User Authentication,” “Payment Gate-
way,” “Reporting Dashboard”).

Module record fields: - Module Name - Description - Assigned Employees - Start Date -
Expected Completion Date - Estimated Hours - Actual Hours - Status - Progress %

Module 6 — Task Management
Each project module is broken into individual tasks, created and assigned by the Team Lead.

Field              Purpose

Task ID            Unique identifier
Task Name          Task title
Description        Task details
Assigned Employee  Person responsible
Assigned By        Team Lead who created it
Priority           Low / Medium / High
Start Date         Planned start
Due Date           Expected completion
Estimated Hours    Expected effort
Actual Hours       Effort actually spent (from Time Tracking)
Status             Current lifecycle state

                   4
Field       Purpose
Remarks     Notes, blockers, context

Module 7 — Daily Task Assignment
Directly addresses the need to see what each employee is doing, each day.
Each day, the Team Lead builds a Daily Work Plan:

Employee    Task                          Planned Hours  Priority  Status

Employee A  Task 12 – API Integration     4h             High      In Progress
Employee B  Task 15 – UI Review           2h             Medium    Pending

This gives the Team Lead a single-page view of the entire team’s day, and rolls up into
weekly/monthly views for the Superior.

Module 8 — Time Tracking

Directly addresses the requirement: “task taken in which time and how much time will be
taken.”
Per-task time entries capture: - Start timestamp - Pause/resume timestamps (if applicable)
- End timestamp - Total time spent (auto-calculated)
The system automatically calculates: - Actual Time Spent = Σ(all tracked intervals) - Vari-
ance = Actual Time − Estimated Time - Efficiency % = Estimated Time / Actual Time × 100
And compares: - Estimated vs. Actual hours (per task, per module, per employee, per
project)
This data feeds directly into the Performance module.

Module 9 — Task Status Management

A richer status model than simple Completed/Not Completed:
    • Not Started
    • In Progress
    • Paused
    • Submitted for Review
    • Approved / Completed
    • Rejected — Rework Required
    • Delayed (past due date, still open)
    • Blocked (waiting on dependency, input, or approval)

This gives far more useful tracking granularity than a binary status.

Module 10 — Project Progress Tracking

Progress rolls up the hierarchy:

Task Progress → Module Progress → Project Progress
    • Module Progress % = (Completed Task Weight / Total Task Weight) × 100
    • Project Progress % = weighted average of all Module Progress values

                                       5
This gives Superiors a live, accurate view of where every project stands without needing
manual status updates.

Module 11 — Employee Performance

When a Superior or Team Lead selects an employee, they see a consolidated performance
profile:

    • Basic Information — name, role, department, team
    • KPI Cards — tasks completed, on-time %, average delay, rework rate
    • Time Analysis — estimated vs. actual hours, efficiency trend
    • Performance Score — composite metric derived from completion rate, timeliness, and

       quality (approval/rejection ratio)

Module 12 — Performance Analytics & Reports

The analytics layer that turns raw data into decisions.
The Superior can select a scope (employee / team / project / date range) and view: - Daily
performance trends - Monthly performance trends - Task distribution (by priority, by status,
by employee) - Time utilization heatmaps - Exportable reports (PDF / Excel / CSV)

6. Recommended Page / Screen Structure

6.1 Public / Authentication

    • Login
    • Forgot Password / Reset Password

6.2 Superior Pages

    • Superior Dashboard (central landing page — see §7)
    • All Projects
    • Create Project
    • Project Detail (modules, teams, progress)
    • All Teams
    • Create Team
    • All Employees
    • Employee Detail / Performance Profile
    • Reports & Analytics
    • Settings

6.3 Team Lead Pages

    • Team Lead Dashboard
    • My Project(s)
    • Module Management (create/edit modules)
    • Task Management (create/assign tasks)
    • Daily Work Plan
    • Task Review & Approval Queue
    • Team Performance

                                                                      6
6.4 Employee Pages

    • Employee Dashboard
    • My Tasks
    • Task Detail (with start/pause/resume/complete controls)
    • Task History
    • My Performance

7. Superior Dashboard (Central Hub)

The Superior Dashboard is the most important page in the system — a single-screen summary
of the entire organization’s project health.
Suggested widgets: - Active Projects overview (progress bars) - Projects at risk (de-
layed/blocked task counts) - Team performance leaderboard - Time utilization summary
(estimated vs. actual, org-wide) - Pending approvals count - Recent activity feed - Quick-
access report generation

8. Core Database Relationships (Entity Overview)

Employee ──< TeamMembership >── Team
Team ──< assigned to >── Project (assigned by Superior)
Team ── has one ── TeamLead (an Employee)
Project ──< has many >── ProjectModule
ProjectModule ──< has many >── Task
Task ── assigned to ── Employee
Task ──< has many >── TimeEntry
Task ──< has many >── Remark / Attachment
Employee ──< has many >── PerformanceRecord (derived)
Supporting audit/history layer:
AuditLog: entity_type, entity_id, action, performed_by, timestamp, old_value, new_value
This history layer is essential — it lets a Superior reconstruct exactly what an employee did
and when, at any point in the project’s lifecycle.

9. Complete System Workflow

   1. Superior creates a Project and defines its scope, timeline, and priority.
   2. Superior creates/selects a Team and assigns a Team Lead.
   3. Superior assigns the Project to the Team.
   4. Team Lead breaks the Project into Modules.
   5. Team Lead breaks each Module into Tasks and assigns them to Team Members, setting

       estimated hours and due dates.
   6. Team Lead builds the Daily Work Plan distributing tasks across the team.
   7. Team Members start tasks, tracking time as they work (pause/resume as needed).
   8. Team Members complete tasks, add remarks, and optionally upload evidence.
   9. Team Lead reviews submitted work and approves or rejects it.
 10. Approved tasks roll up into Module Completion, which rolls up into Project Progress.
 11. Time and status data continuously feed the Employee Performance engine.

                                                                      7
12. Superior and Team Lead access Reports & Analytics at any point — by employee,
      team, project, or time period.

11. Recommended Architecture

A modular, layered architecture is recommended:

┌─────────────────────────────────────────┐

│  Presentation Layer (React)                │

│ Role-based dashboards, forms, charts │

├─────────────────────────────────────────┤

│  API Layer (Express + REST)                │

│ Auth middleware, route controllers         │

├─────────────────────────────────────────┤

│  Business Logic Layer                      │

│ Progress calculation, performance scoring│

│ Task status transitions, validation        │

├─────────────────────────────────────────┤

│  Data Access Layer (Prisma)                │

├─────────────────────────────────────────┤

│  Database (PostgreSQL)                     │

└─────────────────────────────────────────┘

This separation keeps business rules (like progress roll-up and performance scoring) inde-
pendent of both the API routing and the database layer, making the system easier to test and
extend.

12. Naming Recommendation

Rather than positioning this as a simple “Task Management System,” it is recommended to
frame it as:

       A Project Lifecycle, Team Task Management, Time Tracking and Employee
       Performance Analytics Platform.

This framing better reflects the depth of the system — full traceability from project assignment
down to individual performance metrics — and positions it as suitable for a real company
environment rather than a basic to-do app.

                    
