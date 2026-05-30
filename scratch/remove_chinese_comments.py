import os
import re

# Regex to match Chinese characters
CHINESE_RE = re.compile(r'[\u4e00-\u9fa5]')

def remove_chinese_comments(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    modified = False

    # 1. Handle HTML/XML comments: <!-- ... -->
    # We find all <!-- ... --> comments
    def replace_html_comment(match):
        nonlocal modified
        comment_text = match.group(0)
        if CHINESE_RE.search(comment_text):
            modified = True
            return ""
        return comment_text

    content = re.sub(r'<!--.*?-->', replace_html_comment, content, flags=re.DOTALL)

    # 2. Handle block comments: /* ... */
    def replace_block_comment(match):
        nonlocal modified
        comment_text = match.group(0)
        if CHINESE_RE.search(comment_text):
            modified = True
            return ""
        return comment_text

    content = re.sub(r'/\*.*?\*/', replace_block_comment, content, flags=re.DOTALL)

    # 3. Handle single-line comments: // ...
    # We must be careful not to match // inside strings or URLs (like http://)
    # Let's process line by line for single-line comments
    lines = content.splitlines()
    new_lines = []
    for line in lines:
        # Check if the line has //
        if '//' in line:
            # Simple check: split by //
            # E.g.: "const url = 'http://...' // comment"
            parts = line.split('//')
            # Find if any part after a split contains Chinese, but make sure it is indeed a comment.
            # A simple approximation: if the last part contains Chinese characters, and it starts after a //
            # Let's rebuild the line by keeping the code and removing the comment if the comment has Chinese.
            # We can find the index of the comment.
            # To be safe, we can use regex to find // not preceded by : (to avoid http://)
            comment_match = re.search(r'(?<!:)\/\/.*$', line)
            if comment_match:
                comment_text = comment_match.group(0)
                if CHINESE_RE.search(comment_text):
                    modified = True
                    # Remove the comment suffix
                    line = line[:comment_match.start()].rstrip()
        
        # If the line was entirely a Chinese comment and is now empty, we can skip it or keep it as empty.
        # Let's keep it to minimize line diff drift, or skip if it was a single line comment.
        new_lines.append(line)

    if modified:
        new_content = "\n".join(new_lines)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Modified: {file_path}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        # Exclude directories like node_modules, .nuxt, .git
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '.nuxt', '.output', 'dist')]
        for file in files:
            if file.endswith(('.js', '.ts', '.vue', '.json')):
                # Skip localization json files themselves
                if file.endswith('.json') and ('locales' in root or 'dicts' in root):
                    continue
                file_path = os.path.join(root, file)
                try:
                    remove_chinese_comments(file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    import sys
    target_dir = r"d:\Desktop\New folder"
    print(f"Scanning {target_dir} for Chinese comments...")
    process_directory(os.path.join(target_dir, "apps"))
    process_directory(os.path.join(target_dir, "packages"))
    process_directory(os.path.join(target_dir, "scripts"))
    print("Done!")
