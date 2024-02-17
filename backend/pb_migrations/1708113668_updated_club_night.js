/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l7nko7ve4o6yxqf")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "chohjide",
    "name": "current_guests",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null,
      "noDecimal": false
    }
  }))

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qjupglgx",
    "name": "is_active",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l7nko7ve4o6yxqf")

  // remove
  collection.schema.removeField("chohjide")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qjupglgx",
    "name": "is_Active",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
