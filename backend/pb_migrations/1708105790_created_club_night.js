/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "l7nko7ve4o6yxqf",
    "created": "2024-02-16 17:49:50.947Z",
    "updated": "2024-02-16 17:49:50.947Z",
    "name": "club_night",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hnigk2t7",
        "name": "event_name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "lqxmdsfj",
        "name": "max_guests",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "aqliqpva",
        "name": "event_date",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("l7nko7ve4o6yxqf");

  return dao.deleteCollection(collection);
})
