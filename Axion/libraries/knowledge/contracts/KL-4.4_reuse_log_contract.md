{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "schema_version": "1.0.0",
  "contract_id": "KL-4.4b",
  "title": "Reuse Log Entry Schema",
  "type": "object",
  "required": [
    "kid",
    "reuse_type",
    "excerpt_size",
    "target",
    "justification",
    "recorded_at"
  ],
  "properties": {
    "kid": {
      "type": "string",
      "minLength": 8
    },
    "reuse_type": {
      "type": "string",
      "enum": [
        "prose_excerpt",
        "code_excerpt",
        "table_excerpt"
      ]
    },
    "excerpt_size": {
      "type": "object",
      "required": [
        "words",
        "lines"
      ],
      "properties": {
        "words": {
          "type": "integer",
          "minimum": 0
        },
        "lines": {
          "type": "integer",
          "minimum": 0
        }
      },
      "additionalProperties": false
    },
    "target": {
      "type": "object",
      "required": [
        "artifact_id",
        "path",
        "section"
      ],
      "properties": {
        "artifact_id": {
          "type": "string",
          "minLength": 2
        },
        "path": {
          "type": "string",
          "minLength": 2
        },
        "section": {
          "type": "string",
          "minLength": 1
        }
      },
      "additionalProperties": false
    },
    "justification": {
      "type": "string",
      "minLength": 3,
      "description": "Why reuse was necessary vs paraphrase"
    },
    "recorded_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}