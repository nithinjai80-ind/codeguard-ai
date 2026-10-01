import urllib.request
import json
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://localhost:5000/api"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_tests():
    print("[TEST 1] Testing /api/health...")
    status, res = make_req("/health")
    assert status == 200, f"Expected 200, got {status}"
    print(" -> Health check passed:", res)

    print("\n[TEST 2] Testing /api/auth/login (Tutor)...")
    status, res = make_req("/auth/login", method="POST", data={
        "email": "priya.kumar@nehru.ac.in",
        "password": "Tutor@123"
    })
    assert status == 200, f"Expected 200, got {status}: {res}"
    token = res.get("token")
    assert token, "Token not returned"
    print(" -> Login successful! User:", res.get("user"))

    print("\n[TEST 3] Testing /api/auth/me...")
    status, res = make_req("/auth/me", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(" -> Current user verification passed:", res)

    print("\n[TEST 4] Testing /api/auth/register (New Tutor)...")
    status, res = make_req("/auth/register", method="POST", data={
        "name": "Dr. Ananya Sen",
        "email": "ananya.sen@nehru.ac.in",
        "password": "Password@123",
        "role": "TUTOR",
        "department": "Computer Science and Engineering"
    })
    assert status == 201, f"Expected 201, got {status}: {res}"
    print(" -> Registration successful:", res.get("user"))

    print("\n[TEST 5] Testing /api/submissions...")
    status, submissions = make_req("/submissions", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(f" -> Fetched {len(submissions)} submissions.")

    print("\n[TEST 6] Testing /api/similarity/analyze...")
    status, sim_pair = make_req("/similarity/analyze", method="POST", data={
        "submissionAId": "SUB-1042",
        "submissionBId": "SUB-1049"
    }, token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(" -> Multi-stage similarity analysis result:")
    print("    Review Score:", sim_pair.get("reviewScore"))
    print("    Classification:", sim_pair.get("status"))
    print("    Structural:", sim_pair.get("structural"))
    print("    Semantic:", sim_pair.get("semantic"))
    print("    Behavioral:", sim_pair.get("behavioral"))
    print("    Timeline:", sim_pair.get("timeline"))
    print("    Evidence:", sim_pair.get("evidence"))
    print("    Transformations:", len(sim_pair.get("transformations", [])))

    print("\n[TEST 7] Testing /api/reviews (PATCH review decision)...")
    status, updated_rev = make_req("/reviews/PAIR-1", method="PATCH", data={
        "verdict": "RESOLVED_ACCEPTABLE",
        "notes": "Verified in viva voce: independent derivation confirmed.",
        "tutorName": "Dr. Priya Kumar"
    }, token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(" -> Updated review case:", updated_rev.get("id"), "Status:", updated_rev.get("status"))

    print("\n[TEST 8] Testing /api/clusters...")
    status, clusters = make_req("/clusters", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(f" -> Fetched {len(clusters)} clusters.")

    print("\n[TEST 9] Testing /api/timeline...")
    status, timeline = make_req("/timeline", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(f" -> Fetched {len(timeline)} timeline events.")

    print("\n[TEST 10] Testing /api/assignments...")
    status, assignments = make_req("/assignments", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(f" -> Fetched {len(assignments)} assignments.")

    print("\n[TEST 11] Testing /api/students...")
    status, students = make_req("/students", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(f" -> Fetched {len(students)} students.")

    print("\n[TEST 12] Testing /api/reports/dashboard...")
    status, reports = make_req("/reports/dashboard", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(" -> Dashboard reports summary:", {
        "totalSubmissions": reports.get("totalSubmissions"),
        "reviewCases": reports.get("reviewCases"),
        "averageSimilarity": reports.get("averageSimilarity")
    })

    print("\n[TEST 13] Testing /api/settings...")
    status, settings = make_req("/settings", token=token)
    assert status == 200, f"Expected 200, got {status}"
    print(" -> System settings weights:", settings.get("weights"))

    print("\n=======================================================")
    print("🎉 ALL 13 END-TO-END BACKEND API TESTS PASSED PERFECTLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
