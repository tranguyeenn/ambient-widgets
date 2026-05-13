import re

FILLER_WORDS = [
    "yeah",
    "uh",
    "ah",
    "ayy",
    "ooh",
    "oh",
    "la",
    "na",
    "woo",
    "huh",
]

BAD_PHRASES = [
    "embed",
    "you might also like",
    "contributors",
    "translations",
]

MEANINGLESS_PATTERNS = [
    r"^(yeah|uh|ah|ayy|ooh|oh|la|na|woo|huh)[\s,!\-']*$",
    r"^(\w+\s*)\1{2,}$",
]


def is_meaningful_line(line: str) -> bool:
    lowered = line.lower().strip()

    if len(line) < 18 or len(line) > 75:
        return False

    if any(phrase in lowered for phrase in BAD_PHRASES):
        return False

    if line.startswith("[") and line.endswith("]"):
        return False

    for pattern in MEANINGLESS_PATTERNS:
        if re.match(pattern, lowered):
            return False

    words = re.findall(r"[A-Za-zÀ-ỹ']+", lowered)

    if len(words) < 4:
        return False

    filler_count = sum(1 for word in words if word in FILLER_WORDS)

    if filler_count >= 2:
        return False

    unique_words = set(words)

    if len(unique_words) <= 2:
        return False

    if line.count("(") > 1 or line.count(")") > 1:
        return False

    if line.count(",") > 4:
        return False

    return True


def score_line(line: str) -> int:
    score = 0
    words = line.split()

    if 5 <= len(words) <= 12:
        score += 3

    if line.endswith("?"):
        score += 2

    if line.endswith("."):
        score += 1

    if "," not in line:
        score += 1

    if "(" not in line and ")" not in line:
        score += 2

    if len(line) <= 60:
        score += 2

    return score