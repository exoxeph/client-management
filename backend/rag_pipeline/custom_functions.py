"""
This file contains custom Python functions that will be used as transformation
steps within our main CocoIndex pipeline (main.py).
"""
import re
import dataclasses
from typing import Optional, Dict, List

# Define the structured output format for LLM-based relationship extraction
@dataclasses.dataclass
class CodeRelationship:
    source_entity_name: str
    relation_type: str # e.g., "CALLS", "IMPORTS", "DEFINES_FUNCTION"
    target_entity_name: str
    # Optional: You might add a 'confidence' score or 'line_numbers' here later



def get_language_from_filename(filename: str) -> Optional[str]:
    """
    Determines the programming language based on a file's extension.
    This helps CocoIndex's SplitRecursively function use the correct parser.
    
    Args:
        filename: The full path or name of the file.

    Returns:
        A string representing the language (e.g., 'python', 'javascript'), 
        or None if the language is not supported for special parsing.
    """
    extension_map = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.java': 'java',
        '.html': 'html',
        '.css': 'css',
    }
    # Get the file extension
    extension = '.' + filename.split('.')[-1]
    return extension_map.get(extension)

def extract_chunk_metadata(code_chunk: str) -> Dict[str, List[str]]:
    """
    Extracts simple, regex-based metadata like function and class names from a chunk of code.
    This provides basic labels. More complex relationships will be extracted by an LLM.
    
    Args:
        code_chunk: A string containing a piece of source code.

    Returns:
        A dictionary containing lists of found function and class names.
    """
    # Regex for Python functions (def func_name(...):)
    py_functions = re.findall(r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)", code_chunk)
    
    # Regex for JavaScript functions (function funcName(...), const funcName = (...) =>)
    js_functions = re.findall(r"(?:function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(|const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\()", code_chunk)
    # Flatten JS function matches and remove Nones
    js_functions_flat = [f for sublist in js_functions for f in sublist if f]

    # Regex for classes in Python or JavaScript (class ClassName)
    classes = re.findall(r"class\s+([a-zA-Z_][a-zA-Z0-9_]*)", code_chunk)

    return {
        "functions": list(set(py_functions + js_functions_flat)),
        "classes": list(set(classes))
    }