import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

try:
    from .database import SessionLocal, Base, engine
    from .models import (
        AssessmentQuestion,
        AttendanceRecord,
        College,
        ConceptNode,
        Course,
        CourseEnrollment,
        GatePass,
        HackathonEvent,
        KnowledgeState,
        MaintenanceTicket,
        MarkRecord,
        SyllabusTopic,
        TicketAuditLedger,
        TimetableEntry,
        User,
    )
    from .security import hash_password
except ImportError:
    from app.database import SessionLocal, Base, engine
    from app.models import (
        AssessmentQuestion,
        AttendanceRecord,
        College,
        ConceptNode,
        Course,
        CourseEnrollment,
        GatePass,
        HackathonEvent,
        KnowledgeState,
        MaintenanceTicket,
        MarkRecord,
        SyllabusTopic,
        TicketAuditLedger,
        TimetableEntry,
        User,
    )
    from app.security import hash_password

COLLEGE_INFO = ("northstar", "Northstar Institute of Technology", "NITX", "autonomous_enterprise", 200)

COURSES_DATA = [
    ("CS201", "Data Structures & Algorithms", "CSE", 4),
    ("CS301", "Operating Systems", "CSE", 4),
    ("CS401", "Machine Learning & AI", "CSE", 4),
    ("EC201", "Digital Signal Processing", "ECE", 4),
    ("EC301", "Microprocessors & Embedded Systems", "ECE", 3),
]

FACULTY_STAFF = [
    ("admin@nitx.demo", "admin", "Campus Administrator", "admin", "Administration"),
    ("dean.academics@nitx.demo", "dean123", "Dr. Manisha Sen", "dean", "Academics"),
    ("hod.cse@nitx.demo", "hod123", "Dr. Suresh Ramanathan", "hod", "CSE"),
    ("professor@nitx.demo", "professor", "Prof. Priya Mehta", "professor", "CSE"),
    ("prof.dsa@nitx.demo", "prof123", "Prof. Arvind Sharma", "professor", "CSE"),
    ("prof.os@nitx.demo", "prof123", "Prof. Sneha Verma", "professor", "CSE"),
    ("prof.ml@nitx.demo", "prof123", "Prof. Rajesh Kothari", "professor", "CSE"),
    ("prof.dsp@nitx.demo", "prof123", "Prof. Ananya Iyer", "professor", "ECE"),
    ("prof.embed@nitx.demo", "prof123", "Prof. Vikram Nair", "professor", "ECE"),
    ("technician@nitx.demo", "technician", "Sunil Verma", "technician", "Facilities"),
    ("tech.hardware@nitx.demo", "tech123", "Ramesh Kumar", "technician", "Hardware Lab"),
    ("tech.network@nitx.demo", "tech123", "Sanjay Patil", "technician", "IT Infrastructure"),
    ("warden.hostel@nitx.demo", "warden123", "Col. R.K. Bhalla", "warden", "Hostel Affairs"),
    ("recruiter@nitx.demo", "recruiter", "Apex Talent Partners", "recruiter", "Recruiting"),
]


def seed_database(db: Session | None = None):
    own_session = db is None
    db = db or SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        college_id, name, code, tier, count = COLLEGE_INFO
        college = db.query(College).filter(College.code == code).first()
        if not college:
            college = College(
                id=college_id,
                name=name,
                code=code,
                tier=tier,
                student_count=count,
            )
            db.add(college)
            db.flush()

        # 1. Seed Faculty, HoD, Dean, Technicians, Warden, Admin, Recruiter
        created_users = {}
        for email, password, full_name, role, dept in FACULTY_STAFF:
            user_id = f"usr-{email.split('@')[0].replace('.', '-')}"
            user = db.query(User).filter((User.email == email) | (User.id == user_id)).first()
            if not user:
                user = User(
                    id=user_id,
                    tenant_id=college.id,
                    email=email,
                    hashed_password=hash_password(password),
                    full_name=full_name,
                    role=role,
                    department=dept,
                    semester=5,
                    cgpa=8.5,
                )
                db.add(user)
                db.flush()
            created_users[email] = user

        # 2. Seed ~200 Students
        first_names = ["Aarav", "Isha", "Kabir", "Meera", "Rehan", "Anika", "Dev", "Sana", "Arjun", "Tara",
                       "Rohan", "Diya", "Karan", "Pooja", "Vikram", "Shreya", "Aditya", "Neha", "Nikhil", "Simran"]
        last_names = ["Sharma", "Kapoor", "Nair", "Shah", "Das", "Reddy", "Patel", "Khan", "Iyer", "Joshi",
                      "Bose", "Mehta", "Chopra", "Gupta", "Malhotra", "Verma", "Saxena", "Choudhury", "Menon", "Singh"]

        students = []
        for i in range(1, 201):
            email = f"student{i:03d}@nitx.demo"
            s_id = f"usr-student-{i:03d}"
            student = db.query(User).filter((User.email == email) | (User.id == s_id)).first()
            dept = "CSE" if i <= 120 else "ECE"
            if not student:
                full_name = "Student Demo" if i == 1 else f"{first_names[(i - 1) % len(first_names)]} {last_names[(i * 3) % len(last_names)]}"
                student = User(
                    id=s_id,
                    tenant_id=college.id,
                    email=email,
                    hashed_password=hash_password("student123"),
                    full_name=full_name,
                    role="student",
                    department=dept,
                    semester=5,
                    cgpa=round(6.2 + ((i * 13) % 36) / 10.0, 2),
                    karma_points=(i * 11) % 150,
                )
                db.add(student)
                db.flush()
            students.append(student)

        # 3. Seed 5 Courses across 2 Departments
        created_courses = {}
        for code_c, title_c, dept_c, credits_c in COURSES_DATA:
            course = db.query(Course).filter(Course.code == code_c, Course.tenant_id == college.id).first()
            if not course:
                prof_email = "professor@nitx.demo" if code_c == "CS301" else ("prof.dsa@nitx.demo" if code_c == "CS201" else "prof.dsp@nitx.demo")
                prof = created_users.get(prof_email)
                course = Course(
                    id=f"{college.id}-{code_c.lower()}",
                    tenant_id=college.id,
                    code=code_c,
                    title=title_c,
                    credits=credits_c,
                    department=dept_c,
                    semester=5,
                    professor_id=prof.id if prof else None,
                    syllabus_text=f"Comprehensive curriculum for {title_c} covering theoretical and algorithmic paradigms.",
                    co_po_config_json=json.dumps({
                        "CO1": ["PO1", "PO2"],
                        "CO2": ["PO1", "PO3", "PO5"],
                        "CO3": ["PO2", "PO4"],
                        "CO4": ["PO3", "PO8"],
                    }),
                )
                db.add(course)
                db.flush()
            created_courses[code_c] = course

        # 4. Seed Course Concepts & Prerequisites (OS 7 Concepts DAG for Phase 7)
        os_course = created_courses.get("CS301")
        if os_course:
            os_concepts = [
                ("OS-ARCH", "OS Architecture", []),
                ("OS-PROC", "Process Management", ["OS-ARCH"]),
                ("OS-SCHED", "CPU Scheduling", ["OS-PROC"]),
                ("OS-SYNC", "Semaphores & Mutex", ["OS-PROC"]),
                ("OS-DEADLOCK", "Deadlock Detection", ["OS-SYNC"]),
                ("OS-MEM", "Memory Management", ["OS-ARCH"]),
                ("OS-VMEM", "Virtual Memory", ["OS-MEM"]),
            ]
            for c_code, c_name, prereqs in os_concepts:
                existing_c = db.query(ConceptNode).filter(ConceptNode.course_id == os_course.id, ConceptNode.concept_code == c_code).first()
                if not existing_c:
                    db.add(ConceptNode(
                        tenant_id=college.id,
                        course_id=os_course.id,
                        concept_code=c_code,
                        name=c_name,
                        prereq_codes_json=json.dumps(prereqs),
                    ))
            db.flush()

            # Seed 5 Questions for CS301 with IRT tags
            q_defs = [
                ("Q1", "Explain OS dual-mode operation and privileged instructions.", "OS-ARCH", "CO1", "L2", 10.0, -0.8, 1.2),
                ("Q2", "Draw Process State Transition diagram and PCB fields.", "OS-PROC", "CO1", "L2", 10.0, -0.4, 1.4),
                ("Q3", "Calculate average waiting time under Round Robin scheduling (q=4).", "OS-SCHED", "CO2", "L3", 15.0, 0.2, 1.1),
                ("Q4", "Implement Peterson's solution for critical section mutual exclusion.", "OS-SYNC", "CO3", "L3", 15.0, 0.6, 1.3),
                ("Q5", "Run Banker's safety algorithm to detect system deadlock state.", "OS-DEADLOCK", "CO3", "L4", 20.0, 1.1, 1.5),
            ]
            for q_code, prompt, c_code, co_code, bloom, max_m, irt_b, irt_a in q_defs:
                existing_q = db.query(AssessmentQuestion).filter(AssessmentQuestion.course_id == os_course.id, AssessmentQuestion.q_code == q_code).first()
                if not existing_q:
                    db.add(AssessmentQuestion(
                        tenant_id=college.id,
                        course_id=os_course.id,
                        q_code=q_code,
                        prompt=prompt,
                        concept_code=c_code,
                        co_code=co_code,
                        bloom_level=bloom,
                        po_codes_json=json.dumps(["PO1", "PO2"]),
                        max_marks=max_m,
                        irt_b=irt_b,
                        irt_a=irt_a,
                    ))
            db.flush()

        # 5. Enroll Students, Attendance & Mastery Records
        for course_code, course in created_courses.items():
            dept_students = [s for s in students if s.department == course.department]
            for idx, student in enumerate(dept_students):
                # Enrollment
                enroll = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id, CourseEnrollment.student_id == student.id).first()
                if not enroll:
                    db.add(CourseEnrollment(
                        tenant_id=college.id,
                        course_id=course.id,
                        student_id=student.id,
                        semester=5,
                        attendance_percentage=78.5,
                        final_grade="A",
                    ))

                # Attendance Record: 28 total, 18-26 attended
                att_rec = db.query(AttendanceRecord).filter(AttendanceRecord.course_id == course.id, AttendanceRecord.student_id == student.id).first()
                if not att_rec:
                    attended = 17 + ((idx * 7) % 11)  # between 17 and 27
                    db.add(AttendanceRecord(
                        tenant_id=college.id,
                        student_id=student.id,
                        course_id=course.id,
                        attended_classes=attended,
                        total_classes=28,
                        remaining_classes=12,
                    ))

                # Mark Record for course
                mark_rec = db.query(MarkRecord).filter(MarkRecord.course_id == course.id, MarkRecord.student_id == student.id).first()
                if not mark_rec:
                    q_scores = {
                        "Q1": round(6.0 + ((idx * 3) % 5), 1),
                        "Q2": round(7.0 + ((idx * 2) % 4), 1),
                        "Q3": round(9.0 + ((idx * 5) % 7), 1),
                        "Q4": round(8.0 + ((idx * 4) % 8), 1),
                        "Q5": round(10.0 + ((idx * 7) % 11), 1),
                    }
                    total = sum(q_scores.values())
                    z_sc = round((total - 52.0) / 10.5, 2)
                    grade = "O" if z_sc >= 1.8 else ("A+" if z_sc >= 1.2 else ("A" if z_sc >= 0.6 else ("B+" if z_sc >= 0 else ("B" if z_sc >= -0.6 else ("C" if z_sc >= -1.5 else "F")))))
                    db.add(MarkRecord(
                        tenant_id=college.id,
                        student_id=student.id,
                        course_id=course.id,
                        question_scores_json=json.dumps(q_scores),
                        total_score=total,
                        z_score=z_sc,
                        letter_grade=grade,
                    ))

                # DKT Concept Mastery for Deadlock / Semaphores example
                if course_code == "CS301":
                    # Special student001 case for Phase 7 Deadlock demonstration:
                    # Deadlock Detection is failing (28%) because Semaphores & Mutex is at 41%
                    if idx == 0:
                        mastery_map = {
                            "OS-ARCH": 0.82,
                            "OS-PROC": 0.76,
                            "OS-SCHED": 0.68,
                            "OS-SYNC": 0.41,
                            "OS-DEADLOCK": 0.28,
                            "OS-MEM": 0.72,
                            "OS-VMEM": 0.65,
                        }
                    else:
                        base = 0.50 + ((idx * 17) % 45) / 100.0
                        mastery_map = {
                            "OS-ARCH": min(0.95, base + 0.1),
                            "OS-PROC": min(0.95, base + 0.05),
                            "OS-SCHED": min(0.95, base - 0.05),
                            "OS-SYNC": min(0.95, base - 0.1),
                            "OS-DEADLOCK": min(0.95, base - 0.15),
                            "OS-MEM": min(0.95, base),
                            "OS-VMEM": min(0.95, base - 0.08),
                        }
                    for c_code, p_k in mastery_map.items():
                        ks = db.query(KnowledgeState).filter(KnowledgeState.course_id == course.id, KnowledgeState.student_id == student.id, KnowledgeState.concept_code == c_code).first()
                        if not ks:
                            db.add(KnowledgeState(
                                tenant_id=college.id,
                                student_id=student.id,
                                course_id=course.id,
                                concept_code=c_code,
                                bkt_mastery=p_k,
                                dkt_mastery=p_k,
                                attempts=5,
                                correct_count=int(p_k * 5),
                            ))
            db.flush()

        # 6. Seed Weekly Timetable Grid
        if not db.query(TimetableEntry).first():
            timetable_slots = [
                ("Monday", "09:00", "10:00", "CS201", "Lecture Hall 101"),
                ("Monday", "11:00", "12:00", "CS301", "Turing Auditorium"),
                ("Tuesday", "10:00", "11:00", "CS401", "AI Lab Block B"),
                ("Tuesday", "14:00", "15:30", "CS301", "Turing Auditorium"),
                ("Wednesday", "09:00", "10:00", "EC201", "DSP Studio 3"),
                ("Wednesday", "11:00", "12:00", "CS201", "Lecture Hall 101"),
                ("Thursday", "10:00", "11:00", "EC301", "Embedded Systems Lab"),
                ("Thursday", "14:00", "15:00", "CS301", "Turing Auditorium"),
                ("Friday", "09:00", "10:30", "CS401", "AI Lab Block B"),
                ("Friday", "11:30", "12:30", "EC201", "DSP Studio 3"),
            ]
            for day, start, end, c_code, room in timetable_slots:
                course = created_courses.get(c_code)
                if course:
                    db.add(TimetableEntry(
                        tenant_id=college.id,
                        course_id=course.id,
                        day_of_week=day,
                        start_time=start,
                        end_time=end,
                        room=room,
                        professor_id=course.professor_id,
                        is_cancelled=False,
                    ))
            db.flush()

        # 7. Seed Syllabus Topics Tracker
        if not db.query(SyllabusTopic).first():
            os_course = created_courses.get("CS301")
            if os_course:
                topics = [
                    ("Introduction to Kernel Architectures & System Calls", True),
                    ("Process Lifecycle & Context Switching", True),
                    ("Preemptive Scheduling Algorithms (RR, SRTF)", True),
                    ("Critical Section Problem & Peterson's Algorithm", True),
                    ("Hardware Synchronization & Semaphores", False),
                    ("Classical Sync Problems: Dining Philosophers", False),
                    ("Banker's Algorithm & Deadlock Avoidance", False),
                    ("Paging, Segmentation & TLB Architecture", False),
                    ("Page Replacement Algorithms (LRU, FIFO, Clock)", False),
                ]
                for idx, (t_title, covered) in enumerate(topics, start=1):
                    db.add(SyllabusTopic(
                        tenant_id=college.id,
                        course_id=os_course.id,
                        topic_title=t_title,
                        order_index=idx,
                        is_covered=covered,
                        covered_at=datetime.now(timezone.utc) - timedelta(days=idx * 2) if covered else None,
                    ))
            db.flush()

        # 8. Seed Opportunity Radar Events
        if not db.query(HackathonEvent).first():
            events = [
                ("Prasunex Innovathon 2026", "Prasunex Campus Ecosystem", "2026-11-20", ["Cognitive OS", "AI", "FullStack"]),
                ("Smart India Hackathon 2026", "Ministry of Education & AICTE", "2026-12-15", ["Civic Tech", "Smart Education"]),
                ("Google Summer of Code Mentorship", "Google Open Source", "2027-01-15", ["OpenSource", "Distributed Systems"]),
                ("ACM ICPC Regional Championship", "ACM Chapter", "2026-12-05", ["Algorithms", "Competitive Programming"]),
            ]
            for e_title, org, dl, tags in events:
                db.add(HackathonEvent(
                    id=f"{college.id}-event-{uuid.uuid4().hex[:6]}",
                    tenant_id=college.id,
                    title=e_title,
                    organizer=org,
                    deadline=dl,
                    source="Official College Portal",
                    tags_json=json.dumps(tags),
                    teams_json="[]",
                ))
            db.flush()

        # 9. Seed Grievances with Campus Nodes & Hash-Chained Audit Ledger
        if not db.query(MaintenanceTicket).first():
            t1_id = f"{college.id}-ticket-101"
            now = datetime.now(timezone.utc)
            t1 = MaintenanceTicket(
                id=t1_id,
                tenant_id=college.id,
                reporter_id=students[0].id,
                title="Lab 2 Bench 14 Oscilloscope trace distorted",
                description="The Cathode Ray trace on the bench oscilloscope fluctuates erratically when probing 5V clock.",
                location="Lab 2 - Bench 14",
                vision_category="oscilloscope",
                vision_confidence=0.89,
                priority="High",
                priority_weight=2.4,
                status="Technician dispatched",
                sla_category="equipment",
                sla_deadline=now + timedelta(hours=38),
                escalation_level=0,
            )
            db.add(t1)
            db.flush()

            # Hash chained ledger row 1 (Creation)
            h0 = "0" * 64
            p1 = json.dumps({"action": "ticket_created", "reporter": students[0].id})
            h1 = TicketAuditLedger.compute_hash(h0, t1_id, "ticket_created", p1, now)
            l1 = TicketAuditLedger(
                tenant_id=college.id,
                ticket_id=t1_id,
                action="ticket_created",
                actor_id=students[0].id,
                prev_hash=h0,
                current_hash=h1,
                payload_json=p1,
                timestamp=now,
            )
            db.add(l1)

            # Hash chained ledger row 2 (Technician dispatched)
            p2 = json.dumps({"action": "status_change", "status": "Technician dispatched", "actor": "tech.hardware@nitx.demo"})
            t2_time = now + timedelta(minutes=15)
            h2 = TicketAuditLedger.compute_hash(h1, t1_id, "status_change", p2, t2_time)
            l2 = TicketAuditLedger(
                tenant_id=college.id,
                ticket_id=t1_id,
                action="status_change",
                actor_id=created_users["tech.hardware@nitx.demo"].id,
                prev_hash=h1,
                current_hash=h2,
                payload_json=p2,
                timestamp=t2_time,
            )
            db.add(l2)

            # Ticket 2: Hostel A Water Leak
            t2_id = f"{college.id}-ticket-102"
            t2 = MaintenanceTicket(
                id=t2_id,
                tenant_id=college.id,
                reporter_id=students[1].id,
                title="Hostel A Block 2nd floor washroom pipe leak",
                description="Continuous water leakage near Room 204 causing water logging on floor.",
                location="Hostel A - Water",
                vision_category="water/leak",
                vision_confidence=0.94,
                priority="Critical",
                priority_weight=3.8,
                status="Ticket verified",
                sla_category="hostel",
                sla_deadline=now + timedelta(hours=18),
                escalation_level=0,
            )
            db.add(t2)
            db.flush()

            p3 = json.dumps({"action": "ticket_created", "reporter": students[1].id})
            h3 = TicketAuditLedger.compute_hash(h0, t2_id, "ticket_created", p3, now)
            l3 = TicketAuditLedger(
                tenant_id=college.id,
                ticket_id=t2_id,
                action="ticket_created",
                actor_id=students[1].id,
                prev_hash=h0,
                current_hash=h3,
                payload_json=p3,
                timestamp=now,
            )
            db.add(l3)

        db.commit()
        print(f"Successfully seeded {college.name} ({college.code}):")
        print(f"  - 6 Faculty, 1 HoD, 1 Dean, 3 Technicians, 1 Warden, 1 Admin")
        print(f"  - {len(students)} Enrolled Students across CSE and ECE")
        print(f"  - 5 Courses with CO-PO configurations and Knowledge Graph Nodes")
        print(f"  - Timetable, Attendance Forecaster records, Syllabus topics, and Hash-chained Tickets")
    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
        raise
    finally:
        if own_session:
            db.close()


if __name__ == "__main__":
    seed_database()
