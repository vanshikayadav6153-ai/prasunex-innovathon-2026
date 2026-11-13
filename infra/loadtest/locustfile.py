import random
from locust import HttpUser, task, between

class CampusNexusUser(HttpUser):
    wait_time = between(0.1, 0.5)

    def on_start(self):
        # Authenticate as student or faculty
        res = self.client.post("/api/auth/login", json={
            "email": "student001@nitx.demo",
            "password": "student123",
            "college_code": "NITX"
        })
        if res.status_code == 200:
            self.token = res.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.headers = {}

    @task(3)
    def test_health(self):
        self.client.get("/health")

    @task(2)
    def test_dashboard_overview(self):
        self.client.get("/api/dashboard/overview", headers=self.headers)

    @task(2)
    def test_timetable(self):
        self.client.get("/api/academic/timetable", headers=self.headers)

    @task(2)
    def test_attendance_forecaster(self):
        self.client.get("/api/academic/attendance/forecaster", headers=self.headers)

    @task(1)
    def test_dkt_graph(self):
        self.client.get("/api/dkt/graph/northstar-cs301", headers=self.headers)

    @task(1)
    def test_opportunities(self):
        self.client.get("/api/opportunities/events", headers=self.headers)

    @task(1)
    def test_metrics(self):
        self.client.get("/metrics")

    @task(1)
    def test_roi_calculator(self):
        self.client.post("/api/business/roi-calculator", json={
            "student_count": 2500,
            "legacy_erp_cost_per_student": 22.0,
            "legacy_maintenance_annual_usd": 15000.0,
            "tier_choice": "cognitive",
        })
