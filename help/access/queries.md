# Query data

## Overview

A data query is a request that returns a specific dataset from a specific data source in a tabular format.
You can create queries to all types of data sources: files, databases, and web services.


## Query files 

A file query represents a path to a file within a file share connected to Datagrok. 
When you run a file query, it returns the data from the given file.


1. Select a connection to a data source you want to query.
2. Enter query parameters:
   | Parameter     | Description              |
   |---------------|--------------------------|
   | **Name**          | The name of the query.   |
   |  **Path**         | The path to the file being queried. |
   |  **Table**        |      ?                | 

## Query databases

Database queries are regular SQL queries that are executed within a given connection. 


1. Right-click on a database connection you want to query and select **Add query...**.
2. Type a SQL query in the query field and click the "Run query" (![run query](/help/images/run-query.png)) button. 

   ![Database query](/help/images/access/database-query.gif)

   When the query is executed, the results are displayed below the query field. 

3. Optionally, give your query a name and click **Save** to save the query for later use.

### Query metadata

You can define query metadata, input and output parameters for a query. 


### Parameterized queries 

A parameterized query is a query with one or more input parameters. 
When you execute a parameterized query from the Datagrok UI, it prompts you to provide values for the parameters.  

Query input parameters can have default values, be represented as choises in the UI, include reults from another query, etc. 
For advanced use cases and in-depth examples, refer to the [Scription](/help/compute/scripting) section.


Query parameters are defined as comments before the query text, in the following format:

```sql
--input: <type> <name> {= <value>} {<option>: <value>; ...} [<description>] 
```

|  Parameter         |  Description             |
|-----------|--------------------------|
| `<type>`     |  One of the following data types: <ul><li>`int`</li><li>`double`</li><li>`bool`</li><li>`string`</li><li>`datetime`</li><li>`list<T>` -- a list of type `T` (only `string` is supported)</li></ul>     |
| `<name>`  |  The name of the query.   |
| `<value>`    |  The default value.    |
|  `{<option>: <value>; ...}` |  A list of options and their values.            |
|`<description>` |  The description of the parameter. The description shows up as a tooltip when you hover over the parameter name.  |


Example of a query with one parameter:

```sql
--input: string productName 
select * from products where productname = @productName
```

### Lists as input parameters


### Suggested values


