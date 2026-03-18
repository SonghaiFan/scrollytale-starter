#!/usr/bin/env python3

import csv
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime


DATE_FORMATS = (
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%d/%m/%Y",
    "%m/%d/%Y",
    "%Y-%m",
    "%Y/%m",
    "%Y",
)


def infer_value_kind(value):
    if value is None:
        return "empty"

    text = str(value).strip()
    if not text:
        return "empty"

    for fmt in DATE_FORMATS:
        try:
            datetime.strptime(text, fmt)
            return "date"
        except ValueError:
            pass

    if re.fullmatch(r"-?\d+", text):
        return "integer"

    if re.fullmatch(r"-?(?:\d+\.\d+|\d+)", text):
        return "number"

    return "string"


def infer_column_type(values):
    non_empty = [str(value).strip() for value in values if str(value).strip()]
    if not non_empty:
        return "empty"

    kinds = Counter(infer_value_kind(value) for value in non_empty)
    count = len(non_empty)

    if (kinds["integer"] + kinds["number"]) == count:
        return "number"

    if kinds["date"] == count:
        return "date"

    unique_count = len(set(non_empty))
    average_length = sum(len(value) for value in non_empty) / count

    if unique_count <= 12 and average_length <= 24:
        return "categorical"

    return "text"


def summarize_column(name, values):
    cleaned = [str(value).strip() for value in values if str(value).strip()]
    inferred_type = infer_column_type(cleaned)
    sample_values = cleaned[:5]
    likely_identifier = False

    summary = {
        "name": name,
        "inferred_type": inferred_type,
        "non_empty_count": len(cleaned),
        "unique_count": len(set(cleaned)),
        "sample_values": sample_values,
    }

    if inferred_type == "number" and cleaned:
        numeric_values = [float(value) for value in cleaned]
        sorted_values = sorted(numeric_values)
        looks_like_counter = all(
            sorted_values[index] - sorted_values[index - 1] == 1
            for index in range(1, len(sorted_values))
        )
        name_lower = name.lower()
        likely_identifier = (
            name_lower == "id"
            or name_lower.endswith("_id")
            or name_lower.endswith("id")
            or (
                len(set(cleaned)) == len(cleaned)
                and all(float(value).is_integer() for value in numeric_values)
                and looks_like_counter
            )
        )
        summary["min"] = min(numeric_values)
        summary["max"] = max(numeric_values)
        summary["mean"] = round(sum(numeric_values) / len(numeric_values), 4)

    summary["likely_identifier"] = likely_identifier
    return summary


def is_identifier(column):
    return bool(column.get("likely_identifier"))


def build_suggestions(columns):
    numeric = [column["name"] for column in columns if column["inferred_type"] == "number"]
    measures = [column["name"] for column in columns if column["inferred_type"] == "number" and not is_identifier(column)]
    dates = [column["name"] for column in columns if column["inferred_type"] == "date"]
    categorical = [column["name"] for column in columns if column["inferred_type"] == "categorical"]
    text = [column["name"] for column in columns if column["inferred_type"] == "text"]

    line_x = dates[0] if dates else (numeric[0] if numeric else None)
    line_y = measures[0] if measures else None
    line_series = categorical[0] if categorical else None

    bar_x = categorical[0] if categorical else (text[0] if text else None)
    bar_y = measures[0] if measures else None

    return {
        "line_chart": {
            "x": line_x,
            "y": line_y,
            "series": line_series,
        },
        "bar_chart": {
            "x": bar_x,
            "y": bar_y,
        },
        "unit_chart": {
            "color": categorical[0] if categorical else None,
        },
        "story_angles": [
            "ranking comparison" if bar_x and bar_y else None,
            "change over time" if line_x and line_y else None,
            "composition by category" if categorical and numeric else None,
            "row-level distribution" if categorical else None,
        ],
    }


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: profile_csv.py <csv-path>")

    csv_path = sys.argv[1]
    if not os.path.exists(csv_path):
        raise SystemExit(f"CSV not found: {csv_path}")

    with open(csv_path, newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fieldnames = reader.fieldnames or []

    columns = [summarize_column(field, [row.get(field, "") for row in rows]) for field in fieldnames]
    suggestions = build_suggestions(columns)
    suggestions["story_angles"] = [angle for angle in suggestions["story_angles"] if angle]

    output = {
        "path": csv_path,
        "row_count": len(rows),
        "column_count": len(fieldnames),
        "columns": columns,
        "sample_rows": rows[:3],
        "suggestions": suggestions,
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
