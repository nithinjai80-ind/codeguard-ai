from typing import Dict, Any, List
from database import get_database
from services.analysis_engine.normalizer import CodeNormalizer
from services.analysis_engine.token_analyzer import TokenAnalyzer
from services.analysis_engine.ast_analyzer import ASTAnalyzer
from services.analysis_engine.semantic_analyzer import SemanticAnalyzer
from services.analysis_engine.behavioral_analyzer import BehavioralAnalyzer
from services.analysis_engine.timeline_analyzer import TimelineAnalyzer

class AnalysisPipeline:
    ANALYSIS_VERSION = "1.0"

    @staticmethod
    def get_pipeline_weights() -> Dict[str, float]:
        """Loads configurable similarity weights from MongoDB settings or returns default."""
        try:
            db = get_database()
            settings_doc = db.settings.find_one({"key": "similarity_settings"})
            if not settings_doc:
                settings_doc = db.settings.find_one({"key": "system_settings"})

            if settings_doc and "weights" in settings_doc:
                w = settings_doc["weights"]
                # Weights are in percentages (0-100) or floats (0.0-1.0)
                t_w = float(w.get("tokenWeight", w.get("token", 20)))
                s_w = float(w.get("structuralWeight", w.get("structural", 25)))
                sem_w = float(w.get("semanticWeight", w.get("semantic", 30)))
                b_w = float(w.get("behavioralWeight", w.get("behavioral", 15)))
                tm_w = float(w.get("timelineWeight", w.get("timeline", 10)))

                # Normalize to sum to 1.0
                total = t_w + s_w + sem_w + b_w + tm_w
                if total > 0:
                    return {
                        "token": t_w / total,
                        "structural": s_w / total,
                        "semantic": sem_w / total,
                        "behavioral": b_w / total,
                        "timeline": tm_w / total
                    }
        except Exception:
            pass

        # Standard default multi-signal weights:
        # Token: 20%, Structural: 25%, Semantic: 30%, Behavioral: 15%, Timeline: 10%
        return {
            "token": 0.20,
            "structural": 0.25,
            "semantic": 0.30,
            "behavioral": 0.15,
            "timeline": 0.10
        }

    @staticmethod
    def get_review_thresholds() -> Dict[str, float]:
        """Loads review thresholds from settings or defaults."""
        try:
            db = get_database()
            settings_doc = db.settings.find_one({"key": "similarity_settings"})
            if settings_doc:
                return {
                    "reviewThreshold": float(settings_doc.get("reviewThreshold", 80.0)),
                    "highThreshold": float(settings_doc.get("highSimilarityThreshold", 60.0)),
                    "moderateThreshold": float(settings_doc.get("moderateThreshold", 30.0))
                }
        except Exception:
            pass

        return {
            "reviewThreshold": 80.0,
            "highThreshold": 60.0,
            "moderateThreshold": 30.0
        }

    @classmethod
    def execute(cls, submission_a: Dict[str, Any], submission_b: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the multi-stage ROX AI code integrity pipeline:
        SUBMISSION A + SUBMISSION B
        -> CODE NORMALIZATION
        -> TOKEN ANALYSIS
        -> AST ANALYSIS
        -> VARIABLE RENAMING NORMALIZATION
        -> STRUCTURAL SIMILARITY
        -> SEMANTIC EMBEDDINGS & AI ANALYSIS
        -> BEHAVIORAL SIMILARITY
        -> TIMELINE INTELLIGENCE
        -> MULTI-SIGNAL EVIDENCE FUSION
        -> EXPLAINABLE REVIEW SCORE
        """
        code_a = submission_a.get("code", "")
        code_b = submission_b.get("code", "")
        lang_a = submission_a.get("language", "Java")
        lang_b = submission_b.get("language", "Java")

        # 1. Code Normalization (preserves originalCode, outputs normalizedCode)
        norm_a = CodeNormalizer.full_normalization(code_a, lang_a)
        norm_b = CodeNormalizer.full_normalization(code_b, lang_b)

        # 2. Token Analysis
        token_similarity, matching_regions = TokenAnalyzer.compute_similarity(
            norm_a["normalized"], norm_b["normalized"]
        )

        # 3. AST & Structural Analysis
        structural_similarity, ast_transformations = ASTAnalyzer.analyze_structure(
            norm_a["stripped"], norm_b["stripped"], lang_a
        )

        # 4. Semantic Embeddings & AI Analysis
        semantic_similarity, sem_transformations, ai_result = SemanticAnalyzer.analyze_semantics(
            norm_a["stripped"], norm_b["stripped"], lang_a, lang_b
        )

        # 5. Behavioral Similarity
        behavioral_similarity, behavioral_details = BehavioralAnalyzer.analyze_behavior(
            norm_a["stripped"], norm_b["stripped"], lang_a
        )

        # 6. Timeline Intelligence
        time_a = submission_a.get("timestamp") or submission_a.get("submittedAt") or submission_a.get("createdAt")
        time_b = submission_b.get("timestamp") or submission_b.get("submittedAt") or submission_b.get("createdAt")
        timeline_score, timeline_details = TimelineAnalyzer.analyze_timeline(time_a, time_b)

        # 7. Multi-Signal Evidence Fusion
        weights = cls.get_pipeline_weights()
        raw_review_score = (
            token_similarity * weights["token"] +
            structural_similarity * weights["structural"] +
            semantic_similarity * weights["semantic"] +
            behavioral_similarity * weights["behavioral"] +
            timeline_score * weights["timeline"]
        )
        review_score = round(raw_review_score, 1)

        # 8. Explainable Evidence Generation
        evidence = []
        if structural_similarity >= 75:
            evidence.append(
                f"Structural similarity: {structural_similarity:.0f}%. "
                "Both implementations share matching control-flow and AST structures."
            )
        if semantic_similarity >= 75:
            evidence.append(
                f"Semantic similarity: {semantic_similarity:.0f}%. "
                "Both implementations appear to execute equivalent algorithmic logic."
            )
        if token_similarity >= 70:
            evidence.append(
                f"Token similarity: {token_similarity:.0f}%. "
                "Identical or near-identical token and statement sequences detected."
            )
        if behavioral_similarity >= 75:
            evidence.append(
                f"Behavioral similarity: {behavioral_similarity:.0f}%. "
                "Both implementations demonstrate identical input/output transformations."
            )
        if timeline_details.get("timeline_anomaly"):
            delta_min = timeline_details.get("time_delta_minutes", 0)
            evidence.append(
                f"Timeline correlation: Submissions occurred within a short interval ({delta_min} minutes)."
            )

        # Gemini AI Analysis details
        if ai_result.get("source") in ("gemini", "gemini_retry"):
            approach = ai_result.get("algorithmicApproach", "")
            if approach:
                evidence.append(f"AI Algorithmic Insight: {approach}")
            concepts = ai_result.get("similarConcepts", [])
            if concepts:
                evidence.append(f"Shared Concepts: {', '.join(concepts[:4])}")

        if not evidence:
            evidence.append(
                "No strong similarity signals detected. "
                "Submissions appear independent based on available evidence."
            )

        # 9. Transformations Compilation
        transformations = []
        seen_types = set()
        for t in (ast_transformations + sem_transformations):
            if t["type"] not in seen_types:
                transformations.append(t)
                seen_types.add(t["type"])

        # Formatting divergence
        if norm_a["line_count"] != norm_b["line_count"] or code_a != code_b:
            if "FORMATTING_DIFFERENCE" not in seen_types:
                transformations.append({
                    "id": "TRANS-FMT-1",
                    "type": "FORMATTING_DIFFERENCE",
                    "title": "Whitespace & Formatting Divergence",
                    "detailA": f"{norm_a['line_count']} raw lines of source code",
                    "detailB": f"{norm_b['line_count']} raw lines of source code",
                    "explanation": "Formatting layouts differ, but underlying normalized structures match."
                })

        # 10. Classification (HUMAN-IN-THE-LOOP Principle - NEVER ACCUSE STUDENTS)
        thresholds = cls.get_review_thresholds()
        if review_score >= thresholds["reviewThreshold"]:
            classification = "REVIEW_REQUIRED"
        elif review_score >= thresholds["highThreshold"]:
            classification = "HIGH"
        elif review_score >= thresholds["moderateThreshold"]:
            classification = "MODERATE"
        else:
            classification = "LOW"

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
            "weights_used": weights,
            "ai_analysis": ai_result,
            "ai_available": ai_result.get("ai_available", False),
            "analysisVersion": cls.ANALYSIS_VERSION,
            "normalization": {
                "originalLineCountA": norm_a["line_count"],
                "originalLineCountB": norm_b["line_count"],
                "variableMappingA": norm_a.get("variable_mapping", {}),
                "variableMappingB": norm_b.get("variable_mapping", {}),
            }
        }
