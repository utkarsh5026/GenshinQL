import csv
import json


def csv_to_json(csv_file_path, json_file_path, cols_cnt=12):
    data = []

    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)

        for row in csv_reader:
            processed_row = {
                key: row[key] for key in list(row.keys())[:cols_cnt]
            }

            del_keys = []
            for key in processed_row:
                if key.startswith("\ufeff"):
                    del_keys.append(key)

            for key in del_keys:
                processed_row = {
                    key[1:]: processed_row[key],
                    **processed_row
                }
                del processed_row[key]
            data.append(processed_row)

    with open(json_file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4)

    print(f"JSON file created successfully: {json_file_path}")


def remove_bom(file_path):
    with open(file_path, 'rb') as file:
        content = file.read()
    if content.startswith(b'\xef\xbb\xbf'):
        content = content[3:]
    with open(file_path, 'wb') as file:
        file.write(content)


if __name__ == "__main__":
    csv_file_path = "characters.csv"
    json_file_path = "characters.json"
    csv_to_json(csv_file_path, json_file_path)
    remove_bom(json_file_path)
