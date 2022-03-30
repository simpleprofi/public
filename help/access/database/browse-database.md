# Browse database contents and schemas

Some database connectors including PostgreSQL, MySQL, MS SQL, Maria DB, and Oracle provide support for visual schema browsing.
<!-- If you right-click on a connection to a database that supports this capability, you will see the **Browse schema** item in the menu. -->

## Browse schema 

Database connections that support schema browsing have a sub-item called "Schemas", which contains all schemas obtained from the connection.
If there is only one schema, Datagrok displays "Tables" from that schema for simplicity (removes the top-level "Schema" item). 
You can expand that item and browse the hierarchy of schemas, tables, and columns.


## View properties of schema objects

When you browse a database schema, you can view the properties of any object by clicking on it.
The properties are displayed in the right-hand property panel.

![Object properties](/help/images/access/schema-properties.png)

## Query tables from schema browser

You can quickly query the database from the schema browser via actions. 
Actions are commands that you can perform on tables or columns, such as execute a `SELECT` query on a table.
The list of actions for a schema object is displayed in the right-hand property panel when you click on the object, or in the right-click menu. 
Actions are context-dependent, that is, the results of an action vary depending on the type or number of objects selected. 
For example, if multiple tables are selected, the action is performed for each table.


### Table actions

To view table actions, right-click on a table.
Alternatively, select a table in the schema browser and navigate to the **Actions** item in the right-hand property panel.

![Table actions](/help/images/access/table-actions.png)

| Action         | Description  |
| -------------- | ------------------------------------------------ |
| Get All        |  Get all data from the selected tables and open results in a [table view](/help/overview/table-view.html).  |
| Get Top 100     | Get top 100 rows from the selected tables and open results in a [table view](/help/overview/table-view.html). |
| New SQL Query... | Open a [new query panel](/help/access/database/query-database.html).|
| Build Query...   | Open the query builder window for each selected table. |
| Visual Query...  | Open the [visual query editor](/help/access/database/visual-queries.html). |

### Column actions

To view column actions (commands), select multiple columns while holding down the `Ctrl` key. 
The list of action is displayed in the right-hand property panel. 

![Column actions](/help/images/access/column-actions.png)

| Action         | Description  |
| -------------- | ------------------------------------------------ |
| Get All        |  Get all data from the selected columns and open results in a [table view](/help/overview/table-view.html).  |
| Get Top 100     | Get top 100 rows from the selected columns and open results in a [table view](/help/overview/table-view.html).. |



## See also

* [Query a database](/help/access/database/query-database.html)

