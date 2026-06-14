from utils import get_version, load_approved, update_guide_cache_version, generate_qna_for_concept
import sys, os

if __name__ == "__main__":
  # 1. generate qna
  generate_qna_for_concept()

  # 2. load approved qna to db
  target_path = sys.argv[1]
  version = get_version(target_path)
  json_paths = os.listdir(f"{target_path}/v{version}/")
  
  for json_file in json_paths:
      if json_file.endswith(".json"):
          json_path = os.path.join(f"{target_path}/v{version}/", json_file)
          load_approved(json_file, json_path, version)

  # 3. update version guide_cache_version
  update_guide_cache_version(version)