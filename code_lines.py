import os


def count_code_lines():
    client_src = 'client/src'
    server_src = 'server/src'
    total_lines = 0

    for directory in [client_src, server_src]:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        total_lines += len(lines)

    return total_lines


print(count_code_lines())
