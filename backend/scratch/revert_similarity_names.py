from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['roxai']

OLD_NAME = "Selvakumar G"
NEW_NAME = "Arun Kumar"

# 1. submissions - revert studentName for NIT-CS-2024-042 submissions only
r = db.submissions.update_many(
    {'studentName': OLD_NAME, 'studentId': 'NIT-CS-2024-042'},
    {'$set': {'studentName': NEW_NAME}}
)
print(f"submissions (NIT-CS-2024-042)   -> matched: {r.matched_count}, modified: {r.modified_count}")

# 2. similarity_results - studentAName
r = db.similarity_results.update_many({'studentAName': OLD_NAME}, {'$set': {'studentAName': NEW_NAME}})
print(f"similarity_results.studentAName -> matched: {r.matched_count}, modified: {r.modified_count}")

# 3. similarity_results - studentBName
r = db.similarity_results.update_many({'studentBName': OLD_NAME}, {'$set': {'studentBName': NEW_NAME}})
print(f"similarity_results.studentBName -> matched: {r.matched_count}, modified: {r.modified_count}")

# 4. clusters - students array (name field)
clusters = list(db.clusters.find({'students.name': OLD_NAME}))
for cluster in clusters:
    updated_students = [
        {**s, 'name': NEW_NAME} if s.get('name') == OLD_NAME else s
        for s in cluster.get('students', [])
    ]
    db.clusters.update_one({'_id': cluster['_id']}, {'$set': {'students': updated_students}})
print(f"clusters.students[].name        -> updated {len(clusters)} cluster(s)")

# 5. timeline_events - studentName (only for NIT-CS-2024-042)
r = db.timeline_events.update_many(
    {'studentName': OLD_NAME, 'studentId': 'NIT-CS-2024-042'},
    {'$set': {'studentName': NEW_NAME}}
)
print(f"timeline_events.studentName     -> matched: {r.matched_count}, modified: {r.modified_count}")

# 6. timeline_events - correlatedWithStudent
r = db.timeline_events.update_many({'correlatedWithStudent': OLD_NAME}, {'$set': {'correlatedWithStudent': NEW_NAME}})
print(f"timeline_events.correlatedWith  -> matched: {r.matched_count}, modified: {r.modified_count}")

# 7. timeline_events - timeDeltaFromPrevious string
events = list(db.timeline_events.find({'timeDeltaFromPrevious': {'$regex': OLD_NAME}}))
for ev in events:
    new_val = ev['timeDeltaFromPrevious'].replace(OLD_NAME, NEW_NAME)
    db.timeline_events.update_one({'_id': ev['_id']}, {'$set': {'timeDeltaFromPrevious': new_val}})
print(f"timeline_events.timeDelta       -> updated {len(events)} event(s)")

# 8. students collection (NIT-CS-2024-042 only)
r = db.students.update_many({'id': 'NIT-CS-2024-042', 'name': OLD_NAME}, {'$set': {'name': NEW_NAME}})
print(f"students (NIT-CS-2024-042)      -> matched: {r.matched_count}, modified: {r.modified_count}")

# Verify - keep Selvakumar G in users
user = db.users.find_one({'email': 'student@rox.ai'})
print(f"\nusers (student@rox.ai)          -> {user['name'] if user else 'NOT FOUND'} [UNCHANGED]")

# Verify similarity_results
pair1 = db.similarity_results.find_one({'id': 'PAIR-1'})
if pair1:
    print(f"similarity PAIR-1               -> A: {pair1['studentAName']}  B: {pair1['studentBName']}")
pair2 = db.similarity_results.find_one({'id': 'PAIR-2'})
if pair2:
    print(f"similarity PAIR-2               -> A: {pair2['studentAName']}  B: {pair2['studentBName']}")

print("\nDone!")
