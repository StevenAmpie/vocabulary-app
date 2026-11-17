"""Print the top Wikimedia search candidates for manual visual curation."""

import sys
from build_verb_catalog import photo_candidates

for query in sys.argv[1:]:
    print(f"\n{query}")
    for candidate in photo_candidates(query)[:8]:
        print(" -", candidate["title"])
