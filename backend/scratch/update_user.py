from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['roxai']
result = db.users.update_one(
    {'email': 'student@rox.ai'},
    {'$set': {'name': 'Selvakumar G'}}
)
print(f'Matched: {result.matched_count}, Modified: {result.modified_count}')

# Verify the change
user = db.users.find_one({'email': 'student@rox.ai'})
if user:
    print(f"Updated user: name={user['name']}, email={user['email']}")
