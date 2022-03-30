# Query a database

Database queries are regular SQL queries that are executed within a given connection. 

1. Right-click on a database connection you want to query and select **Add query...**.
2. Type a SQL query in the query field and click the "Run query" (![run query](/help/images/run-query.png)) button. 

   ![Database query](/help/images/access/database-query.gif)

   When the query is executed, the results are displayed below the query field. 

3. Optionally, give your query a name and click **Save** to save the query for later use.

## Query metadata

You can define query metadata, input and output parameters for a query. 


## Parameterized queries 

A parameterized query is a query with one or more input parameters. 
When you execute a parameterized query from the Datagrok UI, it prompts you to provide values for the parameters.
Each input parameter is presented as an input field.

Query input parameters can have default values, be represented as multiple-choice options, include results from another query, etc. 
For advanced use cases and in-depth examples, refer to the [Scripting](/help/compute/scripting) section.

Query parameters are defined as comments before the query text, in the following format:

```sql
--input: <type> <name> {= <value>} {<option>: <value>; ...} [<description>] 
```

|  Parameter         |  Description             |
|-----------|--------------------------|
| `<type>`     |  One of the following data types: <ul><li>`int`</li><li>`double`</li><li>`bool`</li><li>`string`</li><li>`datetime`</li><li>`list<T>` -- a list of type `T` (only `string` is supported). See [Lists as input parameters](#lists-as-input-parameters) below. </li></ul>     |
| `<name>`  |  The name of the query.   |
| `<value>`    |  The default value.    |
|  `{<option>: <value>; ...}` |  A list of options and their values.            |
|`<description>` |  The description of the parameter. The description shows up as a tooltip when you hover over the parameter name.  |


Example of a query with one parameter:

```sql
--input: string productName  
select * from products where productname = @productName
```

When you run this query, the following dialog appears:

![Query input dialog](/help/images/access/query-input-dialog.png)

<!-- {pattern: datetime} -->

### Lists as input parameters 

You can define an input parameter of type `list<string>` which requires that the user enter a comma-separated list of values in the query dialog.  
The given list of values can be used in the query.
However, note that lists can only be used in SQL operators that take a range of values, such as `ANY` or `ALL`.

Select customers from a specific list of countries:

```sql
--input: list<string> country =  
select companyname from customers where country = ANY(@country)
```

Select customers from countries other than the given list: 

```sql
--input: list<string> country =  
select companyname from customers where country <> ALL(@country)
```



### Drop-down lists 

An input parameter can be presented as a drop-down list with multiple values. 
The user has to select a value from the list in order to execute the query.
The values in the list can be predefined, or obtained by executing another query.

Example of a list with predefined values:

```sql
--input: string shipCountry = France {choices: ['France', 'Italy', 'Germany']}
```

Example of a list with values returned by another SQL query:

```sql
--input: string shipCountry = France {choices: Query("SELECT DISTINCT shipCountry FROM Orders")}
```

Example of a list with values returned by an existing data query:

```sql
--input: string shipCountry = France {choices: Demo:northwind:countries}
```

Here `Demo:northwind:countries` is a reference to the query named `countries` under connection `northwind` in package `Demo`.  

### Input fields with suggestions 

To define a list of suggested values for an input field, use the `suggestions` option:

```sql
--input: string shipCountry = France {suggestions: Demo:northwind:countries}
```

In this example, the list of suggestions is retrieved by executing an existing data query.  


<!-- TODO:Re-using input parameters -->

### Patterns 

In cases when you want to execute a query with SQL operators (such as `<`, `>`, `BETWEEN`, etc.) multiple times but each time use a different operator, you can define a query where the operator itself is an input parameter.
For such queries, Datagrok UI prompts you to select which operator to use and/or an optional input value.
Such types of input parameters are called "patterns".
In other words, patterns are input parameters that are transformed into SQL operators when you execute the query.

When an input parameter is defined as a pattern, the input field for the parameter has a menu button (![menu icon](/help/images/menu-icon.png)) next to it, which displays a list of available pattern strings.
Available pattern string are predefined and depend on the data type of the parameter.  

![Patterns](/help/images/access/patterns.gif)


Note that pattern strings are not always named after the operators they represent.
The description of all pattern strings is given below.

To define an input parameter based on a pattern:

1. Add a parameter of type `string` and use the `pattern: <pattern_type>` option in the parameter definition.
2. In the query, add a reference to the parameter in the format `@paramName(<column>)`.  

```sql
--input: string paramName = <value> {pattern: <type>}
select * from <table> where @paramName(<columnName>)
```

For example:

```sql
--input: string lastNameParam {pattern: string}
select * from employees where @lastNameParam(lastname) 
```

In this example, `lastNameParam` is a pattern of type `string`. 
When you run the query, the drop-down menu for the input field contains the following values: 

- `contains`
- `starts with`  
- `ends with` 
- `regex` 
- `in`

If use select `starts with` and enter "Doe" in the input field, the query returns all employees whose last name starts with "Doe". 


The following table lists the available values for each pattern type.


| Type               | Value         | Description or Example       |
|--------------------|---------------|------------------------------|
| `num, int, double` | `=`           | `= 100`                      |
|                    | `>`           | `> 1.02`                     |
|                    | `>=`          | `>= 4.1`                     |
|                    | `<`           | `< 5`                        |
|                    | `<=`          | `<= 2`                       |
|                    | `in`          | `in (1, 3, 10.2)`            |
|                    | `min-max`     | `Range: 1.5-10.0`            |
| `string`           | `contains`    | `contains ea`                |
|                    | `starts with` | `starts with R`              |
|                    | `ends with`   | `ends with w`                |
|                    | `regex`       | `regex 1(\w+)1`              |
|                    | `in`          | `in (ab, "c d", "e\\"f\\"")` |
| `datetime`         | `anytime`     |                              |
|                    | `today`       |                              |
|                    | `this week`   |                              |
|                    | `this month`  |                              |
|                    | `this year`   |                              |
|                    | `yesterday`   |                              |
|                    | `last week`   |                              |
|                    | `last month`  |                              |
|                    | `last year`   |                              |
|                    | `before`      | `before July 1984`           |
|                    | `after`       | `after March 2001`           |
|                    | `min-max`     | `Range: 1941-1945`           |



## Visual queries 

A visual query is an aggregation query that you build using the visual query builder.
The visual query builder allows you to create an aggregation query and display results as a grid. 

1. Open the Schema browser and navigate to the table you want to query.
2. Right-click on the table and select **Visual query...**. 

![Visual query](/help/images/access/visual-query.png)

To create an aggregation query:

1. In the **Columns** field, add table columns to pivot on (convert rows into columns).  
2. In the **Rows** field, add table columns to group by. 
3. In the **Measures** field, select the aggregation operation and the column. 
4. In the **Filters** field, select a column and enter a filter condition for that column. 

<!-- The result of the query is a table -->

## See also



