import re
from typing import Dict, Tuple, List

class CodeNormalizer:
    @staticmethod
    def strip_comments_and_docstrings(code: str, language: str = "Java") -> str:
        """Removes single-line and multi-line comments and docstrings."""
        if not code:
            return ""
        
        # Python comments and docstrings
        if language.lower() == "python":
            # Multi-line strings used as docstrings
            code = re.sub(r'"""[\s\S]*?"""', '', code)
            code = re.sub(r"'''[\s\S]*?'''", '', code)
            # Single-line comments
            code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
        else:
            # C, C++, Java, JS comments
            # Multi-line
            code = re.sub(r'/\*[\s\S]*?\*/', '', code)
            # Single-line
            code = re.sub(r'//.*$', '', code, flags=re.MULTILINE)
            
        return code

    @staticmethod
    def normalize_whitespace(code: str) -> str:
        """Standardizes tabs, newlines, and trailing spaces."""
        lines = code.splitlines()
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        return "\n".join(cleaned_lines)

    @classmethod
    def normalize_identifiers(cls, code: str, language: str = "Java") -> Tuple[str, Dict[str, str]]:
        """
        Replaces user-defined variable identifiers with normalized symbols (var_1, var_2...)
        while preserving language keywords.
        """
        keywords = {
            "python": {"def", "class", "return", "if", "elif", "else", "for", "while", "in", "import", "from", "as", "try", "except", "finally", "with", "lambda", "None", "True", "False", "print", "len", "range", "self"},
            "java": {"public", "private", "protected", "class", "interface", "void", "int", "double", "float", "boolean", "char", "String", "return", "if", "else", "for", "while", "new", "static", "final", "System", "out", "println"},
            "javascript": {"function", "const", "let", "var", "return", "if", "else", "for", "while", "new", "class", "import", "export", "console", "log"},
            "c++": {"int", "float", "double", "char", "void", "return", "if", "else", "for", "while", "class", "struct", "namespace", "using", "std", "cout", "cin", "endl"}
        }

        lang_keywords = keywords.get(language.lower(), keywords["java"])
        
        # Simple identifier regex
        tokens = re.findall(r'\b[A-Za-z_][A-Za-z0-9_]*\b', code)
        var_map = {}
        counter = 1

        for token in tokens:
            if token not in lang_keywords and not token.isdigit():
                if token not in var_map:
                    var_map[token] = f"v{counter}"
                    counter += 1

        # Replace identifiers with mapped symbols
        def replace_token(match):
            tok = match.group(0)
            return var_map.get(tok, tok)

        normalized_code = re.sub(r'\b[A-Za-z_][A-Za-z0-9_]*\b', replace_token, code)
        return normalized_code, var_map

    @classmethod
    def full_normalization(cls, code: str, language: str = "Java") -> Dict:
        """Executes full normalization pipeline."""
        stripped = cls.strip_comments_and_docstrings(code, language)
        whitespace_norm = cls.normalize_whitespace(stripped)
        id_norm, var_map = cls.normalize_identifiers(whitespace_norm, language)
        
        return {
            "original": code,
            "stripped": stripped,
            "normalized": id_norm,
            "variable_mapping": var_map,
            "line_count": len(code.splitlines()),
            "normalized_line_count": len(id_norm.splitlines())
        }
