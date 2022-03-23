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

A parameterized query is a query with one or more parameters. 
When you execute a parameterized query from the Datagrok UI, it prompts you to provide values for the parameters.  

Query parameters are defined as comments before the query text, in the following format:
```sql
--input: <type> <name> {= <value>} {<option>: <value>; ...} [<description>] 
```

* `<type>` is one of the following types:

    |       |               |
    |-----------|--------------------------|
    | `int`     | Integer scalar     |
    | `double`  | Float scalar       |
    | `bool`    |  Boolean scalar    |
    | `string`  | String             |
    | `datetime`| DateTime           |         
    | `dataframe` | ??  
    | `list<T>` | A list of type T (only `string` is supported)| 

* `<name>` -- the name of the query
* `<value>` -- the default value
* `{<option>: <value>; ...}` -- a list of options and their values 
* `<description>` -- the description of the parameter 




Example of a query with one parameter:

```sql
--input: string productName 
select * from products where productname = @productName
```

