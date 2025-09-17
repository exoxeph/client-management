"""
This file contains custom Python functions that will be used as transformation
steps within our main CocoIndex pipeline (main.py).
"""
import re
from typing import Optional, Dict, List

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
    Extracts key code entities like function and class names from a chunk of code.
    This uses simple regular expressions and is a starting point.
    
    Args:
        code_chunk: A string containing a piece of source code.

    Returns:
        A dictionary containing lists of found function and class names.
    """
    # Regex for Python functions (def func_name(...):)
    py_functions = re.findall(r"def\s+([a-zA-Z_][a-zA-Z0-9_]*)", code_chunk)
    
    # Regex for JavaScript functions (function funcName(...), const funcName = (...) =>)
    js_functions = re.findall(r"function\s+([a-zA-Z_][a-zA-Z0-9_]*)", code_chunk)
    js_arrow_functions = re.findall(r"const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(", code_chunk)

    # Regex for classes in Python or JavaScript (class ClassName)
    classes = re.findall(r"class\s+([a-zA-Z_][a-zA-Z0-9_]*)", code_chunk)

    return {
        "functions": list(set(py_functions + js_functions + js_arrow_functions)),
        "classes": list(set(classes))
    }