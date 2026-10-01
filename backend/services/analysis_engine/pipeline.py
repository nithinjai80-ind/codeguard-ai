from typing import Dict, Any, List
from database import get_database
from services.analysis_engine.normalizer import CodeNormalizer
from services.analysis_engine.token_analyzer import TokenAnalyzer
from services.analysis_engine.ast_analyzer import ASTAnalyzer
from services.analysis_engine.semantic_analyzer import SemanticAnalyzer
from services.analysis_engine.behavioral_analyzer import BehavioralAnalyzer
from services.analysis_engine.timeline_analyzer import TimelineAnalyzer

class AnalysisPipeline:
    @staticmethod
    def get_pipeline_weights() -> Dict[str, float]:
        """Loads configurable similarity weights from MongoDB settings or returns default."""
        try:
            db = get_database()
            settings_doc = db.settings.find_one({"key": "system_settings"})
            if settings_doc and "weights" in settings_doc:
                w = settings_doc["weights"]
                return {
                    "structural": float(w.get("structural", 0.30)),
                    "semantic": float(w.get("semantic", 0.30)),
                    "behavioral": float(w.get("behavioral", 0.20)),
                    "timeline": float(w.get("timeline", 0.20))
                }
        except Exception:
            pass

        # Default standard weights: Structural 30%, Semantic 30%, Behavioral 20%, Timeline 20%
        return {
            "structural": 0.30,
            "semantic": 0.30,
            "behavioral": 0.20,
            "timeline": 0.20
        }

    @classmethod
    def execute(cls, submission_a: Dict[str, Any], submission_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the multi-stage CodeGuard integrity intelligence pipeline:
        Source Code -> Normalization -> Token Analysis -> AST Analysis ->
        Semantic Embedding -> Behavioral Sandbox -> Timeline -> Evidence Fusion -> Explainable Review Score
        """
        code_a = submission_a.get("code", "")
        code_b = submission_b.get("code", "")
        lang_a = submission_a.get("language", "Java")
        lang_b = submission_b.get("language", "Java")

        # 1. Normalization
        norm_a = CodeNormalizer.full_normalization(code_a, lang_a)
        norm_b = CodeNormalizer.full_normalization(code_b, lang_b)

        # 2. Token Analysis
        token_similarity, matching_regions = TokenAnalyzer.compute_similarity(
            norm_a["normalized"], norm_b["normalized"]
        )

        # 3. AST / Structural Analysis
        structural_similarity, ast_transformations = ASTAnalyzer.analyze_structure(
            norm_a["stripped"], norm_b["stripped"], lang_a
        )

        # 4. Semantic Embedding Analysis
        semantic_similarity, sem_transformations = SemanticAnalyzer.analyze_semantics(
            norm_a["stripped"], norm_b["stripped"]
        )

        # 5. Behavioral Analysis (via Isolated Sandbox Interface)
        behavioral_similarity, behavioral_details = BehavioralAnalyzer.analyze_behavior(
            norm_a["stripped"], norm_b["stripped"], lang_a
        )

        # 6. Timeline Analysis
        time_a = submission_a.get("timestamp") or submission_a.get("submittedAt")
        time_b = submission_b.get("timestamp") or submission_b.get("submittedAt")
        timeline_score, timeline_details = TimelineAnalyzer.analyze_timeline(time_a, time_b)

        # 7. Evidence Fusion & Weighting
        weights = cls.get_pipeline_weights()
        raw_review_score = (
            structural_similarity * weights["structural"] +
            semantic_similarity * weights["semantic"] +
            behavioral_similarity * weights["behavioral"] +
            timeline_score * weights["timeline"]
        )
        review_score = round(raw_review_score, 1)

        # 8. Evidence Generation (Explainable AI Invariants)
        evidence = []
        if structural_similarity >= 70:
            evidence.append("Equivalent loop structure detected.")
            evidence.append("Multiple normalized code regions correspond.")
        if semantic_similarity >= 75:
            evidence.append("Similar variable relationships detected.")
            evidence.append("Equivalent expression transformation detected.")
        if timeline_details.get("timeline_anomaly"):
            evidence.append(f"Temporal correlation detected ({timeline_details.get('time_delta_minutes')} min delta).")
        if behavioral_similarity >= 80:
            evidence.append("Identical algorithmic execution invariants and complexity profile.")

        # Default fallback evidence if score is low
        if not evidence:
            evidence.append("Independent code structure with standard language idioms.")

        # 9. Transformations compilation
        transformations = []
        all_transforms = ast_transformations + sem_transformations
        seen_types = set()
        for t in all_transforms:
            if t["type"] not in seen_types:
                transformations.append(t)
                seen_types.add(t["type"])

        # Check for Formatting Differences
        if norm_a["line_count"] != norm_b["line_count"] or code_a != code_b:
            transformations.append({
                "id": "TRANS-FMT-1",
                "type": "FORMATTING_DIFFERENCE",
                "title": "Whitespace & Layout Divergence",
                "detailA": f"{norm_a['line_count']} raw lines of source",
                "detailB": f"{norm_b['line_count']} raw lines of source",
                "explanation": "Formatting layouts differ, but normalized syntax trees align."
            })

        # Classification (Explainable triage categories - NEVER PLAGIARISM VERDICT)
        if review_score >= 75:
            classification = "Review Required"
        elif review_score >= 50:
            classification = "Investigate"
        else:
            classification = "Cleared"

        return {
            "token_similarity": token_similarity,
            "structural_similarity": structural_similarity,
            "semantic_similarity": semantic_similarity,
            "behavioral_similarity": behavioral_similarity,
            "timeline_score": timeline_score,
            "review_score": review_score,
            "classification": classification,
            "evidence": evidence,
            "transformations": transformations,
            "matching_regions": matching_regions,
            "behavioral_details": behavioral_details,
            "timeline_details": timeline_details,
            "weights_used": weights
        }
