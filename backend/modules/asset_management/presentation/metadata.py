"""UI metadata — forms/tables are generated from this, never hardcoded (agent.md rule 6)."""
from __future__ import annotations


def asset_form_metadata() -> dict:
    return {
        "model": "asset",
        "fields": [
            {"name": "name", "label": "Asset Name", "type": "text", "required": True},
            {"name": "code", "label": "Asset Code", "type": "text", "readonly": True},
            {
                "name": "category_id",
                "label": "Category",
                "type": "many2one",
                "model": "asset.category",
                "required": True,
            },
            {"name": "purchase_price", "label": "Purchase Price", "type": "currency", "required": True},
            {"name": "status", "label": "Status", "type": "select",
             "options": ["draft", "active", "under_maintenance", "disposed", "written_off"]},
            {"name": "purchase_date", "label": "Purchase Date", "type": "date"},
            {"name": "location", "label": "Location", "type": "text"},
        ],
        "actions": [
            {"name": "allocate", "label": "Allocate", "permission": "asset.allocate"},
            {"name": "change_status", "label": "Change Status", "permission": "asset.update"},
        ],
    }


def asset_table_metadata() -> dict:
    return {
        "model": "asset",
        "columns": [
            {"field": "code", "header": "Code", "sortable": True},
            {"field": "name", "header": "Name", "sortable": True},
            {"field": "status", "header": "Status", "filterable": True},
            {"field": "current_value", "header": "Value", "sortable": True, "type": "currency"},
        ],
        "row_actions": ["view", "edit", "delete"],
        "bulk_actions": ["export", "delete"],
    }
