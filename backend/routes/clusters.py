from flask import Blueprint, jsonify
from database import get_database, serialize_doc

clusters_bp = Blueprint("clusters", __name__, url_prefix="/api/clusters")

@clusters_bp.route("", methods=["GET"])
def get_clusters():
    db = get_database()
    cursor = db.clusters.find()
    results = [serialize_doc(doc) for doc in cursor]
    return jsonify(results), 200

@clusters_bp.route("/<cluster_id>", methods=["GET"])
def get_cluster(cluster_id):
    db = get_database()
    cluster = db.clusters.find_one({"id": cluster_id})
    if not cluster:
        return jsonify({"error": f"Cluster {cluster_id} not found"}), 404
    return jsonify(serialize_doc(cluster)), 200
