import requests
import json
import sys
import datetime

BASE_URL = "http://localhost:8080/api/jobs"
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTc3NjUwNDg5NywiZXhwIjoxNzc2NTkxMjk3fQ.fnJGYj0lFnNxNYNFNi21oACKNEfkXwX909527onAKMs"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def check_accuracy():
    results = []
    
    # 1. Test Title Filter
    print("Testing Title Filter (search for 'Java')...")
    resp = requests.get(f"{BASE_URL}/filter?title=Java&size=10", headers=headers)
    if resp.status_code == 200:
        data = resp.json().get("data", [])
        accurate = all("java" in j["title"].lower() for j in data)
        results.append({"test": "Title Accuracy (Java)", "status": "PASS" if accurate else "FAIL", "count": len(data)})
    else:
        results.append({"test": "Title Accuracy (Java)", "status": f"ERROR {resp.status_code}"})

    # 2. Test Location Filter
    print("Testing Location Filter (search for 'Remote')...")
    resp = requests.get(f"{BASE_URL}/filter?location=Remote&size=10", headers=headers)
    if resp.status_code == 200:
        data = resp.json().get("data", [])
        accurate = all("remote" in j["location"].lower() for j in data)
        results.append({"test": "Location Accuracy (Remote)", "status": "PASS" if accurate else "FAIL", "count": len(data)})
    else:
        results.append({"test": "Location Accuracy (Remote)", "status": f"ERROR {resp.status_code}"})

    # 3. Test Employment Type
    print("Testing Employment Type Filter (Full-time)...")
    resp = requests.get(f"{BASE_URL}/filter?employmentType=Full-time&size=10", headers=headers)
    if resp.status_code == 200:
        data = resp.json().get("data", [])
        # The backend uses .equal() check for employmentType
        accurate = all(j["employmentType"] is not None and j["employmentType"].lower() == "full-time" for j in data)
        results.append({"test": "EmploymentType Accuracy (Full-time)", "status": "PASS" if accurate else "FAIL", "count": len(data)})
    else:
        results.append({"test": "EmploymentType Accuracy (Full-time)", "status": f"ERROR {resp.status_code}"})

    # 4. Test Cursor Pagination Stability
    print("Testing Cursor Pagination Consistency...")
    resp1 = requests.get(f"{BASE_URL}/filter?size=5", headers=headers)
    if resp1.status_code == 200:
        data1 = resp1.json().get("data", [])
        next_cursor = resp1.json().get("nextCursor")
        if next_cursor:
            resp2 = requests.get(f"{BASE_URL}/filter?size=5&lastId={next_cursor}", headers=headers)
            data2 = resp2.json().get("data", [])
            # Check for duplicates using link as unique identifier
            ids1 = {f"{j['link']}" for j in data1}
            ids2 = {f"{j['link']}" for j in data2}
            intersection = ids1.intersection(ids2)
            results.append({"test": "Pagination (No Duplicates)", "status": "PASS" if not intersection else "FAIL"})
        else:
            results.append({"test": "Pagination (No Duplicates)", "status": "N/A (No next cursor)"})

    # Summary Report
    print("\n--- TEST SUMMARY ---")
    for r in results:
        print(f"[{r['status']}] {r['test']} (Items: {r.get('count', 'N/A')})")

if __name__ == "__main__":
    check_accuracy()
