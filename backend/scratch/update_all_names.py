from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['roxai']

OLD_NAME = "Arun Kumar"
NEW_NAME = "Selvakumar G"

# 1. submissions - studentName field
r = db.submissions.update_many({'studentName': OLD_NAME}, {'$set': {'studentName': NEW_NAME}})
print(f"submissions.studentName       -> matched: {r.matched_count}, modified: {r.modified_count}")

# 2. similarity_results - studentAName
r = db.similarity_results.update_many({'studentAName': OLD_NAME}, {'$set': {'studentAName': NEW_NAME}})
print(f"similarity_results.studentAName -> matched: {r.matched_count}, modified: {r.modified_count}")

# 3. similarity_results - studentBName
r = db.similarity_results.update_many({'studentBName': OLD_NAME}, {'$set': {'studentBName': NEW_NAME}})
print(f"similarity_results.studentBName -> matched: {r.matched_count}, modified: {r.modified_count}")

# 4. clusters - students array (name field inside array elements)
clusters = list(db.clusters.find({'students.name': OLD_NAME}))
for cluster in clusters:
    updated_students = [
        {**s, 'name': NEW_NAME} if s.get('name') == OLD_NAME else s
        for s in cluster.get('students', [])
    ]
    db.clusters.update_one({'_id': cluster['_id']}, {'$set': {'students': updated_students}})
print(f"clusters.students[].name      -> updated {len(clusters)} cluster(s)")

# 5. timeline_events - studentName
r = db.timeline_events.update_many({'studentName': OLD_NAME}, {'$set': {'studentName': NEW_NAME}})
print(f"timeline_events.studentName   -> matched: {r.matched_count}, modified: {r.modified_count}")

# 6. timeline_events - correlatedWithStudent
r = db.timeline_events.update_many({'correlatedWithStudent': OLD_NAME}, {'$set': {'correlatedWithStudent': NEW_NAME}})
print(f"timeline_events.correlatedWithStudent -> matched: {r.matched_count}, modified: {r.modified_count}")

# 7. timeline_events - timeDeltaFromPrevious (string field with name embedded)
events = list(db.timeline_events.find({'timeDeltaFromPrevious': {'$regex': OLD_NAME}}))
for ev in events:
    new_val = ev['timeDeltaFromPrevious'].replace(OLD_NAME, NEW_NAME)
    db.timeline_events.update_one({'_id': ev['_id']}, {'$set': {'timeDeltaFromPrevious': new_val}})
print(f"timeline_events.timeDeltaFromPrevious -> updated {len(events)} event(s)")

# 8. students collection - name
r = db.students.update_many({'name': OLD_NAME}, {'$set': {'name': NEW_NAME}})
print(f"students.name                 -> matched: {r.matched_count}, modified: {r.modified_count}")

# 9. users collection (already done, verify)
user = db.users.find_one({'email': 'student@rox.ai'})
print(f"\nusers (student@rox.ai) name   -> {user['name'] if user else 'NOT FOUND'}")

print("\n✅ All done!")
