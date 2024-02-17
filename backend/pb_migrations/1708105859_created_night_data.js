/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ftm36u6nhttcbx8",
    "created": "2024-02-16 17:50:59.789Z",
    "updated": "2024-02-16 17:50:59.789Z",
    "name": "night_data",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "dfrzuoai",
        "name": "current_guests",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "xzhmhwho",
        "name": "club_night",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "l7nko7ve4o6yxqf",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
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
  const collection = dao.findCollectionByNameOrId("ftm36u6nhttcbx8");

  return dao.deleteCollection(collection);
})
